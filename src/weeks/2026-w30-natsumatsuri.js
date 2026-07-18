// 2026年 第30週 — テイスト「夏祭り・縁日」
// 生成ルール（このテイストが効かせた所）:
//   palette : primary=祭りの彩色(朱/金魚紅/藍/綿あめ) / secondary=夜店の闇 / accent=提灯・花火の光
//   parts   : round_01(金魚・提灯・太鼓の丸) と fan_02/ribbon_01(ひらひら尾) を重み増
//   effect  : sparkle(花火・つや) を重み増
//   naming  : 縁日の物の語感 × 日常の場所 → 「祭りが終わっても残っている」感
//   habitat : 祭り会場には置かない。側溝・自販機の横・翌朝の境内 — 日常に祭りの気配が滲むのが報酬

export const WEEK = {
  id: '2026-w30',
  theme: '夏祭り・縁日',
  note: '祭りの晩に逃げ出したものたちが、なんでもない日常の水辺に住みついている週。',
};

// パレット（このテイストの拘束）
const P = {
  kingyo:   { primary: '#d43d2a', secondary: '#26100c', accent: '#ffd9c2' }, // 金魚紅
  lantern:  { primary: '#b03a2e', secondary: '#1a0e08', accent: '#ffb84d' }, // 提灯の朱と灯り
  ramune:   { primary: '#2e7fb8', secondary: '#0a1c2e', accent: '#aef1ff' }, // ラムネ瓶
  yozora:   { primary: '#26355c', secondary: '#0b0f24', accent: '#ffd94d' }, // 花火の夜空
  wataame:  { primary: '#d477a8', secondary: '#2e1024', accent: '#ffe3f2' }, // 綿あめ
  ringoame: { primary: '#a31f2f', secondary: '#240508', accent: '#ff5b6e' }, // りんご飴のつや
  melon:    { primary: '#3f9e6a', secondary: '#0d2417', accent: '#b8ffd0' }, // メロンシロップ
  aizome:   { primary: '#29527a', secondary: '#0c1626', accent: '#9fd8ff' }, // 藍染の浴衣
  kingin:   { primary: '#3a3244', secondary: '#120e18', accent: '#ffc76e' }, // 出目金の黒と金
  hanabi:   { primary: '#d4593a', secondary: '#2a0f0a', accent: '#ffd94d' }, // 開いた尺玉の暖色
};

export const CREATURES = [
  // ---- ★1 ----
  {
    name: 'ミゾキンギョ',
    flavor: '縁日で逃げのびた金魚のなれのはて。側溝で野生化して三代目になる。',
    rarity: 1, habitat: ['puddle'],
    parts: { body: 'round_01', head: 'fish_01', tail: 'fan_02', eyes: 'round_01', deco: null },
    palette: P.kingyo, pattern: 'scales', effect: 'none',
    stats: { power: 10, speed: 38, weight: 0.15 },
  },
  {
    name: 'ヨーヨーフグ',
    flavor: '水たまりに浮いていて、つつくとぱんと跳ねる。腹に輪ゴムの跡がある。',
    rarity: 1, habitat: ['puddle'],
    parts: { body: 'blob_01', head: 'dome_01', tail: 'fin_01', eyes: 'round_01', deco: null },
    palette: P.aizome, pattern: 'rings', effect: 'bubbles',
    stats: { power: 14, speed: 20, weight: 0.3 },
  },
  {
    name: 'ラムネクラゲ',
    flavor: '自販機の横で泡を吐いている。体の中でビー玉がころんと鳴る。',
    rarity: 1, habitat: ['urban'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fin_01', eyes: 'sleepy_01', deco: null },
    palette: P.ramune, pattern: 'dots', effect: 'bubbles',
    stats: { power: 8, speed: 26, weight: 0.2 },
  },
  {
    name: 'ワタアメウオ',
    flavor: '雨上がりの空き地にふわふわ浮かんでいる。雨に当たるとひとまわり縮む。',
    rarity: 1, habitat: ['urban'],
    parts: { body: 'blob_01', head: 'dome_01', tail: 'ribbon_01', eyes: 'sleepy_01', deco: null },
    palette: P.wataame, pattern: 'none', effect: 'none',
    stats: { power: 6, speed: 15, weight: 0.05 },
  },

  // ---- ★2 ----
  {
    name: 'リンゴアメダイ',
    flavor: 'つやつやに固まった鯛。かじると甘いらしいが、歯が立った者はいない。',
    rarity: 2, habitat: ['urban'],
    parts: { body: 'round_01', head: 'fish_01', tail: 'fin_01', eyes: 'round_01', deco: null },
    palette: P.ringoame, pattern: 'scales', effect: 'sparkle',
    stats: { power: 40, speed: 22, weight: 2.2 },
  },
  {
    name: 'タコヤキダコ',
    flavor: 'たこ焼きの舟の下に隠れている。丸まると本物と見分けがつかない。',
    rarity: 2, habitat: ['urban'],
    parts: { body: 'blob_01', head: 'tube_03', tail: 'ribbon_01', eyes: 'round_01', deco: 'whisker_01' },
    palette: P.lantern, pattern: 'dots', effect: 'none',
    stats: { power: 36, speed: 50, weight: 1.0 },
  },
  {
    name: 'カキゴオリウオ',
    flavor: '真夏でも冷たい水にしかいない。釣り上げた手がキーンとする。',
    rarity: 2, habitat: ['puddle'],
    parts: { body: 'flat_01', head: 'dome_01', tail: 'fan_02', eyes: 'sleepy_01', deco: null },
    palette: P.melon, pattern: 'zigzag', effect: 'none',
    stats: { power: 28, speed: 44, weight: 1.5 },
  },
  {
    name: 'ハナビメダカ',
    flavor: '夜の水たまりの表面でぱちぱち爆ぜる。最後にぽとりと落ちて終わる。',
    rarity: 2, habitat: ['puddle'],
    parts: { body: 'tall_01', head: 'fish_01', tail: 'spike_03', eyes: 'glow_01', deco: null },
    palette: P.yozora, pattern: 'none', effect: 'sparkle',
    stats: { power: 24, speed: 66, weight: 0.4 },
  },
  {
    name: 'ヤタイウナギ',
    flavor: '祭りの翌朝、屋台のあった場所の水たまりにいる。かすかにソースの匂いがする。',
    rarity: 2, habitat: ['puddle', 'urban'],
    parts: { body: 'serpent_01', head: 'tube_03', tail: 'eel_01', eyes: 'round_01', deco: 'whisker_01' },
    palette: P.lantern, pattern: 'stripe_diagonal', effect: 'none',
    stats: { power: 48, speed: 60, weight: 1.9 },
  },

  // ---- ★3 ----
  {
    name: 'デメキンノヌシ',
    flavor: '金魚すくいの水槽の主だった個体。ポイを何百枚も破ってきた面構え。',
    rarity: 3, habitat: ['urban'],
    parts: { body: 'round_01', head: 'fish_01', tail: 'fan_02', eyes: 'cyclops_01', deco: 'crown_01' },
    palette: P.kingin, pattern: 'scales', effect: 'bubbles',
    stats: { power: 70, speed: 30, weight: 6.8 },
  },
  {
    name: 'オメンナマズ',
    flavor: '顔だけがお面のように白い。夜店の面をかぶったまま帰れなくなったという説がある。',
    rarity: 3, habitat: ['puddle'],
    parts: { body: 'flat_01', head: 'hammer_01', tail: 'eel_01', eyes: 'tri_02', deco: 'whisker_01' },
    palette: P.aizome, pattern: 'none', effect: 'none',
    stats: { power: 64, speed: 35, weight: 5.2 },
  },
  {
    name: 'ヨミセアンコウ',
    flavor: '誰もいない夜の商店街に提灯を下げて店を出す。何を売っているのかは分からない。',
    rarity: 3, habitat: ['urban', 'impossible'],
    parts: { body: 'round_01', head: 'fang_02', tail: 'fin_01', eyes: 'glow_01', deco: 'antenna_02' },
    palette: P.lantern, pattern: 'dots', effect: 'bioluminescence',
    stats: { power: 72, speed: 25, weight: 7.5 },
  },
  {
    name: 'ポイクラゲ',
    flavor: '破れたポイの形をしている。すくおうとした人間を、逆にすくって帰る。',
    rarity: 3, habitat: ['impossible', 'urban'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'fan_02', eyes: 'tri_02', deco: null },
    palette: P.wataame, pattern: 'rings', effect: 'none',
    stats: { power: 44, speed: 58, weight: 0.7 },
  },
  {
    name: 'テミズゴイ',
    flavor: '神社の手水舎に住みついた鯉。柄杓ですくうと、なんとなく罰があたる気がする。',
    rarity: 3, habitat: ['urban'],
    parts: { body: 'tall_01', head: 'fish_01', tail: 'ribbon_01', eyes: 'sleepy_01', deco: 'fin_top' },
    palette: P.aizome, pattern: 'scales', effect: 'bubbles',
    stats: { power: 76, speed: 40, weight: 9.4 },
  },

  // ---- ★4 ----
  {
    name: 'オハヤシナマズ',
    flavor: '夜中にどこからか太鼓の音がする夜は、こいつが腹を鳴らしている。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'round_01', head: 'hammer_01', tail: 'eel_01', eyes: 'tri_02', deco: 'spikes_top' },
    palette: P.kingin, pattern: 'zigzag', effect: 'none',
    stats: { power: 85, speed: 45, weight: 12.0 },
  },
  {
    name: 'オミコシウオ',
    flavor: '担ぎ手のいない神輿が夜中にひとりでに動くとき、その下を泳いでいる。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'mecha_01', head: 'dome_01', tail: 'fan_02', eyes: 'glow_01', deco: 'horn_01' },
    palette: P.lantern, pattern: 'dots', effect: 'sparkle',
    stats: { power: 88, speed: 36, weight: 18.0 },
  },
  {
    name: 'ヒトダマキンギョ',
    flavor: '墓地の花立ての水に現れる金魚。すくえた人はまだいない。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'tall_01', head: 'fish_01', tail: 'ribbon_01', eyes: 'glow_01', deco: null },
    palette: P.ramune, pattern: 'none', effect: 'bioluminescence',
    stats: { power: 74, speed: 80, weight: 0.9 },
  },
  {
    name: 'ワタアメノヌシ',
    flavor: '電線に引っかかった綿あめが十年かけてこうなった。雨の夜だけ降りてくる。',
    rarity: 4, habitat: ['impossible'],
    parts: { body: 'blob_01', head: 'dome_01', tail: 'fin_01', eyes: 'cyclops_01', deco: 'horn_01' },
    palette: P.wataame, pattern: 'none', effect: 'sparkle',
    stats: { power: 82, speed: 28, weight: 0.3 },
  },

  // ---- ★5 ----
  {
    name: 'オオトリハナビ',
    flavor: '大トリの尺玉が夜空で開いたまま帰ってこない年がある。あれはこいつになって、どこかの水面に落ちている。',
    rarity: 5, habitat: ['impossible'],
    parts: { body: 'round_01', head: 'beak_01', tail: 'spike_03', eyes: 'glow_01', deco: 'spikes_top' },
    palette: P.hanabi, pattern: 'dots', effect: 'sparkle',
    stats: { power: 97, speed: 75, weight: 8.8 },
  },
  {
    name: 'アトノマツリ',
    flavor: '祭りの翌朝、片付けの終わった境内にだけ現れる。釣り上げると、遠くでお囃子が一瞬だけ聞こえる。',
    rarity: 5, habitat: ['impossible'],
    parts: { body: 'jelly_01', head: 'dome_01', tail: 'ribbon_01', eyes: 'sleepy_01', deco: 'crown_01' },
    palette: P.kingin, pattern: 'rings', effect: 'bioluminescence',
    stats: { power: 92, speed: 90, weight: 3.3 },
  },
];
