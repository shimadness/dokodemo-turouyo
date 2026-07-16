// 釣り本体（縦切りプロトタイプ）
// 流れ: idle → casting → waiting → bite(合わせ猶予) → result / miss → idle
// 場所チップが抽選テーブルを変える。将来ここを GPS 判定に差し替える。
import { renderCreature } from '../render.js';
import { WEEK, CREATURES } from '../weeks/2026-w29-deepsea-neon.js';

const $ = (id) => document.getElementById(id);

// ---------- 場所（GPS判定の代役） ----------
const PLACES = [
  { key: 'puddle', label: '水たまり' },
  { key: 'urban', label: '街なか' },
  { key: 'impossible', label: 'ありえない場所' },
];
let place = 'puddle';

function renderPlaces() {
  $('places').innerHTML = PLACES.map(
    (p) => `<button class="pchip ${p.key === place ? 'on' : ''}" data-k="${p.key}">${p.label}</button>`,
  ).join('');
}
$('places').addEventListener('pointerdown', (e) => {
  const k = e.target.dataset?.k;
  if (k) { place = k; renderPlaces(); e.stopPropagation(); }
});

// ---------- 抽選 ----------
// レア度の基礎重み。場所が合う個体は×4（合わない個体も稀に出る=「こんな所で!?」枠）
const RARITY_W = { 1: 40, 2: 26, 3: 18, 4: 11, 5: 5 };

function draw() {
  const perRarity = {};
  CREATURES.forEach((c) => { perRarity[c.rarity] = (perRarity[c.rarity] || 0) + 1; });
  const pool = CREATURES.map((c) => ({
    c,
    w: (RARITY_W[c.rarity] / perRarity[c.rarity]) * (c.habitat.includes(place) ? 4 : 1),
  }));
  let r = Math.random() * pool.reduce((s, e) => s + e.w, 0);
  for (const e of pool) { r -= e.w; if (r <= 0) return e.c; }
  return pool[pool.length - 1].c;
}

// ---------- 図鑑 (localStorage) ----------
const ZKEY = 'dokodemo.zukan.v1';
const zukan = JSON.parse(localStorage.getItem(ZKEY) || '{}');
const zsave = () => localStorage.setItem(ZKEY, JSON.stringify(zukan));

function record(c) {
  const first = !zukan[c.name];
  zukan[c.name] = zukan[c.name] || { count: 0, week: WEEK.id, firstAt: Date.now() };
  zukan[c.name].count += 1;
  zsave();
  updateZukanCount();
  return first;
}
function updateZukanCount() {
  const caught = CREATURES.filter((c) => zukan[c.name]).length;
  $('zukan-count').textContent = `${caught}/${CREATURES.length}`;
}

// ---------- カメラ ----------
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, audio: false,
    });
    const v = $('cam');
    v.srcObject = stream;
    v.style.display = 'block';
    $('fallback-bg').style.display = 'none';
  } catch {
    $('cam-note').textContent = 'カメラなしモード（実機ではカメラ映像に竿を投げます）';
  }
}

// ---------- 釣りの状態機械 ----------
let state = 'idle';
let biteTimer = null, windowTimer = null;
let floatPos = { x: 0, y: 0 };
let currentCatch = null;

const rodTip = () => ({ x: innerWidth - 190, y: innerHeight - 235 });

function drawLine(toX, toY) {
  const t = rodTip();
  const sagY = Math.max(t.y, toY) + 40;
  $('line-svg').innerHTML =
    `<path d="M ${t.x} ${t.y} Q ${(t.x + toX) / 2} ${sagY} ${toX} ${toY}"
       stroke="rgba(230,240,255,.55)" stroke-width="1.5" fill="none"/>`;
}
const clearLine = () => { $('line-svg').innerHTML = ''; };

function ripple(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  el.style.left = `${x}px`; el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 1300);
}

function setHint(msg) { $('hint').textContent = msg; }

function cast(x, y) {
  state = 'casting';
  document.body.classList.add('casting');
  floatPos = { x, y };
  const f = $('float');
  const t = rodTip();
  f.classList.remove('landed', 'dunk');
  f.style.transition = 'none';
  f.style.left = `${t.x}px`; f.style.top = `${t.y}px`;
  f.style.opacity = '1';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    f.style.transition = '';
    f.style.left = `${x}px`; f.style.top = `${y}px`;
  }));
  setTimeout(() => {
    document.body.classList.remove('casting');
    ripple(x, y);
    drawLine(x, y);
    f.classList.add('landed');
    state = 'waiting';
    setHint('……');
    // アタリまで 1.5〜4.5 秒
    biteTimer = setTimeout(bite, 1500 + Math.random() * 3000);
  }, 580);
}

function bite() {
  state = 'bite';
  document.body.classList.add('bite');
  const f = $('float');
  f.classList.remove('landed');
  f.classList.add('dunk');
  const b = $('bite-mark');
  b.style.left = `${floatPos.x}px`; b.style.top = `${floatPos.y}px`;
  b.style.display = 'block';
  navigator.vibrate?.(120);
  setHint('今だ！タップ！');
  // 合わせ猶予 1.1 秒
  windowTimer = setTimeout(() => miss('逃げられた…'), 1100);
}

function miss(msg) {
  clearTimeout(biteTimer); clearTimeout(windowTimer);
  document.body.classList.remove('bite', 'casting');
  $('bite-mark').style.display = 'none';
  $('float').style.opacity = '0';
  $('float').classList.remove('landed', 'dunk');
  clearLine();
  if (msg) toast(msg);
  state = 'idle';
  setHint('画面をタップしてキャスト');
}

function hook() {
  clearTimeout(windowTimer);
  document.body.classList.remove('bite');
  $('bite-mark').style.display = 'none';
  state = 'reeling';
  setHint('！！！');
  navigator.vibrate?.([60, 40, 60]);
  setTimeout(() => {
    currentCatch = draw();
    const isNew = record(currentCatch);
    showResult(currentCatch, isNew);
  }, 700);
}

// ---------- 結果 ----------
function cardHTML(c, isNew) {
  const stars = '★'.repeat(c.rarity) + '☆'.repeat(5 - c.rarity);
  return `
    <div class="card r${c.rarity}">
      <div class="stage">${renderCreature(c)}</div>
      ${isNew ? '<div class="new-badge">NEW!</div>' : ''}
      <div class="stars">${stars}</div>
      <h2>${c.name}</h2>
      <p class="flavor">${c.flavor}</p>
      <div class="statline">ちから ${c.stats.power}　はやさ ${c.stats.speed}　${c.stats.weight}kg</div>
    </div>`;
}

function showResult(c, isNew) {
  $('result-card').innerHTML = cardHTML(c, isNew);
  $('result-modal').classList.add('show');
  state = 'result';
}
$('again-btn').addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  $('result-modal').classList.remove('show');
  miss(null);
});

// ---------- 図鑑モーダル ----------
const SILHOUETTE = { primary: '#1c2338', secondary: '#12172a', accent: '#252e4e' };

function zcell(c) {
  const caught = zukan[c.name];
  if (!caught) {
    const dark = { ...c, palette: SILHOUETTE, effect: 'none', pattern: 'none' };
    return `<div class="zcell unknown r${c.rarity}">${renderCreature(dark)}
      <div class="zname">？？？</div><div class="zcount">未発見</div></div>`;
  }
  return `<div class="zcell r${c.rarity}">${renderCreature(c)}
    <div class="zname">${c.name}</div><div class="zcount">×${caught.count}</div></div>`;
}

function openZukan() {
  $('zukan-week').textContent = `${WEEK.id}「${WEEK.theme}」`;
  const caught = CREATURES.filter((c) => zukan[c.name]).length;
  $('zukan-sub').textContent = `${caught} / ${CREATURES.length} 発見　${WEEK.note}`;
  $('zukan-grid').innerHTML = [...CREATURES].sort((a, b) => a.rarity - b.rarity).map(zcell).join('');
  $('zukan-modal').classList.add('show');
}
$('zukan-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); openZukan(); });
$('zukan-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); $('zukan-modal').classList.remove('show'); });

// ---------- 入力 ----------
document.body.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.modal, #topbar')) return;
  if (state === 'idle') {
    // 上部UIぎりぎりと画面最下部は避ける
    const y = Math.min(Math.max(e.clientY, innerHeight * 0.28), innerHeight * 0.9);
    cast(e.clientX, y);
  } else if (state === 'waiting') {
    miss('回収した');
  } else if (state === 'bite') {
    hook();
  }
});

// ---------- 起動 ----------
renderPlaces();
updateZukanCount();
initCamera();
