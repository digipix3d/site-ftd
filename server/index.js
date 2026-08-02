import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORTA        = Number(process.env.PORT ?? 3000);
const DIR_ESTATICO = process.env.DIR_ESTATICO ?? join(__dirname, '..', 'dist');
const DIR_DADOS    = process.env.DIR_DADOS ?? '/data';
const ARQ_ESTADO   = join(DIR_DADOS, 'instagram.json');

const IG_USER_ID = process.env.IG_USER_ID ?? '';
const TOKEN_INICIAL = process.env.IG_TOKEN ?? '';

const MAX_POSTS       = 12;
const CACHE_MS        = 60 * 60 * 1000;        // busca posts no máximo 1x por hora
const REFRESH_TOKEN_MS = 24 * 60 * 60 * 1000;  // tenta renovar o token 1x por dia
const TIMEOUT_MS      = 8000;

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  trustProxy: true,
});

/**
 * Estado persistido em volume. Sobrevive a restart do container — é isso que
 * garante que o feed continue no ar mesmo se a API da Meta estiver fora no boot.
 */
let estado = {
  token: TOKEN_INICIAL,
  // Qual token do ambiente já foi adotado. É o que distingue "o operador pôs
  // um token novo no .env" de "o token em disco foi renovado" — sem isso não
  // dá para saber qual dos dois é mais recente.
  tokenSemente: TOKEN_INICIAL,
  tokenAtualizadoEm: 0,
  posts: [],
  postsAtualizadosEm: 0,
};

async function carregarEstado() {
  try {
    const bruto = JSON.parse(await readFile(ARQ_ESTADO, 'utf8'));
    estado = { ...estado, ...bruto };

    // O IG_TOKEN do .env é SEMENTE, não mandão. Comparamos com a semente já
    // adotada, não com o token em uso: o token em uso muda a cada renovação,
    // então comparar com ele fazia todo restart descartar o renovado e voltar
    // ao original do .env — que morre em 60 dias e derruba o feed em silêncio.
    //
    // Trocar o token continua simples: valor novo no .env, ele é adotado.
    if (TOKEN_INICIAL && TOKEN_INICIAL !== bruto.tokenSemente) {
      app.log.info('IG_TOKEN novo no ambiente — adotando');
      estado.token = TOKEN_INICIAL;
      estado.tokenSemente = TOKEN_INICIAL;
      estado.tokenAtualizadoEm = 0;
    } else if (bruto.token) {
      // Mesma semente de antes: o de disco está renovado e é o que vale.
      estado.token = bruto.token;
    }
    app.log.info(`estado carregado: ${estado.posts.length} posts em cache`);
  } catch {
    app.log.info('sem estado anterior, começando do zero');
  }
}

async function salvarEstado() {
  try {
    await mkdir(DIR_DADOS, { recursive: true });
    await writeFile(ARQ_ESTADO, JSON.stringify(estado, null, 2));
  } catch (erro) {
    app.log.error({ erro: erro.message }, 'não consegui salvar o estado');
  }
}

async function buscar(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    const corpo = await r.json();
    if (!r.ok) {
      throw new Error(corpo?.error?.message ?? `HTTP ${r.status}`);
    }
    return corpo;
  } finally {
    clearTimeout(t);
  }
}

/** Renova o token de longa duração. Precisa rodar antes dos 60 dias. */
async function renovarToken() {
  if (!estado.token) return;
  const idade = Date.now() - estado.tokenAtualizadoEm;
  if (idade < REFRESH_TOKEN_MS) return;

  try {
    const r = await buscar(
      'https://graph.instagram.com/refresh_access_token' +
      `?grant_type=ig_refresh_token&access_token=${encodeURIComponent(estado.token)}`
    );
    if (r.access_token) {
      estado.token = r.access_token;
      estado.tokenAtualizadoEm = Date.now();
      await salvarEstado();
      app.log.info(`token renovado, expira em ${Math.round((r.expires_in ?? 0) / 86400)} dias`);
    }
  } catch (erro) {
    // Não é fatal: o token antigo ainda vale por um tempo. Só registra.
    app.log.warn({ erro: erro.message }, 'falha ao renovar o token do Instagram');
  }
}

/** Busca os posts. Nunca lança — em caso de erro mantém o último feed bom. */
async function atualizarPosts(forcar = false) {
  if (!estado.token || !IG_USER_ID) return;
  if (!forcar && Date.now() - estado.postsAtualizadosEm < CACHE_MS) return;

  const campos = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
  try {
    const r = await buscar(
      `https://graph.instagram.com/v21.0/${IG_USER_ID}/media` +
      `?fields=${campos}&limit=${MAX_POSTS}&access_token=${encodeURIComponent(estado.token)}`
    );
    const posts = (r.data ?? []).map((p) => ({
      id: p.id,
      caption: p.caption ?? '',
      media_type: p.media_type,
      media_url: p.media_url,
      thumbnail_url: p.thumbnail_url,
      permalink: p.permalink,
      timestamp: p.timestamp,
    }));
    if (posts.length) {
      estado.posts = posts;
      estado.postsAtualizadosEm = Date.now();
      await salvarEstado();
      app.log.info(`feed atualizado: ${posts.length} posts`);
    }
  } catch (erro) {
    app.log.warn({ erro: erro.message }, 'falha ao buscar o feed — mantendo o cache');
  }
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

app.get('/api/instagram', async (req, reply) => {
  // dispara a atualização sem travar a resposta: quem pede agora recebe o cache
  atualizarPosts().catch(() => {});

  reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return {
    posts: estado.posts.slice(0, 6),
    atualizadoEm: estado.postsAtualizadosEm || null,
  };
});

app.get('/api/saude', async () => ({
  ok: true,
  temToken: Boolean(estado.token),
  temUserId: Boolean(IG_USER_ID),
  posts: estado.posts.length,
  feedAtualizadoEm: estado.postsAtualizadosEm || null,
}));

await app.register(fastifyStatic, {
  root: DIR_ESTATICO,
  // Sem isto o plugin aplica o padrão dele (max-age=0) por cima do que
  // definimos abaixo, e todo o cache vai por água abaixo.
  cacheControl: false,
  // hashes no nome do arquivo permitem cache longo com segurança
  setHeaders(res, caminho) {
    if (/\/_astro\//.test(caminho)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(woff2|glb)$/.test(caminho)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=600');
    }
  },
});

/**
 * Página de 404 carregada na memória na subida.
 *
 * Não dá para usar `reply.sendFile()` aqui: `app.register()` encapsula, então o
 * decorador do @fastify/static só existe dentro do contexto do plugin, e este
 * handler roda na raiz. Chamá-lo lançava TypeError e derrubava o processo — e
 * quem dispara 404 aos milhares numa VPS pública é varredura de bot.
 *
 * Servir da memória também evita ida ao disco a cada 404, que é exatamente
 * quando eles chegam em rajada.
 */
let pagina404 = '<!doctype html><meta charset="utf-8"><title>404</title><p>Página não encontrada.';

async function carregarPagina404() {
  try {
    pagina404 = await readFile(join(DIR_ESTATICO, '404.html'), 'utf8');
  } catch (erro) {
    app.log.warn({ erro: erro.message }, '404.html não encontrado; usando página mínima');
  }
}

// 404 devolve a página de erro do site, não JSON
app.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith('/api/')) {
    return reply.code(404).send({ erro: 'rota não encontrada' });
  }
  return reply.code(404).type('text/html; charset=utf-8').send(pagina404);
});

// ---------------------------------------------------------------------------
// Sobe
// ---------------------------------------------------------------------------

await carregarEstado();
await carregarPagina404();

if (!estado.token || !IG_USER_ID) {
  app.log.warn(
    'IG_TOKEN e/ou IG_USER_ID ausentes — /api/instagram vai devolver lista vazia ' +
    'e o site mostra o link do perfil no lugar do feed. Veja INSTAGRAM.md.'
  );
} else {
  renovarToken().then(() => atualizarPosts(true)).catch(() => {});
  setInterval(() => { renovarToken().catch(() => {}); }, REFRESH_TOKEN_MS);
  setInterval(() => { atualizarPosts().catch(() => {}); }, CACHE_MS);
}

for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, async () => {
    app.log.info(`${sinal} recebido, encerrando`);
    await app.close();
    process.exit(0);
  });
}

await app.listen({ port: PORTA, host: '0.0.0.0' });
