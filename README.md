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

**Normalmente você não faz nada.** Todo push no `master` publica sozinho, pelo
GitHub Actions — veja a seção abaixo.

Se precisar publicar na mão:

```bash
git pull && docker compose pull && docker compose up -d
```

## Publicação automática

`.github/workflows/deploy.yml` cuida disso. Push no `master` → o Actions
constrói a imagem, publica no GHCR, e o servidor só baixa.

A imagem **não** é construída no servidor de propósito: a VPS tem 1,9 GB
dividida com o site no ar, e um build ali deixa o site lento por minutos.

```
push no master
   └─ Actions: docker build → ghcr.io/digipix3d/site-ftd:<sha>
        └─ ssh na VPS → deploy.sh → docker compose pull + up -d
             └─ healthcheck; se falhar, volta sozinho pra imagem anterior
```

### Voltar pra uma versão anterior

A imagem é marcada com o SHA do commit, então não precisa reconstruir nada:

```bash
cd /opt/site-ftd
docker image ls ghcr.io/digipix3d/site-ftd     # vê as tags disponíveis
TAG=<sha-de-12-caracteres> docker compose up -d
```

### O que dá acesso ao servidor

A chave que o Actions usa está presa a um único comando no
`/root/.ssh/authorized_keys` do servidor:

```
command="/opt/site-ftd/deploy.sh $SSH_ORIGINAL_COMMAND",no-pty,no-port-forwarding,... ssh-ed25519 AAAA...
```

Ela **não** abre shell e não roda outro comando — só o deploy. Se o segredo
vazar do GitHub, o estrago possível é publicar uma versão da imagem, não tomar
o servidor. A tag também é validada contra `^[A-Za-z0-9._-]+$` antes de ser
usada, senão um valor com `;` viraria comando.

Segredos no repositório: `SSH_KEY`, `SSH_HOST`, `SSH_PORT`, `SSH_HOST_KEY`.
O `SSH_HOST_KEY` fixa a identidade do servidor — sem ele o deploy aceitaria
qualquer máquina que respondesse naquele IP.

Trocar a chave de deploy, se algum dia precisar:

```bash
ssh-keygen -t ed25519 -N '' -C 'github-actions-deploy@site-ftd' -f deploy_key
# no servidor: substitua a linha correspondente em /root/.ssh/authorized_keys
gh secret set SSH_KEY --repo digipix3d/site-ftd < deploy_key
rm deploy_key deploy_key.pub
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
