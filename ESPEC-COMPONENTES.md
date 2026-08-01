# Especificação para quem monta os componentes

Leia isto **inteiro** antes de escrever qualquer linha. O objetivo é que 6 pessoas
diferentes produzam peças que pareçam feitas pela mesma mão.

## Contexto

Site da **Fábrica de Trecos** — impressão 3D, modelagem e VR, em Porto Alegre.
Mascote: **Treco**, um gato amarelo de macacão teal, óculos redondos e botas vermelhas.
Ele é impresso em 3D e narra o site em primeira pessoa.

Stack: **Astro 7**, componentes `.astro`, HTML estático, o mínimo possível de JavaScript.

## Regras inegociáveis

1. **Nunca escreva um valor de cor, sombra, raio, espaçamento ou tamanho de fonte
   na mão.** Use as variáveis de `src/styles/tokens.css`. Se faltar um token, use o
   mais próximo — não invente um valor novo.
2. **Nunca escreva texto de conteúdo dentro do componente.** Todo texto vem de
   `src/content/conteudo.ts` via import. Se precisar de um texto que não existe lá,
   avise no relatório final em vez de inventar.
3. **`<style>` sempre com escopo do componente** (o padrão do Astro). Nada de
   `is:global`. Prefixe suas classes com o nome do bloco, ex.: `.servicos__cartao`.
4. **Zero dependência externa.** Nenhuma CDN, nenhuma fonte remota, nenhuma
   biblioteca via `<script src="https://...">`. Ícones = SVG inline.
5. **Mobile primeiro.** Deve funcionar bem a partir de 320px de largura. Use as
   variáveis fluidas (`--t-*`) em vez de media queries sempre que der.
6. **Acessibilidade não é opcional:** um `<h2>` por seção, `alt` descritivo em toda
   imagem com conteúdo (`alt=""` nas decorativas), contraste mínimo 4.5:1 para texto,
   e tudo que é clicável tem que ser alcançável por teclado.
7. **Respeite `prefers-reduced-motion`** em qualquer animação que você criar.
8. **Imagens** sempre pelo componente `<Image>` do Astro
   (`import { Image } from 'astro:assets'`), importando o arquivo. Nunca `<img src="/...">`
   para imagens do projeto. Passe `width`/`height` e `loading="lazy"` (menos na primeira dobra).

## A linguagem visual: pop / HQ

A referência é o quadrinho que a empresa já publica: traço grosso, cor chapada,
sem gradiente suave, sem sombra borrada.

- **Contorno grosso escuro** em cartões, botões e imagens — `var(--borda)`.
- **Sombra sólida deslocada, sem blur** — `var(--sombra)`. É a assinatura do estilo.
  Nunca use `box-shadow` com blur.
- **Halftone de bolinhas** nos fundos, com as classes `.halftone`, `.halftone-teal`,
  `.halftone-denso` (já existem em tokens.css).
- **Balões de fala** para as falas do Treco — classe `.balao`.
- Rotações levinhas (`rotate(-1.5deg)`) em cartões e imagens dão o ar de colagem.
  Use com parcimônia, alternando o sentido.
- Hover de botão: ele "afunda" — translada 2px e a sombra encolhe. Já está no `.btn`.

## Classes prontas que você deve reaproveitar

| Classe | Para quê |
|---|---|
| `.container` | Largura máxima + gutter lateral |
| `.secao` | Respiro vertical padrão da seção |
| `.btn` | Botão. Variantes: `--amarelo`, `--teal`, `--vazado`, `--grande` |
| `.cartao` | Cartão branco com contorno e sombra |
| `.balao` | Balão de fala do Treco (rabinho já incluso) |
| `.halftone` / `.halftone-teal` / `.halftone-denso` | Fundo de bolinhas |
| `.raios` | Fundo de raios saindo do centro |
| `.sr-only` | Texto só para leitor de tela |

## Alternância de fundo entre seções

Para a página não virar um bloco só, as seções alternam:
`--fundo` (creme claro) → `--fundo-alt` (creme) → `--fundo-escuro` (carvão, com texto claro).
Cada agente recebe qual é o fundo da sua seção. **Respeite** — é o que dá ritmo à página.

## Assets disponíveis

```
src/assets/treco/       BonecoTreco.png (aponta pra cima)  Treco5.png (chave inglesa + joinha)
                        BonecoTreco2.png (corpo inteiro, foto)  BonecoTreco3.png  BonecoTreco4.png
                        TrecoPraBaixo.png (apontando pra baixo — ótimo pra indicar rolagem)
                        TrecoBoneco.glb (modelo 3D)
src/assets/galeria/     8 fotos das peças (nomes em conteudo.ts)
src/assets/quadrinhos/  FabricaDeTrecosHQ.png  Maetematica-fix2.png  PicaretaMinecraft.png
src/assets/marca/       FabricaDeTrecos1.png  2.png  3.png (logos)
src/assets/servicos/    fotos avulsas de apoio
```

## WhatsApp

Todo botão de contato usa o helper:

```ts
import { zap } from '../content/conteudo';
// <a href={zap('Oi! Quero um orçamento de impressão 3D.')} target="_blank" rel="noopener">
```

A mensagem de cada botão **já está** em `conteudo.ts` no campo `msg` do item.

## Ao terminar

Rode `npx astro check` se possível e relate:
- arquivos que você criou;
- qualquer texto que faltou em `conteudo.ts`;
- qualquer token que você sentiu falta.

Não edite arquivos fora do seu escopo. Não mexa em `tokens.css`, `conteudo.ts`,
`Base.astro`, `Cabecalho.astro` nem `Rodape.astro`.
