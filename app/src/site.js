// ─────────────────────────────────────────────────────────────
//  DADOS DO ESTÚDIO — troque aqui e o site inteiro acompanha
//  (links de WhatsApp, Instagram, e-mail e mapa são preenchidos a partir daqui)
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
};

export const waLink = (msg) => `https://wa.me/${SITE.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;

export const addressLine = () => {
  const a = SITE.address;
  return `${a.street} · ${a.hood} · ${a.city}/${a.uf}`;
};

export const mapsLink = () => {
  const a = SITE.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.street}, ${a.hood}, ${a.city} - ${a.uf}`)}`;
};

// Serviços do estúdio (lista interativa na seção "Serviços")
export const SERVICES = [
  {
    id: 'gestantes',
    name: 'Gestantes',
    group: 'Ensaio',
    text: 'Para guardar a espera: a barriga, o carinho, a expectativa de quem já ama antes de conhecer.',
    tone: 2,
  },
  {
    id: 'newborn',
    name: 'Newborn',
    group: 'Ensaio',
    text: 'Os primeiros dias do bebê, com calma, num estúdio aquecido e só de luz natural.',
    tone: 0,
  },
  {
    id: 'acompanhamento',
    name: 'Acompanhamento',
    group: 'Ensaio',
    text: 'Veja o seu bebê crescer, em sessões mensais, bimestrais ou trimestrais.',
    tone: 4,
    options: ['Mensal', 'Bimestral', 'Trimestral'],
  },
  {
    id: 'infantil',
    name: 'Infantil',
    group: 'Ensaio',
    text: 'Crianças brincando, rindo e sendo do jeitinho que são, sem pose forçada.',
    tone: 1,
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    group: 'Ensaio',
    text: 'Retratos profissionais em luz natural, para quem quer uma imagem cuidada e verdadeira.',
    tone: 5,
  },
  {
    id: 'eventos',
    name: 'Eventos',
    group: 'Cobertura',
    text: 'Registro dos momentos que não se repetem, com um olhar atento e discreto.',
    tone: 3,
  },
];
