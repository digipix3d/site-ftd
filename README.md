# Site da Fábrica de Trecos

Site estático em Astro + um servidor pequeno para o feed do Instagram,
empacotados em container.

## Rodar na sua máquina

Precisa de **Node 22 ou superior** (o `.nvmrc` fixa a 24). Node 20 **não funciona** —
o Astro 7 exige 22.12+ e o `npm install` trava sem mensagem de erro.

```bash
nvm use          # lê o .nvmrc
npm install
npm run dev      # http://localhost:4321
```

## Publicar no VPS

Requisitos: Docker e Docker Compose no servidor, e o DNS de
`fabricadetrecos.com.br` (e `www`) apontando pro IP dele.

```bash
git clone https://github.com/digipix3d/site-ftd.git && cd site-ftd
cp .env.example .env
nano .env                        # domínio, e-mail do TLS, token do Instagram
docker compose up -d --build
```

> O `.env` **não** está no repositório, de propósito — ele guarda o token do
> Instagram. Sempre crie a partir do `.env.example` direto no servidor.

Pronto. O Caddy pede o certificado do Let's Encrypt sozinho no primeiro acesso —
não precisa rodar certbot nem mexer em nginx.

### Atualizar depois de mudar o site

```bash
git pull && docker compose up -d --build
```

### Comandos do dia a dia

```bash
docker compose logs -f web        # o que o servidor está fazendo
docker compose ps                 # o que está no ar
curl -s localhost/api/saude       # o feed do Instagram está vivo?
docker compose down               # derruba (os certificados ficam salvos)
```

## Como está organizado

```
src/
  content/conteudo.ts      TODO o texto do site. Para mudar palavras, é aqui.
  styles/tokens.css        Cores, fontes, espaçamentos. Para mudar o visual, é aqui.
  layouts/Base.astro       Cabeça do HTML, SEO, fontes, analytics
  components/              Uma seção do site por arquivo
  pages/                   index (home), galeria, 404
  assets/                  Imagens (o Astro otimiza no build)
public/
  modelos/treco.glb        Mascote em 3D, comprimido (621 KB, era 15 MB)
  fontes/                  Fontes próprias — nenhuma requisição a terceiros
server/
  index.js                 Serve o site e responde /api/instagram
Dockerfile                 Build em 3 estágios
docker-compose.yml         web + caddy
Caddyfile                  HTTPS automático, redirect do www, cabeçalhos de segurança
```

## Para mexer no conteúdo

| O que você quer mudar | Onde |
|---|---|
| Qualquer texto, preço, telefone | `src/content/conteudo.ts` |
| Cores, fontes, espaçamento | `src/styles/tokens.css` |
| Fotos da galeria | `src/assets/galeria/` + a lista em `conteudo.ts` |
| Quadrinhos | `src/assets/quadrinhos/` + a lista em `conteudo.ts` |
| Mascote 3D | veja abaixo |

Trocar o modelo 3D (a partir de um `.glb` novo):

```bash
npx gltf-transform optimize entrada.glb public/modelos/treco.glb \
  --compress draco --texture-compress webp --texture-size 1024 \
  --simplify true --simplify-error 0.0001
```

## Documentos relacionados

- `INSTAGRAM.md` — como gerar o token da Meta
- `ESPEC-COMPONENTES.md` — as regras de estilo, para quem for editar componentes

## Decisões que valem saber

- **Nada de terceiros no carregamento.** Fontes, ícones e o visualizador 3D são
  servidos pelo nosso domínio. O site antigo dependia de 8 domínios externos e
  morria junto com a conta da HostGator.
- **O feed do Instagram nunca quebra a página.** O token fica só no servidor, o
  último feed bom fica em cache num volume, e se a API da Meta cair o site mostra
  o link do perfil em vez de um buraco.
- **O token se renova sozinho** a cada 24h. Tokens da Meta valem 60 dias.
- **Sem formulário de contato.** Tudo vai pro WhatsApp com a mensagem já escrita,
  o que converte melhor e elimina servidor de e-mail, spam e LGPD de formulário.
