/**
 * Todo o texto do site em um lugar só.
 * Para mudar qualquer palavra do site, mexa AQUI — não nos componentes.
 */

export const empresa = {
  nome: 'Fábrica de Trecos',
  mascote: 'Treco',
  cnpj: '25.272.993/0001-81',
  cidade: 'Porto Alegre',
  estado: 'RS',
  pais: 'BR',
  endereco: {
    galeria: 'Galeria Augusta',
    loja: 'Loja 57',
    rua: 'Av. da Azenha, 1067',
    bairro: 'Azenha',
    cep: '90160-002',
    /** Uma linha só, para o rodapé e para dados estruturados. */
    completo: 'Av. da Azenha, 1067 — Galeria Augusta, loja 57, Azenha, Porto Alegre/RS, 90160-002',
  },
  email: 'contato@fabricadetrecos.com.br',
  telefone: '(51) 99422-3090',
  whatsapp: '5551994223090',
  dominio: 'fabricadetrecos.com.br',
  instagram: 'https://www.instagram.com/fabricadetrecos/',
  facebook: 'https://www.facebook.com/fabricadetrecos/',
  arroba: '@fabricadetrecos',
  observacaoEndereco: 'Passa na loja pra ver as peças de perto — ou chama no WhatsApp.',
} as const;

/** Link para o Google Maps. Vai pelo endereço, não por coordenadas: assim quem
 *  resolve a posição exata é o próprio Google, sem eu chutar latitude. */
export const linkMaps =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Av. da Azenha, 1067 - Azenha, Porto Alegre - RS, 90160-002');

/** Monta um link de WhatsApp com a mensagem já escrita. */
export function zap(mensagem: string): string {
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const navegacao = [
  { rotulo: 'Serviços', href: '/#servicos' },
  { rotulo: 'Como funciona', href: '/#como-funciona' },
  { rotulo: 'Galeria', href: '/galeria' },
  { rotulo: 'Impressão 3D', href: '/#o-que-e' },
  { rotulo: 'Histórias', href: '/#historias' },
  { rotulo: 'Contato', href: '/#contato' },
] as const;

export const hero = {
  sobretitulo: 'Impressão 3D · Modelagem · Realidade Virtual',
  titulo: 'Sua ideia vira treco.',
  subtitulo:
    'A gente transforma o que existe só na sua cabeça em uma coisa que você pode segurar na mão. E, quando dá vontade, em um mundo inteiro pra você entrar de óculos.',
  dica3d: 'Arrasta pra girar o Treco',
  ctaPrimario: { rotulo: 'Pedir orçamento', msg: 'Oi! Vim pelo site e quero um orçamento.' },
  ctaSecundario: { rotulo: 'Ver o que já fizemos', href: '/galeria' },
};

export const apresentacao = {
  titulo: 'Oi, eu sou o Treco!',
  falas: [
    'Sou o mascote daqui — e fui impresso nas nossas próprias impressoras, camada por camada.',
    'Se eu existo, sua ideia também pode existir. Deixa eu te mostrar como funciona.',
  ],
  assinatura: 'Rola a página que eu te acompanho',
};

export const servicos = {
  titulo: 'O que a gente faz',
  subtitulo: 'Três serviços que funcionam sozinhos ou juntos.',
  itens: [
    {
      id: 'modelagem',
      icone: 'modelagem',
      titulo: 'Modelagem 3D',
      resumo: 'Construímos o modelo que você tem na cabeça.',
      texto:
        'Você descreve, manda foto, rabisca num guardanapo — a gente modela. No fim, o arquivo 3D é seu, imprima com a gente ou não.',
      cta: 'Quero modelagem 3D',
      msg: 'Oi! Quero um orçamento de modelagem 3D.',
      cor: 'teal',
    },
    {
      id: 'impressao',
      icone: 'impressao',
      titulo: 'Impressão 3D',
      resumo: 'Do arquivo pra sua mão.',
      texto:
        'Imprimimos em PLA, ABS e resina. Já tem o modelo? Manda que a gente imprime. Não tem? A gente faz também.',
      cta: 'Quero imprimir',
      msg: 'Oi! Quero um orçamento de impressão 3D.',
      cor: 'amarelo',
    },
    {
      id: 'vr',
      icone: 'vr',
      titulo: 'Imersão VR',
      resumo: 'Sua ideia virando um lugar onde dá pra entrar.',
      texto:
        'Criamos experiências em realidade virtual para empresas e eventos. No fim, todos os arquivos do projeto ficam com você — modelos e ambientes.',
      cta: 'Quero saber de VR',
      msg: 'Oi! Quero saber mais sobre imersão VR.',
      cor: 'vermelho',
    },
  ],
};

export const comoFunciona = {
  titulo: 'Como funciona o orçamento',
  subtitulo: 'Escolhe o caminho que parece com o seu caso.',
  aviso:
    'Em todos os casos pedimos um sinal de 50% na hora de fechar o serviço.',
  caminhos: [
    {
      id: 'tenho-modelo',
      numero: '01',
      titulo: 'Já tenho o modelo 3D',
      texto:
        'Aceitamos vários formatos (OBJ, STL, 3MF e outros). O orçamento sai com base no tempo de impressão e na quantidade de material.',
      cta: 'Mandar meu arquivo',
      msg: 'Oi! Já tenho o modelo 3D e quero um orçamento de impressão.',
    },
    {
      id: 'sem-modelo',
      numero: '02',
      titulo: 'Não tenho o modelo',
      texto:
        'Com fotos e informações suas, a gente procura algo parecido. Se o que achamos não for bem o que você quer, orçamos a adaptação conforme a dificuldade. O arquivo final é seu, imprimindo conosco ou não.',
      cta: 'Te mando umas fotos',
      msg: 'Oi! Não tenho o modelo 3D, quero ajuda pra encontrar ou adaptar um.',
    },
    {
      id: 'do-zero',
      numero: '03',
      titulo: 'Quero criar do zero',
      texto:
        'A criação é orçada separado da impressão, conforme o nível de detalhe e o tempo de modelagem. Fechou? A gente modela, e no fim o modelo 3D é seu.',
      cta: 'Tenho uma ideia',
      msg: 'Oi! Quero criar um modelo 3D do zero, a partir de uma ideia minha.',
    },
    {
      id: 'acabamento',
      numero: '04',
      titulo: 'Acabamento artístico',
      texto:
        'Aquela camada caprichada de pintura que faz a peça virar outra coisa. Orçamos esse acabamento e, quando faz sentido, indicamos artistas especializados.',
      cta: 'Quero pintura',
      msg: 'Oi! Quero um orçamento de acabamento artístico / pintura.',
    },
    {
      id: 'vr-projeto',
      numero: '05',
      titulo: 'Projeto em VR',
      texto:
        'Analisamos o projeto e orçamos conforme os recursos que ele precisa. No fim, todos os arquivos ficam com você — dos modelos aos ambientes virtuais.',
      cta: 'Falar sobre VR',
      msg: 'Oi! Quero um orçamento de projeto em realidade virtual.',
    },
  ],
};

export const oQueE = {
  titulo: 'O que é impressão 3D, afinal?',
  intro: 'Deixa eu explicar do meu jeito.',
  blocos: [
    {
      titulo: 'Pensa em Lego',
      texto:
        'Você escolhe o que quer montar e vai empilhando peça sobre peça até a coisa tomar forma. A impressão 3D é parecida — só que em vez de peças prontas, usamos um material que derrete e endurece de novo.',
    },
    {
      titulo: 'Camada por camada',
      texto:
        'A impressora recebe um modelo digital, que funciona como uma planta detalhada. Ela imprime a primeira camada, a base. Depois constrói a próxima em cima. E repete, derretendo e solidificando, até o objeto inteiro existir. É tipo um bolo de camadas.',
    },
    {
      titulo: 'Detalhe de verdade',
      texto:
        'O impressionante é a precisão: a impressora segue o modelo digital e coloca cada pedacinho de material exatamente onde precisa. Em pouco tempo você segura na mão uma coisa que antes só existia na tela.',
    },
    {
      titulo: 'Serve pra quase tudo',
      texto:
        'Brinquedos, peças de reposição, protótipos de produto, maquetes de arquitetura — e, em impressoras bem específicas, até comida. É uma tecnologia que transforma imaginação em coisa palpável.',
    },
  ],
  fechamento: 'E eu sou a prova viva. Ou melhor: a prova impressa.',
  cta: { rotulo: 'Quero imprimir agora', msg: 'Oi! Li sobre impressão 3D no site e quero imprimir uma peça.' },
};

export const galeria = {
  titulo: 'Nossos primeiros modelos',
  subtitulo:
    'As peças onde a gente descobriu esse serviço — e todos os perrengues dele. Cada uma ensinou alguma coisa.',
  pecas: [
    { arquivo: '01-pla-gato-guerreiro.jpg', titulo: 'Gato Guerreiro', material: 'PLA' },
    { arquivo: '02-gato-guerreiro-parte-2.jpg', titulo: 'Gato Guerreiro, parte 2', material: 'PLA' },
    { arquivo: '04-abs-homem-de-ferro.jpg', titulo: 'Homem de Ferro', material: 'ABS' },
    { arquivo: '05-resina-pink-e-o-cerebro.jpg', titulo: 'Pink e o Cérebro', material: 'Resina' },
    { arquivo: '06-busto-resina-vs-abs-mandalorian.jpg', titulo: 'Busto Mandalorian', material: 'Resina vs. ABS' },
    { arquivo: '07-pla-castelo-do-mago.jpg', titulo: 'Castelo do Mago', material: 'PLA' },
    { arquivo: '08-resina-abs-mandalorian.jpg', titulo: 'Mandalorian', material: 'Resina + ABS' },
    { arquivo: '09-abs-herois.jpg', titulo: 'Heróis', material: 'ABS' },
  ],
  ctaVerTudo: 'Ver a galeria inteira',
  ctaOrcamento: { rotulo: 'Quero uma peça assim', msg: 'Oi! Vi a galeria e quero uma peça parecida.' },
};

export const historias = {
  titulo: 'Histórias do Treco',
  subtitulo: 'Toda semana eu apronto alguma no Instagram. Aqui vão algumas.',
  tirinhas: [
    { arquivo: 'FabricaDeTrecosHQ.png', titulo: 'Prazer, eu sou o Treco', alt: 'Tirinha em dois quadros: o Treco se apresenta na frente de uma estante de impressoras 3D e convida a seguir @fabricadetrecos nas redes sociais.' },
    { arquivo: 'Maetematica-fix2.png', titulo: 'Mãetemática', alt: 'Tirinha do Treco sobre matemática.' },
    { arquivo: 'PicaretaMinecraft.png', titulo: 'A picareta', alt: 'Tirinha do Treco com uma picareta de Minecraft impressa em 3D.' },
  ],
  cta: 'Ver mais no Instagram',
};

export const instagram = {
  titulo: 'Direto do nosso Instagram',
  subtitulo: 'O que saiu da impressora nos últimos dias.',
  cta: 'Seguir @fabricadetrecos',
  vazio: 'Dá uma olhada no nosso perfil pra ver as novidades.',
};

export const horario = {
  titulo: 'Horário de atendimento',
  dias: [
    { dia: 'Segunda a sexta', hora: '09:00 às 18:00' },
    { dia: 'Sábado e domingo', hora: 'Fechado' },
  ],
  observacao: 'Manda mensagem a qualquer hora — a gente responde no próximo horário útil.',
};

export const contato = {
  titulo: 'Vamos fazer seu treco?',
  subtitulo:
    'O jeito mais rápido de falar com a gente é o WhatsApp. Manda a ideia, uma foto, um desenho — o que você tiver.',
  ctaZap: { rotulo: 'Chamar no WhatsApp', msg: 'Oi! Vim pelo site da Fábrica de Trecos.' },
  qrLegenda: 'Ou aponta a câmera aqui',
};

export const rodape = {
  frase: 'Feito em Porto Alegre, camada por camada.',
  copyright: `© ${new Date().getFullYear()} Fábrica de Trecos`,
};

export const seo = {
  titulo: 'Fábrica de Trecos — Impressão 3D, Modelagem e VR em Porto Alegre',
  descricao:
    'Impressão 3D em PLA, ABS e resina, modelagem 3D sob medida e experiências em realidade virtual. Orçamento pelo WhatsApp. Porto Alegre, RS.',
  palavras: 'impressão 3D Porto Alegre, modelagem 3D, impressão em resina, PLA, ABS, realidade virtual, VR, prototipagem',
};
