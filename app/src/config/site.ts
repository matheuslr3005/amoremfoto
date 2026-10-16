// ─────────────────────────────────────────────────────────────
//  DADOS DO ESTÚDIO — troque aqui e o site inteiro acompanha
//  (links de WhatsApp, Instagram, e-mail e mapa saem daqui)
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Amor em Foto Estúdio',
  whatsapp: '5500000000000', // só números, com 55 + DDD  ← TROCAR
  instagram: 'https://instagram.com/', // ← TROCAR pelo link do perfil
  instagramHandle: '@amoremfoto', // ← TROCAR
  email: 'contato@exemplo.com', // ← TROCAR
  address: {
    street: 'Rua Tupinambás, 72',
    hood: 'Nossa Senhora das Graças',
    city: 'Canoas',
    uf: 'RS',
  },
} as const;

export const waLink = (message?: string) =>
  `https://wa.me/${SITE.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const mapsLink = () => {
  const a = SITE.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.street}, ${a.hood}, ${a.city} - ${a.uf}`)}`;
};

/** "Cena" usada para pintar a foto provisória (enquanto não há foto real). */
export type PhotoKind = 'belly' | 'newborn' | 'growth' | 'kid' | 'portrait' | 'event' | 'studio' | 'mentor';

export type Service = {
  id: string;
  name: string;
  group: 'Ensaio' | 'Cobertura' | 'Para fotógrafos';
  text: string;
  kind: PhotoKind;
  /** Foto real: coloque o arquivo em app/public/fotos/ e preencha, ex.: '/fotos/gestante.jpg' */
  src?: string;
  options?: readonly string[];
  cta: string;
  message: string;
};

export const SERVICES: readonly Service[] = [
  {
    id: 'gestantes',
    name: 'Gestantes',
    group: 'Ensaio',
    text: 'Para guardar a espera: a barriga, o carinho, a expectativa de quem já ama antes de conhecer.',
    kind: 'belly',
    cta: 'Quero um ensaio gestante',
    message: 'Olá! Vim pelo site e quero saber sobre o ensaio de gestante.',
  },
  {
    id: 'newborn',
    name: 'Newborn',
    group: 'Ensaio',
    text: 'Os primeiros dias do bebê, com calma, num estúdio aquecido e só de luz natural.',
    kind: 'newborn',
    cta: 'Quero um ensaio newborn',
    message: 'Olá! Vim pelo site e quero saber sobre o ensaio newborn.',
  },
  {
    id: 'acompanhamento',
    name: 'Acompanhamento',
    group: 'Ensaio',
    text: 'Veja o seu bebê crescer, em sessões mensais, bimestrais ou trimestrais.',
    kind: 'growth',
    options: ['Mensal', 'Bimestral', 'Trimestral'],
    cta: 'Quero acompanhar o meu bebê',
    message: 'Olá! Vim pelo site e quero saber sobre o acompanhamento do bebê.',
  },
  {
    id: 'infantil',
    name: 'Infantil',
    group: 'Ensaio',
    text: 'Crianças brincando, rindo e sendo do jeitinho que são, sem pose forçada.',
    kind: 'kid',
    cta: 'Quero um ensaio infantil',
    message: 'Olá! Vim pelo site e quero saber sobre o ensaio infantil.',
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    group: 'Ensaio',
    text: 'Retratos profissionais em luz natural, para quem quer uma imagem cuidada e verdadeira.',
    kind: 'portrait',
    cta: 'Quero retratos profissionais',
    message: 'Olá! Vim pelo site e quero saber sobre o ensaio corporativo.',
  },
  {
    id: 'eventos',
    name: 'Eventos',
    group: 'Cobertura',
    text: 'Registro dos momentos que não se repetem, com um olhar atento e discreto.',
    kind: 'event',
    cta: 'Quero cobertura de evento',
    message: 'Olá! Vim pelo site e quero saber sobre cobertura de eventos.',
  },
  {
    id: 'locacao',
    name: 'Locação do estúdio',
    group: 'Para fotógrafos',
    text: 'O nosso espaço de luz natural, em Canoas, para você fotografar os seus próprios trabalhos com calma e boa luz.',
    kind: 'studio',
    cta: 'Consultar disponibilidade',
    message: 'Olá! Vim pelo site e quero saber sobre a locação do estúdio.',
  },
  {
    id: 'mentoria',
    name: 'Mentoria',
    group: 'Para fotógrafos',
    text: 'Para quem quer ser fotógrafo ou evoluir na profissão: do primeiro clique ao atendimento do cliente, em luz natural.',
    kind: 'mentor',
    options: ['Para iniciantes', 'Para quem já fotografa'],
    cta: 'Quero saber mais',
    message: 'Olá! Vim pelo site e quero saber mais sobre a mentoria para fotógrafos.',
  },
];

export type Chapter = { num: string; title: string; text: string };

export const CHAPTERS: readonly Chapter[] = [
  {
    num: '01',
    title: 'Luz',
    text: 'Só a claridade da janela. Sem flash e sem luz artificial: a luz muda ao longo do dia e a gente acompanha o ritmo de quem está na frente da câmera.',
  },
  {
    num: '02',
    title: 'Revelar',
    text: 'Cada foto aparece aos poucos, do jeito que a gente lembra: o olhar, o abraço, o detalhe. Sem pressa e sem filtro exagerado.',
  },
  {
    num: '03',
    title: 'Memória',
    text: 'No fim, fica o que importa: a textura da pele, o riso, o abraço de verdade. Fotos para guardar para sempre.',
  },
];

export const MANIFESTO =
  'A luz da janela muda a cada minuto, e é nela que cada fase da vida fica guardada. Sem flash, sem luz artificial — só a claridade de cada hora do dia.';

export const FACTS = [
  { value: 0, label: 'flashes. Só luz natural, do começo ao fim da sessão.' },
  { value: 8, label: 'serviços, de ensaios e eventos à locação e à mentoria.' },
  { value: 1, label: 'estúdio em Canoas, pensado para receber você com calma.' },
] as const;

export type GalleryPhoto = { title: string; tag: string; kind: PhotoKind; src?: string };

/** Fotos que passam pelo túnel 3D. Para usar fotos reais, preencha `src`. */
export const PHOTOS: readonly GalleryPhoto[] = [
  { title: 'Primeiro sono', tag: 'Newborn', kind: 'newborn' },
  { title: 'A espera', tag: 'Gestante', kind: 'belly' },
  { title: 'Brincar', tag: 'Infantil', kind: 'kid' },
  { title: 'Retrato', tag: 'Corporativo', kind: 'portrait' },
  { title: 'Mãozinhas', tag: 'Newborn', kind: 'newborn' },
  { title: 'Celebrar', tag: 'Evento', kind: 'event' },
  { title: 'Mês a mês', tag: 'Acompanhamento', kind: 'growth' },
  { title: 'Luz da janela', tag: 'Gestante', kind: 'belly' },
  { title: 'Cumplicidade', tag: 'Infantil', kind: 'kid' },
  { title: 'Olhar', tag: 'Corporativo', kind: 'portrait' },
  { title: 'Colo', tag: 'Newborn', kind: 'newborn' },
  { title: 'Entre amigos', tag: 'Evento', kind: 'event' },
  { title: 'Primeiros passos', tag: 'Acompanhamento', kind: 'growth' },
  { title: 'Contraluz', tag: 'Gestante', kind: 'belly' },
  { title: 'Estúdio', tag: 'Locação', kind: 'studio' },
];

/** Os seis serviços do anel 3D. Locação e mentoria ficam na seção "Para fotógrafos". */
export const RING_SERVICES = SERVICES.filter((s) => s.group !== 'Para fotógrafos');
export const PRO_SERVICES = SERVICES.filter((s) => s.group === 'Para fotógrafos');
