# Ligando o feed do Instagram

O site funciona sem isso — sem token, a seção do Instagram mostra o link do perfil
no lugar dos posts. Quando você preencher as duas variáveis, o feed liga sozinho.

Você precisa de **dois valores**: `IG_TOKEN` e `IG_USER_ID`.

> A Meta muda o painel de desenvolvedor com frequência. Os nomes dos botões podem
> estar um pouco diferentes do descrito aqui — mas a sequência é essa, e o teste
> final do passo 6 é a prova real de que deu certo.

---

## 1. A conta precisa ser Profissional

No app do Instagram: **Configurações → Tipo de conta → Mudar para conta profissional**
(Empresa ou Criador de conteúdo, tanto faz).

Conta pessoal não funciona nessa API.

## 2. Criar o app no Meta

1. Vá em <https://developers.facebook.com/apps> e faça login.
2. **Criar app**.
3. Em caso de uso, escolha a opção que menciona **Instagram**
   (algo como "Outro" → tipo **Empresa**, se não aparecer direto).
4. Dê um nome qualquer — só você vê. Ex.: `Site Fábrica de Trecos`.

## 3. Adicionar o produto Instagram

1. No painel do app, procure **Instagram** na lista de produtos e clique em **Configurar**.
2. Escolha o fluxo de **API com login do Instagram**
   (*Instagram API with Instagram Login*) — é o que usa `graph.instagram.com`,
   que é o que o nosso servidor chama.
3. Em **Permissões**, garanta que `instagram_business_basic` está presente.
   É a única que o site precisa: ela dá acesso de leitura aos seus próprios posts.

## 4. Conectar a conta e gerar o token

Ainda na tela de configuração do Instagram:

1. Procure a seção de **contas do Instagram** e conecte a `@fabricadetrecos`.
2. Clique em **Gerar token** (*Generate token*) na frente da conta conectada.
3. Faça login na conta quando pedir e autorize.
4. **Copie o token na hora.** Ele só aparece uma vez.

Esse já é um token de longa duração: vale **60 dias**.
Nosso servidor renova sozinho a cada 24h, então ele não expira enquanto o site
estiver no ar. Se o site ficar mais de 60 dias fora, você precisa gerar de novo.

### Onde o token fica, e por que não no GitHub

Ele vive só no `.env` do servidor e no volume `site-ftd_dados`. **Não** é um
segredo do GitHub, de propósito: quem usa o token é o servidor, não o workflow,
e injetá-lo pelo deploy exigiria alargar o `command=` que restringe a chave de
publicação a um único argumento. Uma proteção concreta em troca de comodidade.

O valor no `.env` é uma **semente**: serve para o primeiro uso e para você
trocar o token quando quiser. Depois disso, quem manda é o token renovado no
volume — senão todo deploy voltaria ao original, que morre no dia 60 e derrubaria
o feed sem aviso.

Trocar o token é só pôr o novo no `.env` e subir: o servidor percebe que a
semente mudou e adota. Para não perder o token renovado, o que importa é o
backup do volume:

```bash
docker run --rm -v site-ftd_dados:/d -v "$PWD:/b" alpine \
  tar czf /b/instagram-backup.tar.gz -C /d .
```

## 5. Descobrir o `IG_USER_ID`

Com o token em mãos, rode no terminal (troque `SEU_TOKEN`):

```bash
curl "https://graph.instagram.com/v21.0/me?fields=id,username&access_token=SEU_TOKEN"
```

A resposta vem assim:

```json
{"id":"17841400000000000","username":"fabricadetrecos"}
```

Esse `id` é o seu `IG_USER_ID`. Confira que o `username` é mesmo `fabricadetrecos` —
se vier outro, você conectou a conta errada.

## 6. Preencher e subir

No servidor, dentro da pasta do projeto:

```bash
cp .env.example .env
nano .env          # cole IG_TOKEN e IG_USER_ID
docker compose up -d --build
```

Teste se pegou:

```bash
curl -s https://fabricadetrecos.com.br/api/saude
```

Você quer ver `"temToken":true`, `"temUserId":true` e `"posts"` maior que zero.
Se `posts` vier 0, veja os logs: `docker compose logs web`.

---

## Trocar o token depois

Basta editar o `.env` e rodar `docker compose up -d`. O servidor detecta que o token
do ambiente é diferente do salvo em disco e adota o novo automaticamente — não
precisa apagar volume nem nada.

## Se o feed sumir do site

Não é urgente: o site esconde a seção sozinho e mostra o link do perfil, sem erro
na tela. Para investigar:

```bash
docker compose logs web | grep -i instagram
curl -s https://fabricadetrecos.com.br/api/saude
```

Causas comuns, em ordem de probabilidade:

1. **Token expirou** — o site ficou mais de 60 dias fora do ar. Gere outro (passo 4).
2. **Conta voltou a ser pessoal** — precisa ser Profissional (passo 1).
3. **App em modo de desenvolvimento com o testador removido** — reconecte a conta.
4. **API da Meta fora** — o servidor mantém o último feed bom em cache, então
   normalmente você nem percebe. Só espere.
