// 釣り本体
// 流れ: idle → casting → waiting → (前アタリ×0〜3) → bite(合わせ猶予)
//        → fight(長押しで巻く vs 魚の走り) → 釣果 / 逃走(シルエット提示)
// 場所チップが抽選テーブルを変える。将来ここを GPS 判定に差し替える。
import { renderCreature } from '../render.js';
import { WEEK, CREATURES } from '../weeks/2026-w29-deepsea-neon.js';

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));

// ================= 調整卓 =================
// 手触りのフィードバックはまずここを触る
const TUNE = {
  castMs: 580,          // キャスト飛行時間
  biteDelay: [1400, 4200], // 着水→本アタリまで
  nibbleCount: [0, 3],  // 前アタリ回数（この範囲でランダム）
  nibbleGap: [650, 1500], // 前アタリ同士の間隔
  biteWindow: 1100,     // 合わせ猶予(ms)
  // --- ファイト ---
  reelRate: 17,         // 長押し中の巻き速度(%/s)。魚のちからで減衰
  reelRateRun: 4,       // 走られ中に巻いた時の速度
  tensionHold: 10,      // 通常時、巻いてる間のテンション上昇(/s)
  tensionRun: 58,       // 走られ中に巻き続けた時の上昇(/s)
  tensionDecay: 46,     // 離した時の下降(/s)
  progressDecay: 2,     // 離した時の巻き戻され(/s)
  progressDecayRun: 8,  // 走られ中に離した時の巻き戻され(/s)
  runEvery: [1300, 3200], // 走りの間隔（ちからが低いと更に間延び）
  runFor: [650, 1400],  // 走りの持続
  swingThreshold: 13,   // ジャイロ: この加速度(m/s²)超えで振りと判定
  swingMax: 34,         // この加速度で最大飛距離
};
// ==========================================

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

// ---------- ジャイロ（振りキャスト） ----------
let motionOn = false;
let swingPeak = 0;
let swingTimer = null;

function onMotion(e) {
  if (state !== 'idle') return;
  const a = e.acceleration;
  if (!a) return;
  const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
  if (mag < TUNE.swingThreshold) return;
  // 振り始め検知 → 250ms ピークを集めてからキャスト（振り切りの強さを拾う）
  swingPeak = Math.max(swingPeak, mag);
  if (!swingTimer) {
    swingTimer = setTimeout(() => {
      const strength = Math.min(1, (swingPeak - TUNE.swingThreshold) / (TUNE.swingMax - TUNE.swingThreshold));
      swingPeak = 0; swingTimer = null;
      castBySwing(strength);
    }, 250);
  } else {
    swingPeak = Math.max(swingPeak, mag);
  }
}

function castBySwing(strength) {
  // 強く振るほど遠く（画面上方）へ。左右は少し散る
  const y = innerHeight * (0.78 - 0.48 * strength);
  const x = innerWidth * 0.5 + rand(-90, 90);
  toast(strength > 0.85 ? 'フルキャスト！' : null);
  cast(x, Math.max(y, innerHeight * 0.26));
}

function attachMotion() {
  addEventListener('devicemotion', onMotion);
  motionOn = true;
  const b = $('motion-btn');
  b.classList.remove('hidden');
  b.classList.add('on');
  b.textContent = '📳 振りキャストON';
  setHint('スマホを振ってキャスト！（タップでもOK）');
}

function initMotion() {
  if (typeof DeviceMotionEvent === 'undefined') return; // センサーなし
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS: ユーザー操作の中で許可を取る必要がある → ボタンを出す
    const b = $('motion-btn');
    b.classList.remove('hidden');
    b.addEventListener('pointerdown', async (e) => {
      e.stopPropagation();
      if (motionOn) return;
      try {
        const res = await DeviceMotionEvent.requestPermission();
        if (res === 'granted') attachMotion();
        else toast('センサーが許可されなかった');
      } catch { toast('センサーを起動できなかった'); }
    });
  } else {
    attachMotion(); // Android等: 許可不要
  }
}

// ---------- 共通UI ----------
let state = 'idle';
let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

let floatPos = { x: 0, y: 0 };
let landPos = { x: 0, y: 0 };
let currentCatch = null;

const rodTip = () => ({ x: innerWidth - 190, y: innerHeight - 235 });

function drawLine(toX, toY, taut = false) {
  const t = rodTip();
  const sagY = taut ? Math.min(t.y, toY) : Math.max(t.y, toY) + 40;
  $('line-svg').innerHTML =
    `<path d="M ${t.x} ${t.y} Q ${(t.x + toX) / 2} ${sagY} ${toX} ${toY}"
       stroke="rgba(230,240,255,${taut ? '.85' : '.55'})" stroke-width="${taut ? 2 : 1.5}" fill="none"/>`;
}
const clearLine = () => { $('line-svg').innerHTML = ''; };

function moveFloat(x, y) {
  floatPos = { x, y };
  const f = $('float');
  f.style.left = `${x}px`; f.style.top = `${y}px`;
}

function ripple(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  el.style.left = `${x}px`; el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function toast(msg) {
  if (!msg) return;
  const t = $('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 1300);
}
function setHint(msg) { $('hint').textContent = msg; }

// ---------- キャスト〜アタリ ----------
function cast(x, y) {
  state = 'casting';
  document.body.classList.add('casting');
  const f = $('float');
  const t = rodTip();
  f.classList.remove('landed', 'dunk', 'nibble');
  f.style.transition = 'none';
  f.style.left = `${t.x}px`; f.style.top = `${t.y}px`;
  f.style.opacity = '1';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    f.style.transition = '';
    f.style.left = `${x}px`; f.style.top = `${y}px`;
  }));
  later(() => {
    document.body.classList.remove('casting');
    landPos = { x, y };
    moveFloat(x, y);
    ripple(x, y);
    drawLine(x, y);
    f.classList.add('landed');
    state = 'waiting';
    setHint('……');
    scheduleBite();
  }, TUNE.castMs);
}

function scheduleBite() {
  // この一投で釣れる（かもしれない）魚を先に決める → 前アタリの派手さも魚で変わる
  currentCatch = draw();
  const nibbles = randi(TUNE.nibbleCount[0], TUNE.nibbleCount[1]);
  let delay = rand(TUNE.biteDelay[0], TUNE.biteDelay[1]);
  for (let i = 0; i < nibbles; i++) {
    later(nibble, delay);
    delay += rand(TUNE.nibbleGap[0], TUNE.nibbleGap[1]);
  }
  later(bite, delay);
}

function nibble() {
  if (state !== 'waiting') return;
  const f = $('float');
  f.classList.remove('nibble');
  void f.offsetWidth; // アニメ再始動
  f.classList.add('nibble');
  ripple(floatPos.x, floatPos.y);
  navigator.vibrate?.(40);
}

function bite() {
  if (state !== 'waiting') return;
  state = 'bite';
  document.body.classList.add('bite');
  const f = $('float');
  f.classList.remove('landed', 'nibble');
  f.classList.add('dunk');
  const b = $('bite-mark');
  b.style.left = `${floatPos.x}px`; b.style.top = `${floatPos.y}px`;
  b.style.display = 'block';
  navigator.vibrate?.(200);
  setHint('今だ！タップ！');
  later(() => miss('逃げられた…'), TUNE.biteWindow);
}

function miss(msg) {
  clearTimers();
  stopFight();
  document.body.classList.remove('bite', 'casting');
  $('bite-mark').style.display = 'none';
  $('float').style.opacity = '0';
  $('float').classList.remove('landed', 'dunk', 'nibble');
  clearLine();
  toast(msg);
  currentCatch = null;
  state = 'idle';
  setHint(motionOn ? 'スマホを振ってキャスト！（タップでもOK）' : '画面をタップしてキャスト');
}

// ---------- ファイト ----------
const fight = { progress: 0, tension: 0, holding: false, running: false, raf: 0, last: 0 };

function startFight() {
  clearTimers();
  document.body.classList.remove('bite');
  $('bite-mark').style.display = 'none';
  $('float').classList.remove('dunk');
  state = 'fight';
  document.body.classList.add('fighting');
  navigator.vibrate?.([60, 40, 60]);
  fight.progress = 12; // 合わせた瞬間の初速（気持ちよさ）
  fight.tension = 20;
  fight.holding = false;
  fight.running = false;
  fight.last = performance.now();
  $('fight-hint').textContent = '長押しで巻け！';
  scheduleRun();
  fight.raf = requestAnimationFrame(fightLoop);
  // rAFが止まる環境（非表示タブ・省電力WebView）でもファイトが進む保険
  fight.iv = setInterval(() => {
    if (state === 'fight' && performance.now() - fight.last > 200) fightStep(performance.now());
  }, 150);
}

function scheduleRun() {
  if (state !== 'fight') return;
  // ちからが低い魚ほど走りの間隔が延びる（★1はほぼ棒立ち）
  const laziness = 1 + Math.max(0, (60 - currentCatch.stats.power)) / 55;
  later(() => {
    if (state !== 'fight') return;
    fight.running = true;
    document.body.classList.add('run', 'bite'); // bite流用で竿を震わせる
    $('fight-hint').textContent = '走ってる！ 離せ！';
    navigator.vibrate?.([80, 50, 80]);
    later(() => {
      fight.running = false;
      document.body.classList.remove('run', 'bite');
      $('fight-hint').textContent = '長押しで巻け！';
      scheduleRun();
    }, rand(TUNE.runFor[0], TUNE.runFor[1]));
  }, rand(TUNE.runEvery[0], TUNE.runEvery[1]) * laziness);
}

// 物理1ステップ。'snap' | 'land' | null を返す
function fightStep(now) {
  if (state !== 'fight') return null;
  const dt = Math.min(0.05, (now - fight.last) / 1000);
  if (dt <= 0) return null;
  fight.last = now;
  const power = currentCatch.stats.power;
  const reel = TUNE.reelRate * (1 - power / 170); // ちから99 → 巻き速度約4割

  if (fight.holding) {
    fight.progress += (fight.running ? TUNE.reelRateRun : reel) * dt;
    fight.tension += (fight.running ? TUNE.tensionRun : TUNE.tensionHold) * dt;
  } else {
    fight.progress -= (fight.running ? TUNE.progressDecayRun : TUNE.progressDecay) * dt;
    fight.tension -= TUNE.tensionDecay * dt;
  }
  fight.progress = Math.max(0, fight.progress);
  fight.tension = Math.max(0, fight.tension);

  // ウキ: 巻き上げに応じて竿元へ寄る。走られ中は暴れる
  const t = rodTip();
  const k = Math.min(1, fight.progress / 100);
  const jx = fight.running ? rand(-9, 9) : rand(-2, 2);
  const jy = fight.running ? rand(-7, 7) : rand(-1.5, 1.5);
  moveFloat(landPos.x + (t.x - landPos.x) * k * 0.8 + jx, landPos.y + (t.y - landPos.y) * k * 0.5 + jy);
  drawLine(floatPos.x, floatPos.y, true);
  if (fight.running && Math.random() < 0.15) ripple(floatPos.x, floatPos.y);

  $('reel-fill').style.width = `${Math.min(100, fight.progress)}%`;
  $('tension-fill').style.width = `${Math.min(100, fight.tension)}%`;

  if (fight.tension >= 100) { snap(); return 'snap'; }
  if (fight.progress >= 100) { land(); return 'land'; }
  return null;
}

function fightLoop(now) {
  if (fightStep(now)) return;
  if (state === 'fight') fight.raf = requestAnimationFrame(fightLoop);
}

function stopFight() {
  cancelAnimationFrame(fight.raf);
  clearInterval(fight.iv);
  document.body.classList.remove('fighting', 'run');
}

function snap() {
  const escaped = currentCatch;
  stopFight();
  navigator.vibrate?.(300);
  showEscape(escaped);
  // 状態リセット（モーダルの裏で）
  clearTimers();
  document.body.classList.remove('bite');
  $('float').style.opacity = '0';
  clearLine();
  state = 'result';
}

function land() {
  stopFight();
  ripple(floatPos.x, floatPos.y);
  navigator.vibrate?.([60, 40, 120]);
  const isNew = record(currentCatch);
  showResult(currentCatch, isNew);
}

// ---------- 結果 / 逃走 ----------
const SILHOUETTE = { primary: '#1c2338', secondary: '#12172a', accent: '#252e4e' };

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

function showEscape(c) {
  const dark = { ...c, palette: SILHOUETTE, effect: 'none', pattern: 'none' };
  const stars = '★'.repeat(c.rarity) + '☆'.repeat(5 - c.rarity);
  $('result-card').innerHTML = `
    <div class="card">
      <div class="stage">${renderCreature(dark)}</div>
      <div class="stars">${stars}</div>
      <h2>糸が切れた…！</h2>
      <p class="flavor">${c.stats.weight}kg くらいの影が、ゆっくり消えていった。</p>
      <div class="statline">テンションが上がりきる前に、指を離してかわそう</div>
    </div>`;
  $('result-modal').classList.add('show');
}

$('again-btn').addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  $('result-modal').classList.remove('show');
  miss(null);
});

// ---------- 図鑑モーダル ----------
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
    const y = Math.min(Math.max(e.clientY, innerHeight * 0.26), innerHeight * 0.9);
    cast(e.clientX, y);
  } else if (state === 'waiting') {
    // 前アタリ中に焦って合わせると逃げられる（我慢が技術）
    if ($('float').classList.contains('nibble')) miss('早アワセ！まだ食い込んでない…');
    else miss('回収した');
  } else if (state === 'bite') {
    startFight();
  } else if (state === 'fight') {
    fight.holding = true;
  }
});
const release = () => { fight.holding = false; };
document.body.addEventListener('pointerup', release);
document.body.addEventListener('pointercancel', release);

// ---------- 起動 ----------
renderPlaces();
updateZukanCount();
initCamera();
initMotion();

// ?debug=1 でテスト用フック（非表示タブでは rAF が発火しないため、状態機械を直接進められるように）
if (new URLSearchParams(location.search).has('debug')) {
  window.__game = {
    st: () => state,
    fight,
    fightStep,
    catchName: () => currentCatch?.name ?? null,
  };
}
