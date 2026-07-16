// 2026年 第29週 — テイスト「深海ネオン」
// 生成ルール（このテイストが効かせた所）:
//   palette : primary=暗色 / secondary=ほぼ黒 / accent=ネオン に拘束
//   parts   : glow_01(発光目) と antenna_02(発光アンテナ=提灯) を重み増
//   effect  : bioluminescence を重み増
//   naming  : 深海生物の語感 × 日常の場所 → 「実在しそうで実在しない」
//   habitat : 水たまり/街なか/ありえない場所 に寄せる（海に海の魚がいても驚きがない）

export const WEEK = {
  id: '2026-w29',
  theme: '深海ネオン',
  note: '深海にいるはずの生き物が、側溝や自販機の下で光っている週。',
};

// パレット（このテイストの拘束）
const P = {
  navy:    { primary: '#1e5c8a', secondary: '#0a1428', accent: '#00f0ff' },
  violet:  { primary: '#4a2d7a', secondary: '#150a2e', accent: '#ff2fb0' },
  teal:    { primary: '#16544f', secondary: '#04201d', accent: '#7fff3d' },
  abyss:   { primary: '#1a3560', secondary: '#080f24', accent: '#ffe94a' },
  slate:   { primary: '#243447', secondary: '#0b1119', accent: '#3dfff0' },
  ember:   { primary: '#3a1f5c', secondary: '#120823', accent: '#ff8c3d' },
  ink:     { primary: '#12303a', secondary: '#050f14', accent: '#a8ffdb' },
  plum:    { primary: '#2e1a45', secondary: '#0d0518', accent: '#c86dff' },
};

export const CREATURES = [
  // ---- ★1 ----
  {
    name: 'ミゾホタル',
    flavor: '側溝の浅い水で点滅している。雨の翌朝がいちばん多い。',
    rarity: 1, habitat: ['puddle'],
    parts: { body: 'round_01', head: 'fish_01', tail: 'fin_01', eyes: 'glow_01', deco: null },
    palette: P.teal, pattern: 'dots', effect: 'bioluminescence',
    stats: { power: 12, speed: 44, weight: 0.2 },
  },
  {
    name: 'アメツブクラゲ',
    flavor: '降りはじめの水たまりに湧いて、乾く前に消える。',
    rarity: 1, habitat: ['puddle'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fin_01', eyes: 'round_01', deco: null },
    palette: P.slate, pattern: 'none', effect: 'bubbles',
    stats: { power: 8, speed: 30, weight: 0.1 },
  },
  {
    name: 'ハイスイボヤ',
    flavor: '排水口のふちに張りついている。つつくとしぼむ。',
    rarity: 1, habitat: ['urban'],
    parts: { body: 'blob_01', head: 'tube_03', tail: 'fin_01', eyes: 'sleepy_01', deco: null },
    palette: P.ink, pattern: 'dots', effect: 'none',
    stats: { power: 20, speed: 8, weight: 1.4 },
  },
  {
    name: 'カサノシズク',
    flavor: '傘立ての底にたまる。ほんのり冷たく光る。',
    rarity: 1, habitat: ['urban'],
    parts: { body: 'tall_01', head: 'dome_01', tail: 'fin_01', eyes: 'glow_01', deco: null },
    palette: P.navy, pattern: 'none', effect: 'bioluminescence',
    stats: { power: 10, speed: 22, weight: 0.3 },
  },

  // ---- ★2 ----
  {
    name: 'ソッコウチョウチン',
    flavor: '側溝の奥から提灯を垂らしている。覗き込むと引っ込む。',
    rarity: 2, habitat: ['puddle'],
    parts: { body: 'round_01', head: 'fang_02', tail: 'fin_01', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.abyss, pattern: 'none', effect: 'bioluminescence',
    stats: { power: 48, speed: 18, weight: 2.6 },
  },
  {
    name: 'ダクトウナギ',
    flavor: '換気ダクトを泳いでいる。釣り上げると油の匂いがする。',
    rarity: 2, habitat: ['urban'],
    parts: { body: 'serpent_01', head: 'tube_03', tail: 'eel_01', eyes: 'round_01', deco: null },
    palette: P.ember, pattern: 'zigzag', effect: 'none',
    stats: { power: 35, speed: 71, weight: 1.8 },
  },
  {
    name: 'マドベクラゲ',
    flavor: '夜の窓ガラスに貼りついて、室内の光を吸っている。',
    rarity: 2, habitat: ['urban'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fan_02', eyes: 'tri_02', deco: null },
    palette: P.plum, pattern: 'rings', effect: 'bioluminescence',
    stats: { power: 26, speed: 40, weight: 0.6 },
  },
  {
    name: 'ミズタマリイカ',
    flavor: 'アスファルトの照り返しに擬態する。踏むまで気づかない。',
    rarity: 2, habitat: ['puddle'],
    parts: { body: 'flat_01', head: 'tube_03', tail: 'ribbon_01', eyes: 'round_01', deco: 'whisker_01' },
    palette: P.slate, pattern: 'scales', effect: 'bubbles',
    stats: { power: 33, speed: 58, weight: 1.1 },
  },
  {
    name: 'ハシラウオ',
    flavor: '電柱の根本の、いつも湿っている所にいる。',
    rarity: 2, habitat: ['urban'],
    parts: { body: 'tall_01', head: 'fish_01', tail: 'fin_01', eyes: 'round_01', deco: 'spikes_top' },
    palette: P.ink, pattern: 'stripe_diagonal', effect: 'none',
    stats: { power: 52, speed: 24, weight: 4.3 },
  },

  // ---- ★3 ----
  {
    name: 'ジハンキクラゲ',
    flavor: '自販機の下の暗がりに漂う。釣り銭の落ちる音に反応する。',
    rarity: 3, habitat: ['urban'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fan_02', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.violet, pattern: 'dots', effect: 'bioluminescence',
    stats: { power: 44, speed: 62, weight: 0.9 },
  },
  {
    name: 'ガイトウアンコウ',
    flavor: '街灯の真下でだけ釣れる。自分では光れないので借りている。',
    rarity: 3, habitat: ['urban', 'impossible'],
    parts: { body: 'round_01', head: 'fang_02', tail: 'spike_03', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.abyss, pattern: 'scales', effect: 'bioluminescence',
    stats: { power: 74, speed: 20, weight: 8.2 },
  },
  {
    name: 'ハイスイコウノヌシ',
    flavor: '同じ排水溝に何年もいる個体。とにかくデカい。',
    rarity: 3, habitat: ['puddle'],
    parts: { body: 'round_01', head: 'hammer_01', tail: 'fin_01', eyes: 'round_01', deco: 'crown_01' },
    palette: P.teal, pattern: 'scales', effect: 'bubbles',
    stats: { power: 81, speed: 15, weight: 14.7 },
  },
  {
    name: 'ネオンドジョウ',
    flavor: '側溝の泥を吸って、吸った色に光る。場所によって色が違う。',
    rarity: 3, habitat: ['puddle'],
    parts: { body: 'serpent_01', head: 'tube_03', tail: 'eel_01', eyes: 'glow_01', deco: 'whisker_01' },
    palette: P.navy, pattern: 'stripe_diagonal', effect: 'bioluminescence',
    stats: { power: 40, speed: 84, weight: 1.3 },
  },
  {
    name: 'コウジョウホタルイカ',
    flavor: '工場の排水路にしかいない。夜勤の人だけが知っている。',
    rarity: 3, habitat: ['urban'],
    parts: { body: 'mecha_01', head: 'beak_01', tail: 'ribbon_01', eyes: 'tri_02', deco: 'antenna_02' },
    palette: P.ember, pattern: 'dots', effect: 'bioluminescence',
    stats: { power: 66, speed: 47, weight: 5.5 },
  },

  // ---- ★4 ----
  {
    name: 'チカドウチョウチン',
    flavor: '地下道の非常灯の下。人が誰もいない時間にだけ出てくる。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'serpent_01', head: 'fang_02', tail: 'spike_03', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.plum, pattern: 'stripe_diagonal', effect: 'bioluminescence',
    stats: { power: 78, speed: 66, weight: 3.4 },
  },
  {
    name: 'カンバンクラゲ',
    flavor: 'ネオン看板の中を泳いでいる。看板が消えると一緒に死ぬ。',
    rarity: 4, habitat: ['urban', 'impossible'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fan_02', eyes: 'glow_01', deco: 'horn_01' },
    palette: P.violet, pattern: 'none', effect: 'bioluminescence',
    stats: { power: 55, speed: 92, weight: 0.5 },
  },
  {
    name: 'ヨルノハイスイ',
    flavor: '深夜0時を過ぎた排水口から出る。形が最後まで定まらない。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'blob_01', head: 'tube_03', tail: 'spike_03', eyes: 'cyclops_01', deco: 'horn_01' },
    palette: P.ink, pattern: 'none', effect: 'bioluminescence',
    stats: { power: 87, speed: 54, weight: 2.0 },
  },
  {
    name: 'デンチュウノヌシ',
    flavor: '電柱のてっぺんにいる。地面に降りてきた記録はない。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'mecha_01', head: 'dome_01', tail: 'fan_02', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.abyss, pattern: 'dots', effect: 'sparkle',
    stats: { power: 83, speed: 38, weight: 21.0 },
  },

  // ---- ★5 ----
  {
    name: 'オクジョウチョウチン',
    flavor: 'ビルの屋上、水気のまったくない場所で釣れる。深海の生き物のはずなのに。',
    rarity: 5, habitat: ['impossible'],
    parts: { body: 'round_01', head: 'fang_02', tail: 'fan_02', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.navy, pattern: 'scales', effect: 'bioluminescence',
    stats: { power: 95, speed: 71, weight: 11.3 },
  },
  {
    name: 'テイデンヌシ',
    flavor: '街の明かりを全部吸い込んで光る。こいつが釣れた夜は、あたりが真っ暗になる。',
    rarity: 5, habitat: ['impossible'],
    parts: { body: 'serpent_01', head: 'fang_02', tail: 'spike_03', eyes: 'tri_02', deco: 'crown_01' },
    palette: P.plum, pattern: 'stripe_diagonal', effect: 'sparkle',
    stats: { power: 99, speed: 88, weight: 6.6 },
  },
];
