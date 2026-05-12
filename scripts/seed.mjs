/**
 * scripts/seed.mjs
 * Injeta 30+ lugares na região central de São Paulo + 10 listas curadas.
 * Uso: node scripts/seed.mjs
 *
 * Requer DATABASE_URL em .env
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USER_ID = '8e416f29-b049-4151-afeb-807d6d231f54';

// ---------------------------------------------------------------------------
// Env loader
// ---------------------------------------------------------------------------
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const envPath = path.resolve(__dirname, '..', name);
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    }
    console.log(`✅  Env carregado de ${name}`);
    return;
  }
  console.error('❌  .env não encontrado.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Imagens públicas (Unsplash — licença gratuita para uso)
// ---------------------------------------------------------------------------
const RESTAURANT_PHOTOS = [
  'https://picsum.photos/seed/rest1/800/600',
  'https://picsum.photos/seed/rest2/800/600',
  'https://picsum.photos/seed/rest3/800/600',
  'https://picsum.photos/seed/rest4/800/600',
  'https://picsum.photos/seed/rest5/800/600',
  'https://picsum.photos/seed/rest6/800/600',
  'https://picsum.photos/seed/rest7/800/600',
  'https://picsum.photos/seed/rest8/800/600',
  'https://picsum.photos/seed/rest9/800/600',
  'https://picsum.photos/seed/rest10/800/600',
  'https://picsum.photos/seed/rest11/800/600',
  'https://picsum.photos/seed/rest12/800/600',
  'https://picsum.photos/seed/rest13/800/600',
  'https://picsum.photos/seed/rest14/800/600',
  'https://picsum.photos/seed/rest15/800/600',
  'https://picsum.photos/seed/rest16/800/600',
  'https://picsum.photos/seed/rest17/800/600',
  'https://picsum.photos/seed/rest18/800/600',
  'https://picsum.photos/seed/rest19/800/600',
  'https://picsum.photos/seed/rest20/800/600',
  'https://picsum.photos/seed/rest21/800/600',
  'https://picsum.photos/seed/rest22/800/600',
  'https://picsum.photos/seed/rest23/800/600',
  'https://picsum.photos/seed/rest24/800/600',
  'https://picsum.photos/seed/rest25/800/600',
  'https://picsum.photos/seed/rest26/800/600',
  'https://picsum.photos/seed/rest27/800/600',
  'https://picsum.photos/seed/rest28/800/600',
  'https://picsum.photos/seed/rest29/800/600',
  'https://picsum.photos/seed/rest30/800/600',
  'https://picsum.photos/seed/rest31/800/600',
  'https://picsum.photos/seed/rest32/800/600',
];

const LIST_COVERS = [
  'https://picsum.photos/seed/list1/600/400',
  'https://picsum.photos/seed/list2/600/400',
  'https://picsum.photos/seed/list3/600/400',
  'https://picsum.photos/seed/list4/600/400',
  'https://picsum.photos/seed/list5/600/400',
  'https://picsum.photos/seed/list6/600/400',
  'https://picsum.photos/seed/list7/600/400',
  'https://picsum.photos/seed/list8/600/400',
  'https://picsum.photos/seed/list9/600/400',
  'https://picsum.photos/seed/list10/600/400',
];

// ---------------------------------------------------------------------------
// Dados dos lugares — 32 places no centro expandido de São Paulo
// attributes usa os valores exatos esperados pelos filtros contextuais do KAN-52
// ---------------------------------------------------------------------------
function buildPlaces() {
  const p = (photo) => RESTAURANT_PHOTOS[photo % RESTAURANT_PHOTOS.length];

  return [
    // ── RESTAURANTES ────────────────────────────────────────────────────────
    {
      id: crypto.randomUUID(),
      name: 'PF do Zé',
      address: 'Rua Direita, 45',
      numero: '45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5478,
      lng: -46.6339,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'O PF mais querido do Centro: arroz, feijão, bife acebolado e salada por R$18. Fila garantida na hora do almoço.',
      periods: ['tarde'],
      photo: p(0),
      attributes: [
        { key: 'service_type', value: 'Prato feito' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Cantina do Bixiga',
      address: 'Rua 13 de Maio, 210',
      numero: '210',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5637,
      lng: -46.6421,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Cantina italiana tradicional no coração do Bixiga. Massas artesanais e molho vermelho de dar água na boca.',
      periods: ['tarde', 'noite'],
      photo: p(1),
      attributes: [{ key: 'service_type', value: 'À la carte' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Saladão da Sé',
      address: 'Praça da Sé, 78',
      numero: '78',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5501,
      lng: -46.6334,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Buffet de saladas e pratos quentes por quilo. Opções vegetarianas e veganas todo dia. Ótimo custo-benefício.',
      periods: ['tarde'],
      photo: p(2),
      attributes: [
        { key: 'service_type', value: 'Self-service por quilo' },
        { key: 'food_tags', value: 'Vegano' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Japonês da Liberdade',
      address: 'Rua Galvão Bueno, 88',
      numero: '88',
      bairro: 'Liberdade',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5598,
      lng: -46.6341,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Restaurante japonês com rodízio de temaki, sashimi e hot rolls. Ambiente familiar, muito movimentado nos fins de semana.',
      periods: ['tarde', 'noite'],
      photo: p(3),
      attributes: [
        { key: 'service_type', value: 'Buffet livre' },
        { key: 'food_tags', value: 'Sushi / japonesa' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Churrasco do Rei',
      address: 'Rua do Lavapés, 320',
      numero: '320',
      bairro: 'Cambuci',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5672,
      lng: -46.6225,
      establishment_type: 'restaurante',
      price_bucket: '45_to_80',
      status: 'approved',
      description:
        'Rodízio de churrasco com mais de 20 cortes. Buffet premium com saladas e acompanhamentos tradicionais gaúchos.',
      periods: ['tarde', 'noite'],
      photo: p(4),
      attributes: [
        { key: 'service_type', value: 'Buffet livre' },
        { key: 'food_tags', value: 'Churrasco' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Comida da Minha Terra',
      address: 'Rua do Bom Retiro, 156',
      numero: '156',
      bairro: 'Bom Retiro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5285,
      lng: -46.6374,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Culinária mineira autêntica: feijão tropeiro, frango com quiabo, tutu de feijão e um torresmo crocante incrível.',
      periods: ['tarde'],
      photo: p(5),
      attributes: [
        { key: 'service_type', value: 'Self-service por quilo' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Bistrô República',
      address: 'Praça da República, 15',
      numero: '15',
      bairro: 'República',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5437,
      lng: -46.6397,
      establishment_type: 'restaurante',
      price_bucket: '45_to_80',
      status: 'approved',
      description:
        'Bistrô contemporâneo com menu executivo e opções à la carte. Ambiente agradável próximo à Praça da República.',
      periods: ['tarde', 'noite'],
      photo: p(6),
      attributes: [{ key: 'service_type', value: 'À la carte' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Comida Caseira da Dona Lourdes',
      address: 'Rua Haddock Lobo, 47',
      numero: '47',
      bairro: 'Santa Cecília',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5374,
      lng: -46.6558,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Comida caseira da vovó: prato do dia que inclui sopa, prato principal, sobremesa e suco. Almoço por menos de R$25.',
      periods: ['tarde'],
      photo: p(7),
      attributes: [
        { key: 'service_type', value: 'Prato feito' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Tempero de Minas',
      address: 'Alameda Santos, 234',
      numero: '234',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5508,
      lng: -46.6558,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Almoço mineiro no estilo quilo. Pratos típicos com ingredientes frescos e muito tempero da roça.',
      periods: ['tarde'],
      photo: p(8),
      attributes: [
        { key: 'service_type', value: 'Self-service por quilo' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Petisco do Brás',
      address: 'Rua Bresser, 99',
      numero: '99',
      bairro: 'Brás',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5451,
      lng: -46.6168,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'PF simples e honesto no coração do Brás. Frequentado por trabalhadores e lojistas locais. Fila rápida.',
      periods: ['tarde'],
      photo: p(9),
      attributes: [{ key: 'service_type', value: 'Prato feito' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Pizza Bela Vista',
      address: 'Rua Santo Antônio, 67',
      numero: '67',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5625,
      lng: -46.6445,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Pizzaria napoletana com forno a lenha. Massas finas, molho de tomate italiano e mussarela de búfala. Irresistível.',
      periods: ['noite'],
      photo: p(10),
      attributes: [
        { key: 'service_type', value: 'À la carte' },
        { key: 'food_tags', value: 'Pizza' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Feijão Tropeiro do Centro',
      address: 'Rua São Bento, 183',
      numero: '183',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5467,
      lng: -46.6344,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Famoso pelo feijão tropeiro e o torresmo mais gostoso do centro. Almoço rápido e barato. Desde 1987.',
      periods: ['tarde'],
      photo: p(11),
      attributes: [
        { key: 'service_type', value: 'Prato feito' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Sushi Liberdade Premium',
      address: 'Rua Tomás Gonzaga, 54',
      numero: '54',
      bairro: 'Liberdade',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5587,
      lng: -46.6352,
      establishment_type: 'restaurante',
      price_bucket: '45_to_80',
      status: 'approved',
      description:
        'Sushi bar com peixes frescos importados e combinados premiados. O melhor custo-benefício em sushi da Liberdade.',
      periods: ['tarde', 'noite'],
      photo: p(12),
      attributes: [
        { key: 'service_type', value: 'À la carte' },
        { key: 'food_tags', value: 'Sushi / japonesa' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Verde & Vida',
      address: 'Rua Dona Antônia, 22',
      numero: '22',
      bairro: 'Vila Buarque',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5439,
      lng: -46.6519,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        '100% vegetariano. Buffet por quilo com diversas opções veganas, saladas criativas e pratos quentes sem carne.',
      periods: ['tarde'],
      photo: p(13),
      attributes: [
        { key: 'service_type', value: 'Self-service por quilo' },
        { key: 'food_tags', value: 'Vegano' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Espetinho do Cambuci',
      address: 'Rua Lavapés, 500',
      numero: '500',
      bairro: 'Cambuci',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5691,
      lng: -46.6218,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Espetinhos na brasa com farinha de mandioca. O destino perfeito para um lanche rápido e saboroso.',
      periods: ['tarde', 'noite'],
      photo: p(14),
      attributes: [{ key: 'service_type', value: 'Prato feito' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Árabe do Glicério',
      address: 'Rua do Glicério, 78',
      numero: '78',
      bairro: 'Glicério',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5592,
      lng: -46.6305,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Culinária árabe autêntica: esfiha, kibe, homus e prato árabe completo. Ambiente familiar e porções generosas.',
      periods: ['tarde', 'noite'],
      photo: p(15),
      attributes: [
        { key: 'service_type', value: 'À la carte' },
        { key: 'food_tags', value: 'Árabe' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Massas & Cia',
      address: 'Rua 13 de Maio, 415',
      numero: '415',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5648,
      lng: -46.6437,
      establishment_type: 'restaurante',
      price_bucket: '45_to_80',
      status: 'approved',
      description:
        'Massas artesanais com molhos da casa. Nhoque de domingo e ravióli recheado de queijo e ervas são os favoritos.',
      periods: ['tarde', 'noite'],
      photo: p(16),
      attributes: [{ key: 'service_type', value: 'À la carte' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Galinhada da Vó',
      address: 'Rua do Bom Retiro, 88',
      numero: '88',
      bairro: 'Bom Retiro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5298,
      lng: -46.6361,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Galinhada caipira no caldeirão com arroz soltinho. A receita passou de geração em geração. Imperdível.',
      periods: ['tarde'],
      photo: p(17),
      attributes: [
        { key: 'service_type', value: 'Prato feito' },
        { key: 'food_tags', value: 'Comida caseira' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Nordestino da Barra Funda',
      address: 'Av. Auro Soares de Moura Andrade, 55',
      numero: '55',
      bairro: 'Campos Elísios',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.535,
      lng: -46.6491,
      establishment_type: 'restaurante',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Comida nordestina de verdade: baião de dois, carne de sol, buchada de bode e muito tempero do sertão.',
      periods: ['tarde'],
      photo: p(18),
      attributes: [
        { key: 'service_type', value: 'Self-service por quilo' },
        { key: 'food_tags', value: 'Nordestina' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Boteco do Higienópolis',
      address: 'Rua Maranhão, 102',
      numero: '102',
      bairro: 'Higienópolis',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5458,
      lng: -46.6615,
      establishment_type: 'restaurante',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Clássico boteco paulistano com cardápio de petiscos farto. Bolinhos de bacalhau e pastéis de feira são os destaques.',
      periods: ['tarde', 'noite'],
      photo: p(19),
      attributes: [{ key: 'service_type', value: 'À la carte' }],
    },

    // ── BARES ──────────────────────────────────────────────────────────────
    {
      id: crypto.randomUUID(),
      name: 'Bar do Bexiga',
      address: 'Rua Treze de Maio, 346',
      numero: '346',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5633,
      lng: -46.6428,
      establishment_type: 'bar',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Bar histórico do Bixiga com chope gelado, petiscos italianos e muita samba ao vivo nos fins de semana.',
      periods: ['noite', 'madrugada'],
      photo: p(20),
      attributes: [
        { key: 'bar_focus', value: 'Comida e bebida igual' },
        { key: 'drink_tags', value: 'Chopp / cerveja' },
        { key: 'has_happy_hour', value: 'true' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Boteco Central',
      address: 'Rua Florêncio de Abreu, 29',
      numero: '29',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5472,
      lng: -46.6368,
      establishment_type: 'bar',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Boteco simples, honesto e barato. Cerveja gelada, pastel e caldo de frango desde as 17h. O povo mais autêntico da cidade.',
      periods: ['tarde', 'noite'],
      photo: p(21),
      attributes: [
        { key: 'bar_focus', value: 'Bebida com petisco' },
        { key: 'drink_tags', value: 'Chopp / cerveja' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Bar Brahma República',
      address: 'Av. São João, 677',
      numero: '677',
      bairro: 'República',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5425,
      lng: -46.6417,
      establishment_type: 'bar',
      price_bucket: '45_to_80',
      status: 'approved',
      description:
        'Ícone paulistano fundado em 1948. Chope Brahma no pé, petiscos clássicos e arquitetura art déco preservada. Patrimônio da cidade.',
      periods: ['tarde', 'noite'],
      photo: p(22),
      attributes: [
        { key: 'bar_focus', value: 'Comida e bebida igual' },
        { key: 'drink_tags', value: 'Chopp / cerveja' },
        { key: 'has_happy_hour', value: 'true' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Bar Estadão',
      address: 'Av. Ipiranga, 299',
      numero: '299',
      bairro: 'Santa Cecília',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5393,
      lng: -46.6547,
      establishment_type: 'bar',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Bar 24 horas famoso pelo sanduíche de pernil. Frequentado por jornalistas, boêmios e trabalhadores noturnos há décadas.',
      periods: ['noite', 'madrugada', 'manha'],
      photo: p(23),
      attributes: [
        { key: 'bar_focus', value: 'Bebida com petisco' },
        { key: 'drink_tags', value: 'Chopp / cerveja' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Saquê Bar Liberdade',
      address: 'Rua Galvão Bueno, 201',
      numero: '201',
      bairro: 'Liberdade',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5601,
      lng: -46.6359,
      establishment_type: 'bar',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Bar japonês com extensa carta de saquês, shochus e cervejas japonesas. Edamame, gyoza e yakitori na pedida.',
      periods: ['noite'],
      photo: p(24),
      attributes: [
        { key: 'bar_focus', value: 'Bebida com petisco' },
        { key: 'drink_tags', value: 'Drinks / coquetelaria' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Barzinho da Consolação',
      address: 'Rua da Consolação, 2300',
      numero: '2300',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5534,
      lng: -46.657,
      establishment_type: 'bar',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Bar de bairro descolado com DJs aos fins de semana, drinks autorais e petiscos criativos. Ambiente jovem e despojado.',
      periods: ['noite', 'madrugada'],
      photo: p(25),
      attributes: [
        { key: 'bar_focus', value: 'Bebida com petisco' },
        { key: 'drink_tags', value: 'Drinks / coquetelaria' },
        { key: 'has_happy_hour', value: 'true' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Chopperia Higienópolis',
      address: 'Rua Sergipe, 475',
      numero: '475',
      bairro: 'Higienópolis',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5469,
      lng: -46.6622,
      establishment_type: 'bar',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Choperia tradicional com 12 torneiras de chope artesanal. Petiscos para compartilhar e ambiente de calçada agradável.',
      periods: ['tarde', 'noite'],
      photo: p(26),
      attributes: [
        { key: 'bar_focus', value: 'Bebida com petisco' },
        { key: 'drink_tags', value: 'Chopp / cerveja' },
        { key: 'has_happy_hour', value: 'true' },
      ],
    },

    // ── PADARIAS ───────────────────────────────────────────────────────────
    {
      id: crypto.randomUUID(),
      name: 'Padaria Nipônica',
      address: 'Rua Conde de Sarzedas, 38',
      numero: '38',
      bairro: 'Liberdade',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5594,
      lng: -46.6332,
      establishment_type: 'padaria',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Padaria japonesa com melonpan, anpan, pão de sal e chá verde gelado. Um pedaço do Japão no coração da Liberdade.',
      periods: ['manha', 'tarde'],
      photo: p(27),
      attributes: [{ key: 'specialty_tags', value: 'Pão artesanal' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Padaria Família Centro',
      address: 'Rua do Arouche, 88',
      numero: '88',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5451,
      lng: -46.6408,
      establishment_type: 'padaria',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Padaria tradicional aberta às 5h da manhã. Pão na chapa, coxinha e café com leite que sustentam trabalhadores do centro há 40 anos.',
      periods: ['manha', 'tarde'],
      photo: p(28),
      attributes: [
        { key: 'specialty_tags', value: 'Salgados' },
        { key: 'opens_early', value: 'true' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Café & Pão da Consolação',
      address: 'Rua da Consolação, 1850',
      numero: '1850',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5512,
      lng: -46.6552,
      establishment_type: 'padaria',
      price_bucket: '25_to_45',
      status: 'approved',
      description:
        'Padaria artesanal com pães de fermentação lenta, croissants amanteigados e cafés especiais. Café da manhã premium.',
      periods: ['manha', 'tarde'],
      photo: p(29),
      attributes: [
        { key: 'specialty_tags', value: 'Pão artesanal' },
        { key: 'specialty_tags', value: 'Café especial' },
        { key: 'opens_early', value: 'true' },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Padaria Bom Retiro',
      address: 'Rua José Paulino, 55',
      numero: '55',
      bairro: 'Bom Retiro',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5302,
      lng: -46.6378,
      establishment_type: 'padaria',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Padaria de bairro com café fresquinho, pão francês quentinho e bisnaguinha para o lanche. Preço imbatível.',
      periods: ['manha', 'tarde'],
      photo: p(30),
      attributes: [{ key: 'specialty_tags', value: 'Salgados' }],
    },
    {
      id: crypto.randomUUID(),
      name: 'Padaria Santa Cecília',
      address: 'Rua Santa Cecília, 420',
      numero: '420',
      bairro: 'Santa Cecília',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.5381,
      lng: -46.6555,
      establishment_type: 'padaria',
      price_bucket: 'up_to_25',
      status: 'approved',
      description:
        'Padaria aberta há 30 anos no bairro. Famosa pelo pão de queijo gigante e pelos salgados feitos na hora.',
      periods: ['manha', 'tarde'],
      photo: p(31),
      attributes: [
        { key: 'specialty_tags', value: 'Salgados' },
        { key: 'specialty_tags', value: 'Doces / confeitaria' },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Dados das listas — 10 listas curadas
// ---------------------------------------------------------------------------
function buildLists() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Top PFs do Centro',
      description:
        'Os melhores pratos feitos da região central de São Paulo para um almoço rápido e saboroso.',
      cover_url: LIST_COVERS[0],
      place_names: [
        'PF do Zé',
        'Feijão Tropeiro do Centro',
        'Galinhada da Vó',
        'Nordestino da Barra Funda',
        'Comida Caseira da Dona Lourdes',
        'Petisco do Brás',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Bares para Happy Hour',
      description:
        'Bares espalhados pelo centro para um happy hour com chope gelado e petiscos depois do trabalho.',
      cover_url: LIST_COVERS[1],
      place_names: [
        'Bar do Bexiga',
        'Boteco Central',
        'Bar Brahma República',
        'Bar Estadão',
        'Barzinho da Consolação',
        'Chopperia Higienópolis',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Almoço até R$25',
      description:
        'Onde comer bem e gastar menos de R$25 no centro de São Paulo. Seleção do pão-duro exigente.',
      cover_url: LIST_COVERS[2],
      place_names: [
        'PF do Zé',
        'Feijão Tropeiro do Centro',
        'Petisco do Brás',
        'Comida Caseira da Dona Lourdes',
        'Galinhada da Vó',
        'Nordestino da Barra Funda',
        'Espetinho do Cambuci',
        'Saladão da Sé',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Melhores Padarias do Centrão',
      description:
        'Das padarias tradicionais às artesanais — os melhores pãezinhos e cafés do centro expandido.',
      cover_url: LIST_COVERS[3],
      place_names: [
        'Padaria Nipônica',
        'Padaria Família Centro',
        'Café & Pão da Consolação',
        'Padaria Bom Retiro',
        'Padaria Santa Cecília',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Comida Japonesa na Liberdade',
      description:
        'O melhor da culinária japonesa no bairro mais japonês do Brasil. Do ramen ao omakase.',
      cover_url: LIST_COVERS[4],
      place_names: [
        'Japonês da Liberdade',
        'Sushi Liberdade Premium',
        'Saquê Bar Liberdade',
        'Padaria Nipônica',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Café da Manhã Especial',
      description:
        'Os melhores lugares para começar o dia com um bom café, pão fresquinho e salgados gostosos.',
      cover_url: LIST_COVERS[5],
      place_names: [
        'Padaria Família Centro',
        'Café & Pão da Consolação',
        'Padaria Santa Cecília',
        'Padaria Bom Retiro',
        'Padaria Nipônica',
        'Bar Estadão',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Petisco & Cerveja',
      description:
        'Os melhores combos de petiscos e cerveja gelada que São Paulo oferece. Pedaços de bar que alimentam a alma.',
      cover_url: LIST_COVERS[6],
      place_names: [
        'Bar do Bexiga',
        'Boteco Central',
        'Barzinho da Consolação',
        'Chopperia Higienópolis',
        'Boteco do Higienópolis',
        'Saquê Bar Liberdade',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Para Vegetarianos',
      description:
        'Opções vegetarianas e veganas de qualidade no centro de SP. Comer bem sem carne é possível.',
      cover_url: LIST_COVERS[7],
      place_names: [
        'Verde & Vida',
        'Saladão da Sé',
        'Café & Pão da Consolação',
        'Tempero de Minas',
        'Padaria Nipônica',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Clássicos Paulistanos',
      description:
        'Lugares históricos que são parte da identidade gastronômica de São Paulo. Todo paulistano deve conhecer.',
      cover_url: LIST_COVERS[8],
      place_names: [
        'Bar Brahma República',
        'Bar Estadão',
        'Cantina do Bixiga',
        'Feijão Tropeiro do Centro',
        'Padaria Família Centro',
        'Bar do Bexiga',
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Jantar Romântico no Centro',
      description:
        'Lugares perfeitos para um jantar especial a dois no centro e arredores. Boa comida, bom ambiente.',
      cover_url: LIST_COVERS[9],
      place_names: [
        'Cantina do Bixiga',
        'Massas & Cia',
        'Bistrô República',
        'Pizza Bela Vista',
        'Churrasco do Rei',
        'Árabe do Glicério',
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Reviews — uma por lugar, do mesmo usuário
// ---------------------------------------------------------------------------
function buildReviews(places) {
  const data = [
    // restaurantes
    {
      name: 'PF do Zé',
      rating: 5,
      food: 5,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Melhor PF do centro! Bife acebolado perfeito, feijão cremoso e salada fresquinha. Fila vale muito a pena.',
    },
    {
      name: 'Cantina do Bixiga',
      rating: 4,
      food: 5,
      service: 4,
      value: 3,
      price_bucket: '25_to_45',
      comment:
        'Massa fresca incrível, molho de tomate caseiro. Ambiente aconchegante. Um pouco caro mas vale.',
    },
    {
      name: 'Saladão da Sé',
      rating: 4,
      food: 4,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment: 'Ótimas opções vegetarianas, tudo muito fresco. Preço justo e atendimento rápido.',
    },
    {
      name: 'Japonês da Liberdade',
      rating: 5,
      food: 5,
      service: 5,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Rodízio excelente, peixe fresco e hot roll delicioso. Um dos melhores da Liberdade.',
    },
    {
      name: 'Churrasco do Rei',
      rating: 4,
      food: 5,
      service: 3,
      value: 3,
      price_bucket: '45_to_80',
      comment:
        'Carne de qualidade, cortes bem temperados. Serviço um pouco lento mas a comida compensa.',
    },
    {
      name: 'Comida da Minha Terra',
      rating: 5,
      food: 5,
      service: 5,
      value: 5,
      price_bucket: '25_to_45',
      comment:
        'Feijão tropeiro de dar lágrimas! Frango com quiabo perfeito. Atendimento familiar e carinhoso.',
    },
    {
      name: 'Bistrô República',
      rating: 4,
      food: 4,
      service: 5,
      value: 3,
      price_bucket: '45_to_80',
      comment:
        'Ambiente sofisticado e menu executivo bem elaborado. Atendimento impecável. Preço elevado.',
    },
    {
      name: 'Comida Caseira da Dona Lourdes',
      rating: 5,
      food: 5,
      service: 5,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Comida de vó de verdade! Sopa quentinha, prato farto e sobremesa caseira por menos de R$25. Imperdível.',
    },
    {
      name: 'Tempero de Minas',
      rating: 4,
      food: 4,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment: 'Buffet por quilo com muitas opções mineiras. Sempre fresquinho e bem temperado.',
    },
    {
      name: 'Petisco do Brás',
      rating: 3,
      food: 3,
      service: 3,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Comida básica mas honesta. O preço é imbatível para a região. Serve bem pra quem quer gastar pouco.',
    },
    {
      name: 'Pizza Bela Vista',
      rating: 5,
      food: 5,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Pizza napolitana autêntica, massa fininha e crocante. Mussarela de búfala derretendo. Top demais.',
    },
    {
      name: 'Feijão Tropeiro do Centro',
      rating: 5,
      food: 5,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Desde 1987 e nunca decepcionou. Torresmo crocante, feijão tropeiro generoso. Patrimônio do centro.',
    },
    {
      name: 'Sushi Liberdade Premium',
      rating: 4,
      food: 5,
      service: 4,
      value: 3,
      price_bucket: '45_to_80',
      comment: 'Peixe fresco e combinados criativos. O salmão desmancha na boca. Vale o preço.',
    },
    {
      name: 'Verde & Vida',
      rating: 4,
      food: 4,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Variedade vegetariana impressionante. Proteína de soja bem temperada e saladas criativas.',
    },
    {
      name: 'Espetinho do Cambuci',
      rating: 4,
      food: 4,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Espetinho na brasa bem gostoso, farinha sequinha. Lugar simples mas cumpre o papel com gosto.',
    },
    {
      name: 'Árabe do Glicério',
      rating: 5,
      food: 5,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Esfiha aberta incrível, homus cremoso e kibe frito na hora. Família árabe atenciosa.',
    },
    {
      name: 'Massas & Cia',
      rating: 5,
      food: 5,
      service: 5,
      value: 3,
      price_bucket: '45_to_80',
      comment:
        'Nhoque de domingo é uma experiência. Ravióli de ricota com molho de manteiga e sálvia: perfeito.',
    },
    {
      name: 'Galinhada da Vó',
      rating: 5,
      food: 5,
      service: 5,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Galinhada caipira do jeito certo: caldinho, frango macio, arroz soltinho. Receita de família.',
    },
    {
      name: 'Nordestino da Barra Funda',
      rating: 4,
      food: 5,
      service: 3,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Baião de dois autêntico, carne de sol macia. Serviço um pouco desorganizado mas a comida é nota 10.',
    },
    {
      name: 'Boteco do Higienópolis',
      rating: 4,
      food: 4,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Bolinho de bacalhau crocante e pastel de carne bem recheado. Bom para um petisco no fim do dia.',
    },
    // bares
    {
      name: 'Bar do Bexiga',
      rating: 5,
      food: 4,
      service: 5,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Chope gelado, samba ao vivo e petiscos italianos. O melhor ambiente para uma noite no Bixiga.',
    },
    {
      name: 'Boteco Central',
      rating: 4,
      food: 3,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Cerveja gelada e pastel quentinho por preço de amigo. O boteco mais autêntico do centro velho.',
    },
    {
      name: 'Bar Brahma República',
      rating: 5,
      food: 4,
      service: 5,
      value: 3,
      price_bucket: '45_to_80',
      comment:
        'Patrimônio histórico de São Paulo. Arquitetura art déco preservada e chope Brahma no pé. Imperdível.',
    },
    {
      name: 'Bar Estadão',
      rating: 5,
      food: 5,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'Sanduíche de pernil às 3h da manhã é uma experiência única. Clássico absoluto da noite paulistana.',
    },
    {
      name: 'Saquê Bar Liberdade',
      rating: 4,
      food: 4,
      service: 4,
      value: 3,
      price_bucket: '25_to_45',
      comment:
        'Boa carta de saquês, gyoza crocante e yakitori bem grelhado. Ambiente intimista e agradável.',
    },
    {
      name: 'Barzinho da Consolação',
      rating: 4,
      food: 3,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        'DJ bom e drinks bem feitos. Ótimo para uma noite descolada. Atmosfera jovem e descontraída.',
    },
    {
      name: 'Chopperia Higienópolis',
      rating: 4,
      food: 4,
      service: 4,
      value: 4,
      price_bucket: '25_to_45',
      comment:
        '12 torneiras de chope artesanal, cada uma com personalidade diferente. Petiscos para compartilhar.',
    },
    // padarias
    {
      name: 'Padaria Nipônica',
      rating: 5,
      food: 5,
      service: 5,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Melonpan fresquinho de manhã cedo é uma das melhores coisas que já comi. Chá verde gelado nota 10.',
    },
    {
      name: 'Padaria Família Centro',
      rating: 4,
      food: 4,
      service: 5,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Pão na chapa às 6h da manhã com café com leite. A padaria que sustenta o centro de SP há 40 anos.',
    },
    {
      name: 'Café & Pão da Consolação',
      rating: 5,
      food: 5,
      service: 4,
      value: 3,
      price_bucket: '25_to_45',
      comment:
        'Croissant amanteigado perfeito e café de origem especial. O melhor café da manhã artesanal do centro.',
    },
    {
      name: 'Padaria Bom Retiro',
      rating: 4,
      food: 4,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment: 'Pão francês fresquinho a qualquer hora. Preço justo e atendimento simpático.',
    },
    {
      name: 'Padaria Santa Cecília',
      rating: 4,
      food: 4,
      service: 4,
      value: 5,
      price_bucket: 'up_to_25',
      comment:
        'Pão de queijo gigante que vale a viagem. Salgados feitos na hora e sempre quentinhos.',
    },
  ];

  const byName = new Map(places.map((p) => [p.name, p]));

  return data
    .map((r) => {
      const place = byName.get(r.name);
      if (!place) return null;
      return { ...r, id: crypto.randomUUID(), place_id: place.id };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  loadEnv();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌  DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅  Conectado ao banco de dados\n');

  const places = buildPlaces();

  // ── 1. Inserir lugares ──────────────────────────────────────────────────
  console.log(`📍  Inserindo ${places.length} lugares...`);
  let insertedPlaces = 0;

  for (const place of places) {
    // place principal
    await client.query(
      `INSERT INTO places (
        id, name, address, numero, bairro, cidade, estado,
        location, lat, lng,
        establishment_type, price_bucket,
        status, description, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        ST_GeogFromText($8), $9, $10,
        $11, $12,
        $13, $14, $15
      ) ON CONFLICT (id) DO NOTHING`,
      [
        place.id,
        place.name,
        place.address,
        place.numero ?? null,
        place.bairro ?? null,
        place.cidade,
        place.estado,
        `POINT(${place.lng} ${place.lat})`,
        place.lat,
        place.lng,
        place.establishment_type,
        place.price_bucket,
        place.status,
        place.description ?? null,
        USER_ID,
      ],
    );

    // períodos de operação
    for (const period of place.periods ?? []) {
      await client.query(
        `INSERT INTO place_periods (place_id, period) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [place.id, period],
      );
    }

    // foto de capa
    if (place.photo) {
      await client.query(
        `INSERT INTO place_photos (id, place_id, url, type, position, uploaded_by)
         VALUES ($1, $2, $3, 'cover', 0, $4) ON CONFLICT DO NOTHING`,
        [crypto.randomUUID(), place.id, place.photo, USER_ID],
      );
    }

    // atributos contextuais (service_type, food_tags, bar_focus, drink_tags, etc.)
    for (const attr of place.attributes ?? []) {
      await client.query(
        `INSERT INTO place_attributes (place_id, key, value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [place.id, attr.key, attr.value],
      );
    }

    insertedPlaces++;
    process.stdout.write(`   ✓ ${place.name}\n`);
  }

  console.log(`\n✅  ${insertedPlaces} lugares inseridos\n`);

  // ── 2. Inserir listas ───────────────────────────────────────────────────
  const placesByName = new Map(places.map((p) => [p.name, p]));
  const lists = buildLists();

  console.log(`📋  Inserindo ${lists.length} listas...`);
  let insertedLists = 0;

  for (const list of lists) {
    await client.query(
      `INSERT INTO lists (id, owner_id, name, description, is_public, cover_url)
       VALUES ($1, $2, $3, $4, true, $5) ON CONFLICT (id) DO NOTHING`,
      [list.id, USER_ID, list.name, list.description ?? null, list.cover_url ?? null],
    );

    let position = 0;
    const missing = [];

    for (const placeName of list.place_names ?? []) {
      const place = placesByName.get(placeName);
      if (!place) {
        missing.push(placeName);
        continue;
      }

      await client.query(
        `INSERT INTO list_places (list_id, place_id, position)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [list.id, place.id, position++],
      );
    }

    insertedLists++;
    const count = (list.place_names?.length ?? 0) - missing.length;
    process.stdout.write(`   ✓ "${list.name}" — ${count} lugares\n`);

    if (missing.length > 0) {
      console.warn(`     ⚠ Lugares não encontrados: ${missing.join(', ')}`);
    }
  }

  console.log(`\n✅  ${insertedLists} listas inseridas\n`);

  // ── 3. Inserir reviews ──────────────────────────────────────────────────
  const reviews = buildReviews(places);
  console.log(`⭐  Inserindo ${reviews.length} reviews...`);
  let insertedReviews = 0;

  for (const review of reviews) {
    await client.query(
      `INSERT INTO reviews (id, place_id, user_id, rating, price_bucket, comment)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (place_id, user_id) DO NOTHING`,
      [
        review.id,
        review.place_id,
        USER_ID,
        review.rating,
        review.price_bucket ?? null,
        review.comment ?? null,
      ],
    );

    for (const category of ['food', 'service', 'value']) {
      await client.query(
        `INSERT INTO review_scores (review_id, category, score)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [review.id, category, review[category]],
      );
    }

    insertedReviews++;
    process.stdout.write(`   ✓ ${review.name} — ${review.rating}★\n`);
  }

  console.log(`\n✅  ${insertedReviews} reviews inseridas\n`);

  await client.end();
  console.log('🎉  Seed concluído com sucesso!');
  console.log(`\n   Usuário: ${USER_ID}`);
  console.log(`   Lugares: ${insertedPlaces}`);
  console.log(`   Listas:  ${insertedLists}`);
  console.log(`   Reviews: ${insertedReviews}`);
}

main().catch((err) => {
  console.error('❌  Erro no seed:', err.message);
  process.exit(1);
});
