// パーツライブラリ
// 座標系: 240x240 / 生き物は左向き
// body がアンカー（head/tail/top の接続点）を持ち、他パーツはアンカー原点のローカル座標で描く
// c = { primary, secondary, accent, grad, outline } … grad は fill 用の url(#...)

export const BODIES = {
  // ふとっちょ魚型
  round_01: {
    path: 'M 65 120 C 65 88 96 74 122 74 C 154 74 176 92 176 120 C 176 148 154 166 122 166 C 96 166 65 152 65 120 Z',
    anchors: { head: [72, 118], tail: [172, 120], top: [118, 79] },
  },
  // うねうねヘビ型
  serpent_01: {
    path: 'M 66 108 C 96 86 114 150 144 130 C 160 120 164 106 176 110 L 176 132 C 162 130 156 142 142 152 C 112 172 92 110 66 132 Z',
    anchors: { head: [70, 120], tail: [172, 121], top: [100, 97] },
  },
  // カクカクメカ型
  mecha_01: {
    path: 'M 72 94 L 158 90 L 176 106 L 176 138 L 158 152 L 72 148 L 62 132 L 62 110 Z',
    anchors: { head: [66, 120], tail: [172, 122], top: [116, 92] },
    extra: (c) => `<path d="M 84 100 L 84 142 M 148 96 L 148 146" stroke="${c.secondary}" stroke-width="2.5" fill="none" opacity="0.7"/>`,
  },
  // ぶよぶよ不定形
  blob_01: {
    path: 'M 70 118 C 60 96 88 72 116 80 C 128 68 154 76 160 94 C 180 100 184 128 168 140 C 172 158 146 170 128 158 C 108 172 84 160 82 142 C 66 140 62 132 70 118 Z',
    anchors: { head: [72, 116], tail: [168, 122], top: [114, 76] },
  },
  // ひらべったい（ヒラメ/エイ型）
  flat_01: {
    path: 'M 58 122 C 72 104 100 96 128 98 C 156 100 176 110 180 120 C 176 130 156 140 128 142 C 100 144 72 138 58 122 Z',
    anchors: { head: [64, 120], tail: [176, 120], top: [120, 98] },
    extra: (c) => `<path d="M 78 104 C 100 98 130 96 156 102 M 78 136 C 100 142 130 144 156 138" stroke="${c.secondary}" stroke-width="2" fill="none" opacity="0.7"/>`,
  },
  // 縦長ひし形（エンゼル/しずく型）
  tall_01: {
    path: 'M 78 120 C 88 92 106 70 124 62 C 140 78 152 100 154 120 C 152 140 140 162 124 178 C 106 170 88 148 78 120 Z',
    anchors: { head: [82, 118], tail: [150, 120], top: [116, 68] },
  },
  // クラゲ（傘＋触手つき）
  jelly_01: {
    path: 'M 70 120 C 70 88 92 70 120 70 C 148 70 170 88 170 120 C 170 127 165 131 158 131 L 82 131 C 75 131 70 127 70 120 Z',
    anchors: { head: [84, 108], tail: [164, 114], top: [118, 74] },
    extra: (c) => `
      <path d="M 92 131 C 90 145 96 153 92 167 M 112 131 C 110 149 116 157 112 173 M 132 131 C 134 147 128 155 132 171 M 150 131 C 152 143 146 153 150 165"
            stroke="${c.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.75"/>`,
  },
};

export const HEADS = {
  // とがった魚スナウト
  fish_01: {
    eye: [-6, -7],
    svg: (c) => `
      <path d="M 16 -26 C -10 -22 -26 -8 -30 0 C -26 8 -10 22 16 26 C 8 10 8 -10 16 -26 Z" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M -26 5 Q -16 9 -8 9" stroke="${c.outline}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  // チューブ状の吸い口
  tube_03: {
    eye: [-2, -9],
    svg: (c) => `
      <path d="M 10 -18 C 0 -18 -8 -13 -22 -10 L -34 -8 C -41 -7 -41 5 -34 4 L -22 3 C -8 8 0 12 10 14 Z" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="-37" cy="-2" r="5" fill="${c.accent}" stroke="${c.outline}" stroke-width="2"/>`,
  },
  // キバつき大あご
  fang_02: {
    eye: [-4, -12],
    svg: (c) => `
      <path d="M 14 -24 C -12 -22 -28 -10 -32 -3 L -26 -1 L -21 4 L -15 -1 L -9 4 L -3 -1 L 4 2 L 14 3 Z" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 12 22 C -6 20 -20 13 -26 8 L -18 7 L -13 11 L -7 7 L 0 11 L 12 8 Z" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M -26 -1 L -21 4 L -15 -1 L -9 4 L -3 -1" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.9"/>`,
  },
  // まるいドーム頭
  dome_01: {
    eye: [-10, -6],
    svg: (c) => `
      <path d="M 14 -26 C -16 -26 -32 -12 -32 0 C -32 12 -16 26 14 26 Z" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M -24 -10 C -28 -6 -28 4 -24 9" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.45" stroke-linecap="round"/>`,
  },
  // シュモクザメ（T字頭）
  hammer_01: {
    eye: [-21, -22],
    svg: (c) => `
      <path d="M 12 -18 C 0 -16 -8 -10 -12 -5 L -16 -5 L -16 -24 C -16 -31 -27 -31 -27 -24 L -27 24 C -27 31 -16 31 -16 24 L -16 5 L -12 5 C -8 10 0 16 12 18 Z"
            fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="-21.5" cy="22" r="3" fill="${c.outline}"/>`,
  },
  // 剣のような長いくちばし（カジキ型）
  beak_01: {
    eye: [-2, -7],
    svg: (c) => `
      <path d="M 10 -16 C -2 -14 -10 -8 -14 -4 L -46 -2 C -50 -1.5 -50 1.5 -46 2 L -14 4 C -10 8 -2 14 10 16 Z"
            fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>`,
  },
};

export const TAILS = {
  // 定番の三日月尾びれ
  fin_01: {
    svg: (c) => `<path d="M -6 0 L 28 -28 C 20 -10 20 10 28 28 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // 扇形3枚びれ
  fan_02: {
    svg: (c) => `<path d="M -4 0 L 30 -30 L 21 -9 L 36 -2 L 21 6 L 30 28 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // トゲトゲ尾
  spike_03: {
    svg: (c) => `<path d="M -4 -2 L 28 -24 L 15 -8 L 36 -4 L 17 3 L 30 20 L -2 7 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // 先細り（ウナギ型）
  eel_01: {
    svg: (c) => `<path d="M -4 -7 C 14 -9 28 -5 40 0 C 28 5 14 9 -4 7 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // 二本の長いリボン
  ribbon_01: {
    svg: (c) => `
      <path d="M -4 -4 C 10 -14 22 -10 38 -24 C 28 -8 16 -3 4 -1 Z M -4 4 C 10 14 22 10 38 24 C 28 8 16 3 4 1 Z"
            fill="${c.accent}" stroke="${c.outline}" stroke-width="2.2" stroke-linejoin="round" opacity="0.95"/>`,
  },
};

export const EYES = {
  // まんまる目
  round_01: {
    svg: (c) => `
      <circle cx="0" cy="0" r="7.5" fill="#ffffff" stroke="${c.outline}" stroke-width="2"/>
      <circle cx="-1.5" cy="0.5" r="3.6" fill="${c.outline}"/>
      <circle cx="-2.8" cy="-1.8" r="1.4" fill="#ffffff"/>`,
  },
  // 発光する目（フィルタ不使用の疑似グロー — 描画負荷対策）
  glow_01: {
    svg: (c) => `
      <circle cx="0" cy="0" r="12" fill="${c.accent}" opacity="0.18"/>
      <circle cx="0" cy="0" r="9" fill="${c.accent}" opacity="0.35"/>
      <circle cx="0" cy="0" r="6.5" fill="${c.accent}"/>
      <circle cx="-1" cy="-1" r="2.2" fill="#ffffff"/>`,
  },
  // 一つ目（巨大）
  cyclops_01: {
    svg: (c) => `
      <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="${c.outline}" stroke-width="2.2"/>
      <circle cx="-2" cy="1" r="6" fill="${c.outline}"/>
      <circle cx="-4.5" cy="-2" r="2.2" fill="#ffffff"/>`,
  },
  // ねむり目（にっこり閉じ）
  sleepy_01: {
    svg: (c) => `
      <path d="M -8 0 Q -3 5 2 0" stroke="${c.outline}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M -9 -4 L -11 -6 M -3 -5 L -3 -8 M 3 -4 L 5 -6" stroke="${c.outline}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`,
  },
  // 三つ目
  tri_02: {
    svg: (c) => `
      <g>
        <circle cx="-6" cy="2" r="4.5" fill="#ffffff" stroke="${c.outline}" stroke-width="1.8"/>
        <circle cx="-6" cy="2" r="2" fill="${c.outline}"/>
        <circle cx="5" cy="2" r="4.5" fill="#ffffff" stroke="${c.outline}" stroke-width="1.8"/>
        <circle cx="5" cy="2" r="2" fill="${c.outline}"/>
        <circle cx="-0.5" cy="-7" r="4.5" fill="#ffffff" stroke="${c.outline}" stroke-width="1.8"/>
        <circle cx="-0.5" cy="-7" r="2" fill="${c.outline}"/>
      </g>`,
  },
};

export const DECOS = {
  // 背びれ
  fin_top: {
    svg: (c) => `<path d="M 2 6 C -4 -8 4 -26 16 -32 C 13 -18 17 -8 22 2 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // 発光アンテナ（疑似グロー）
  antenna_02: {
    svg: (c) => `
      <path d="M 4 4 C 6 -10 -4 -18 3 -32" stroke="${c.outline}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="3" cy="-35" r="10" fill="${c.accent}" opacity="0.2"/>
      <circle cx="3" cy="-35" r="7.5" fill="${c.accent}" opacity="0.35"/>
      <circle cx="3" cy="-35" r="5.5" fill="${c.accent}"/>`,
  },
  // 2本ツノ
  horn_01: {
    svg: (c) => `
      <path d="M -8 5 L -15 -20 L 0 -2 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M 10 3 L 22 -16 L 14 5 Z" fill="${c.accent}" stroke="${c.outline}" stroke-width="2.2" stroke-linejoin="round"/>`,
  },
  // ヒゲ
  whisker_01: {
    svg: (c) => `
      <path d="M -2 2 C -16 0 -26 8 -34 20 M 2 4 C -10 8 -18 18 -22 30" stroke="${c.accent}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.9"/>`,
  },
  // 背中のトゲ列
  spikes_top: {
    svg: (c) => `
      <path d="M -16 6 L -11 -9 L -6 6 M -2 6 L 4 -14 L 10 6 M 14 6 L 18 -7 L 22 6"
            fill="${c.accent}" stroke="${c.outline}" stroke-width="2" stroke-linejoin="round" opacity="0.95"/>`,
  },
  // 王冠（ヌシの証）
  crown_01: {
    svg: (c) => `
      <path d="M -11 4 L -11 -11 L -5 -4 L 0 -14 L 5 -4 L 11 -11 L 11 4 Z"
            fill="${c.accent}" stroke="${c.outline}" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="0" cy="-16" r="2.2" fill="${c.accent}"/>`,
  },
};

// 模様: <pattern> 定義を返す（id はレンダラーが採番）
export const PATTERNS = {
  none: null,
  stripe_diagonal: (id, c) => `
    <pattern id="${id}" width="14" height="14" patternTransform="rotate(35)" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="none"/>
      <rect width="6" height="14" fill="${c.secondary}" opacity="0.55"/>
    </pattern>`,
  dots: (id, c) => `
    <pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="3" fill="${c.secondary}" opacity="0.6"/>
      <circle cx="12" cy="12" r="2.2" fill="${c.secondary}" opacity="0.45"/>
    </pattern>`,
  scales: (id, c) => `
    <pattern id="${id}" width="18" height="12" patternUnits="userSpaceOnUse">
      <path d="M 0 12 A 9 9 0 0 1 18 12" fill="none" stroke="${c.secondary}" stroke-width="2" opacity="0.55"/>
      <path d="M -9 6 A 9 9 0 0 1 9 6 M 9 6 A 9 9 0 0 1 27 6" fill="none" stroke="${c.secondary}" stroke-width="2" opacity="0.55"/>
    </pattern>`,
  rings: (id, c) => `
    <pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="5.5" fill="none" stroke="${c.secondary}" stroke-width="2" opacity="0.55"/>
    </pattern>`,
  zigzag: (id, c) => `
    <pattern id="${id}" width="16" height="12" patternUnits="userSpaceOnUse">
      <path d="M 0 8 L 4 4 L 8 8 L 12 4 L 16 8" fill="none" stroke="${c.secondary}" stroke-width="2.2" opacity="0.55"/>
    </pattern>`,
};

export const HABITAT_LABELS = {
  sea: '海', river: '川', puddle: '水たまり', urban: '街なか', impossible: 'ありえない場所',
};
