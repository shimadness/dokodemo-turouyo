// 竿の描画と物理（しなり）
// 竿を「全長 L の弾性体」として扱い、接線角を弧長に沿って積分して形を出す。
// 単純にベジェの制御点を動かす方式は、制御点が弦と同一線上に来て曲がらないので不採用。
// 積分方式なら (1)全長が絶対に伸びない (2)先調子(穂先ほど曲がる)が pow 一発で出る。
const $ = (id) => document.getElementById(id);

// viewBox 380x330。満月時に穂先が左下へ大きく回り込むので左と下に余白を取る
const BUTT = { x: 330, y: 292 };  // グリップ（固定）
const TIP0 = { x: 78, y: 40 };    // 無負荷の穂先
const L = Math.hypot(TIP0.x - BUTT.x, TIP0.y - BUTT.y); // 竿の全長（不変）
const A0 = Math.atan2(TIP0.y - BUTT.y, TIP0.x - BUTT.x); // グリップから出る角度（不変）
const BEND_MAX = 1.15;   // 満月時に穂先が向きを変える角度(rad) ≈ 66度
const TAPER = 1.7;       // 大きいほど先調子（穂先に曲がりが集中する）
const N = 22;            // 分割数

const spring = { bend: 0, vel: 0, target: 0, twitch: 0 };
let pts = [];

// 接線角を弧長で積分して竿の形を作る。角度は穂先へ向かうほど大きく変化する（先調子）
function shape(bend) {
  const theta = -bend * BEND_MAX; // 負 = 穂先が水面(左下)へ引き込まれる向き
  const ds = L / N;
  const out = [{ x: BUTT.x, y: BUTT.y }];
  let x = BUTT.x, y = BUTT.y;
  for (let i = 1; i <= N; i++) {
    const t = (i - 0.5) / N;
    const a = A0 + theta * Math.pow(t, TAPER);
    x += Math.cos(a) * ds;
    y += Math.sin(a) * ds;
    out.push({ x, y });
  }
  return out;
}

const pathOf = (p) => p.map((q, i) => `${i ? 'L' : 'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');

// 竿の輪郭。根元は太く穂先は細い（テーパー）= 実物の竿らしさと奥行きの正体。
// 一定太さのストロークだと「棒」に見えてしまう。
const BUTT_W = 11, TIP_W = 1.6;
function taperedPath(p) {
  const n = p.length, left = [], right = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const w = (BUTT_W + (TIP_W - BUTT_W) * Math.pow(t, 0.62)) / 2;
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * w, ny = (dx / len) * w;
    left.push(`${(p[i].x + nx).toFixed(1)} ${(p[i].y + ny).toFixed(1)}`);
    right.push(`${(p[i].x - nx).toFixed(1)} ${(p[i].y - ny).toFixed(1)}`);
  }
  return `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`;
}

export const rod = {
  // bend: 0=無負荷 1=満月。twitch は誘い/キャストの瞬間の弾き
  setLoad(bend) { spring.target = Math.max(0, Math.min(1, bend)); },
  twitch(power = 1) { spring.twitch = Math.max(spring.twitch, power); },

  update(dt) {
    // バネ・ダンパ（穂先が「戻る」感じ）
    const k = 30, c = 8;
    const target = spring.target + spring.twitch * 0.45;
    spring.vel += (target - spring.bend) * k * dt - spring.vel * c * dt;
    spring.bend = Math.max(0, spring.bend + spring.vel * dt);
    spring.twitch *= Math.max(0, 1 - dt * 9); // 弾きは速く減衰

    pts = shape(spring.bend);
    const outline = taperedPath(pts);
    const center = pathOf(pts);
    $('rod-blank').setAttribute('d', outline);   // テーパー付きの本体（塗り）
    $('rod-shadow').setAttribute('d', outline);  // transformでずらした影
    $('rod-hilite').setAttribute('d', center);   // 芯のハイライト（穂先ほど細く見える）

    // ガイド（穂先ほど小さい）
    const idx = [6, 10, 13, 16, 19, 22];
    $('rod-guides').innerHTML = idx.map((i) => {
      const p = pts[Math.min(i, pts.length - 1)];
      const r = 5.4 - 3.7 * (i / N);
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}"
        fill="none" stroke="#d8d2c8" stroke-width="1.5" opacity="0.85"/>`;
    }).join('');
  },

  // 画面座標での穂先位置（道糸の始点）
  screenTip() {
    const el = $('rod');
    const r = el.getBoundingClientRect();
    const tip = pts.length ? pts[pts.length - 1] : TIP0;
    return {
      x: r.left + (tip.x / 380) * r.width,
      y: r.top + (tip.y / 330) * r.height,
    };
  },
};
