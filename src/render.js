// レンダラー: 生き物スペック JSON → SVG 文字列
import { BODIES, HEADS, TAILS, EYES, DECOS, PATTERNS } from './parts.js';

let seq = 0;

// 比較の基準: 500mlペットボトル（全高約24cm）を実寸相当で常設する。
// 生き物はこれに対して拡大縮小されるので、「コイツはデカい」が一目で分かる。
const BOTTLE = `
  <g transform="translate(30 214)" opacity="0.3">
    <path d="M -4.5 -58 L 4.5 -58 L 4.5 -52 L 3.5 -52 L 3.5 -46
             C 8.5 -42 8.5 -39 8.5 -35 L 8.5 -3 Q 8.5 0 5.5 0
             L -5.5 0 Q -8.5 0 -8.5 -3 L -8.5 -35
             C -8.5 -39 -8.5 -42 -3.5 -46 L -3.5 -52 L -4.5 -52 Z"
          fill="none" stroke="#9fb3d9" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M -8.5 -28 L 8.5 -28 M -8.5 -16 L 8.5 -16" stroke="#9fb3d9" stroke-width="1.4"/>
    <text x="0" y="12" text-anchor="middle" fill="#9fb3d9" font-size="8.5" font-family="sans-serif">24cm</text>
  </g>`;

// 重さ → 描画スケール。体積は長さの3乗なので立方根が物理的に正しい。
// 21kgで枠いっぱい、0.1kgで豆粒。上下はクランプして極端を防ぐ。
function sizeScale(weightKg) {
  const w = Math.max(0.02, Number(weightKg) || 0.1);
  return Math.min(1.2, Math.max(0.24, 0.4 * Math.cbrt(w)));
}

export function renderCreature(spec) {
  // 画像1枚もの（手描きの絵・写真など、自動生成でない生き物）。
  // パーツ合成と同じ枠・同じ重さスケール・同じペットボトル基準で描く
  if (spec.image) {
    const s = sizeScale(spec.stats.weight);
    return `
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  ${BOTTLE}
  <g transform="translate(120 122) scale(${s.toFixed(3)}) translate(-120 -122)">
    <image href="${spec.image}" x="25" y="25" width="190" height="190" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>`;
  }
  const uid = `cr${seq++}`;
  const ids = { grad: `${uid}-grad`, pat: `${uid}-pat` };
  const { primary, secondary, accent } = spec.palette;
  const c = { primary, secondary, accent, outline: mixDark(secondary), grad: `url(#${ids.grad})` };

  const body = BODIES[spec.parts.body];
  const head = HEADS[spec.parts.head];
  const tail = TAILS[spec.parts.tail];
  const eyes = EYES[spec.parts.eyes];
  const deco = spec.parts.deco ? DECOS[spec.parts.deco] : null;
  if (!body || !head || !tail || !eyes) {
    return `<svg viewBox="0 0 240 240"><text x="120" y="120" text-anchor="middle" fill="#f66">unknown parts</text></svg>`;
  }

  const [hx, hy] = body.anchors.head;
  const [tx, ty] = body.anchors.tail;
  const [px, py] = body.anchors.top;
  const [ex, ey] = head.eye;

  const patternDef = PATTERNS[spec.pattern] ? PATTERNS[spec.pattern](ids.pat, c) : '';
  const patternOverlay = patternDef
    ? `<path d="${body.path}" fill="url(#${ids.pat})" stroke="none"/>`
    : '';

  const fx = effects(spec.effect, { body, c });
  const s = sizeScale(spec.stats.weight);
  const tilt = tiltOf(spec.name);

  return `
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${ids.grad}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    ${patternDef}
  </defs>
  ${BOTTLE}
  <g transform="translate(120 122) scale(${s.toFixed(3)}) rotate(${tilt}) translate(-120 -122)">
    ${fx.behind}
    <g transform="translate(${tx} ${ty})">${tail.svg(c, ids)}</g>
    <path d="${body.path}" fill="${c.grad}" stroke="${c.outline}" stroke-width="2.5" stroke-linejoin="round"/>
    ${patternOverlay}
    ${body.extra ? body.extra(c) : ''}
    ${deco ? `<g transform="translate(${px} ${py})">${deco.svg(c, ids)}</g>` : ''}
    <g transform="translate(${hx} ${hy})">${head.svg(c, ids)}</g>
    <g transform="translate(${hx + ex} ${hy + ey})">${eyes.svg(c, ids)}</g>
    ${fx.front}
  </g>
</svg>`;
}

function effects(name, { body, c }) {
  if (name === 'bioluminescence') {
    // フィルタ不使用の疑似グロー（二重ストローク＋ハロー円）— 描画負荷対策
    const dot = (x, y, r, dur, from) => `
      <g fill="${c.accent}">
        <circle cx="${x}" cy="${y}" r="${r * 2.4}" opacity="0.18"/>
        <circle cx="${x}" cy="${y}" r="${r}">
          <animate attributeName="opacity" values="${from};0.2;${from}" dur="${dur}s" repeatCount="indefinite"/>
        </circle>
      </g>`;
    return {
      behind: `
        <path d="${body.path}" fill="none" stroke="${c.accent}" stroke-width="14" opacity="0.14"/>
        <path d="${body.path}" fill="none" stroke="${c.accent}" stroke-width="7" opacity="0.3"/>`,
      front: dot(100, 112, 3, 2.4, 1) + dot(128, 132, 2.4, 3.1, 0.9) + dot(148, 110, 2.8, 2.8, 0.8),
    };
  }
  if (name === 'bubbles') {
    const bub = (x, y0, r, dur, delay) => `
      <circle cx="${x}" cy="${y0}" r="${r}" fill="none" stroke="#bfe8ff" stroke-width="1.6" opacity="0.8">
        <animate attributeName="cy" values="${y0};${y0 - 46}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`;
    return { behind: '', front: bub(74, 84, 4, 3.2, 0) + bub(88, 76, 2.6, 2.6, 1.1) + bub(66, 92, 3, 3.8, 0.5) };
  }
  if (name === 'sparkle') {
    const star = (x, y, s, dur, delay) => `
      <path transform="translate(${x} ${y}) scale(${s})" d="M 0 -6 L 1.4 -1.4 L 6 0 L 1.4 1.4 L 0 6 L -1.4 1.4 L -6 0 L -1.4 -1.4 Z" fill="#fff6c9">
        <animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </path>`;
    return { behind: '', front: star(78, 88, 1, 2.2, 0) + star(160, 90, 0.8, 2.8, 0.9) + star(120, 168, 0.9, 2.5, 1.6) };
  }
  return { behind: '', front: '' };
}

// 名前から決まる固有の傾き(-6°〜+6°)。同じ生き物は常に同じ角度＝個体の「くせ」
function tiltOf(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 997;
  return (h % 13) - 6;
}

// 輪郭色: secondary をさらに暗くして統一感を出す
function mixDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(((n >> v) & 255) * 0.45));
  return `#${((f(16) << 16) | (f(8) << 8) | f(0)).toString(16).padStart(6, '0')}`;
}
