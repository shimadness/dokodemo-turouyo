// 手書きサンプル5体 — 「これ集めたい」と思えるかの関門
export const SAMPLES = [
  {
    name: 'ネオンドロヘビ',
    flavor: '側溝の常連。街灯の色を吸って光る。',
    rarity: 4,
    habitat: ['puddle', 'urban'],
    parts: { body: 'serpent_01', head: 'tube_03', tail: 'fan_02', eyes: 'glow_01', deco: 'antenna_02' },
    palette: { primary: '#00e5ff', secondary: '#2a1060', accent: '#ff2fb0' },
    pattern: 'stripe_diagonal',
    effect: 'bioluminescence',
    stats: { power: 62, speed: 88, weight: 3.2 },
  },
  {
    name: 'マンホールゴイ',
    flavor: 'マンホールの下に棲む錦鯉のなれの果て。雨の日だけ顔を出す。',
    rarity: 2,
    habitat: ['puddle'],
    parts: { body: 'round_01', head: 'fish_01', tail: 'fin_01', eyes: 'round_01', deco: 'whisker_01' },
    palette: { primary: '#f5f0e6', secondary: '#c94f2e', accent: '#e0552f' },
    pattern: 'scales',
    effect: 'bubbles',
    stats: { power: 41, speed: 35, weight: 6.8 },
  },
  {
    name: 'サビガシャン',
    flavor: '駐車場の油膜から生まれた機械魚。ネジを食べて育つ。',
    rarity: 3,
    habitat: ['urban', 'impossible'],
    parts: { body: 'mecha_01', head: 'dome_01', tail: 'spike_03', eyes: 'tri_02', deco: 'antenna_02' },
    palette: { primary: '#d98436', secondary: '#5a3a20', accent: '#ffd94a' },
    pattern: 'dots',
    effect: 'sparkle',
    stats: { power: 77, speed: 30, weight: 18.5 },
  },
  {
    name: 'ヨナキダマ',
    flavor: '真夜中の自販機の下でだけ釣れる。泣き声は誰も聞いたことがない。',
    rarity: 5,
    habitat: ['impossible'],
    parts: { body: 'blob_01', head: 'dome_01', tail: 'fan_02', eyes: 'glow_01', deco: 'horn_01' },
    palette: { primary: '#3b2d6e', secondary: '#120a2e', accent: '#ffe98a' },
    pattern: 'none',
    effect: 'bioluminescence',
    stats: { power: 90, speed: 66, weight: 0.4 },
  },
  {
    name: 'シバフヌシ',
    flavor: '公園の芝生を泳ぐ主。犬の散歩コースを縄張りにしている。',
    rarity: 3,
    habitat: ['urban'],
    parts: { body: 'round_01', head: 'fang_02', tail: 'spike_03', eyes: 'round_01', deco: 'fin_top' },
    palette: { primary: '#7ec850', secondary: '#2e5c1e', accent: '#c8e86a' },
    pattern: 'stripe_diagonal',
    effect: 'none',
    stats: { power: 68, speed: 52, weight: 12.0 },
  },
];

// ランダム生成 — 将来 LLM が担う部分の代役（組み合わせ爆発の確認用）
import { BODIES, HEADS, TAILS, EYES, DECOS, PATTERNS } from './parts.js';

const PALETTES = [
  { primary: '#ff6b6b', secondary: '#5c1a2e', accent: '#ffe66d' },
  { primary: '#4ecdc4', secondary: '#1a3a5c', accent: '#ff6b9d' },
  { primary: '#a06cd5', secondary: '#2d1b4e', accent: '#6effc1' },
  { primary: '#f0a35e', secondary: '#6e3a1a', accent: '#5ee8f0' },
  { primary: '#6ea8fe', secondary: '#1a2d5c', accent: '#ffb35e' },
  { primary: '#d8e05e', secondary: '#3a4a1a', accent: '#e05ed8' },
  { primary: '#e8e8f0', secondary: '#4a4a6e', accent: '#ff4a6e' },
  { primary: '#3ddb84', secondary: '#0e3d26', accent: '#dbff3d' },
];

const NAME_HEAD = ['ネオ', 'ドブ', 'カゲ', 'ピカ', 'サビ', 'ユメ', 'ゴミ', 'ツキ', 'アメ', 'ドロ', 'ホシ', 'カサ'];
const NAME_TAIL = ['ウオ', 'ヘビ', 'ダマ', 'ガメ', 'クラゲ', 'ゴイ', 'ヌシ', 'ビト', 'マル', 'キング'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const keys = (obj) => Object.keys(obj);

export function randomSpec() {
  const effectPool = ['none', 'bioluminescence', 'bubbles', 'sparkle'];
  return {
    name: pick(NAME_HEAD) + pick(NAME_TAIL),
    flavor: 'ランダム生成のプロトタイプ個体。',
    rarity: 1 + Math.floor(Math.random() * 5),
    habitat: [pick(['sea', 'river', 'puddle', 'urban', 'impossible'])],
    parts: {
      body: pick(keys(BODIES)),
      head: pick(keys(HEADS)),
      tail: pick(keys(TAILS)),
      eyes: pick(keys(EYES)),
      deco: Math.random() < 0.85 ? pick(keys(DECOS)) : null,
    },
    palette: pick(PALETTES),
    pattern: pick(keys(PATTERNS)),
    effect: pick(effectPool),
    stats: {
      power: 10 + Math.floor(Math.random() * 90),
      speed: 10 + Math.floor(Math.random() * 90),
      weight: Math.round(Math.random() * 200) / 10,
    },
  };
}
