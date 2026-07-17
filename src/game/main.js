// 釣り本体
// 流れ: idle → casting → waiting(誘い) → bite(合わせ猶予)
//        → fight(巻き/いなし/ポンピング) → 釣果 / 逃走(シルエット提示)
// 場所チップが抽選テーブルを変える。将来ここを GPS 判定に差し替える。
//
// 実釣の理屈に寄せてある（DAIWA/ヤマハ等の解説を調査して反映）:
//   ・魚が走ってドラグが出ている間はリールを巻かない（糸ヨレ・高切れの元）。耐える
//   ・魚が右に走ればロッドを左に倒す = ロッドの弾力で「いなす」
//   ・ラインは常に張る。緩むとハリがグラグラになって外れる（バラシの主因）
//   ・ポンピング = 竿を立てて寄せ、倒しながら緩んだ分を巻き取る。倒す時に巻かないと糸が緩む
//   ・魚が跳ねそうな時は竿先を下げる（跳ねられるとハリが外れやすい）
//
// 待機の操作系（受動的な「待つだけ」を廃し、誘いのゲームにした）:
//   短くタップ       = チョンと誘う（興味↑ 警戒↑）。連打は警戒だけ増える
//   スマホを立てる   = 竿を煽る（興味↑↑ 警戒↑↑）
//   何もしない       = 警戒が下がる。興味もゆっくり増える
//   → 興味が満ちるとアタリ / 警戒が振り切れると魚が散る
//   → アタリが出たら「タップしながらスマホを立てる」= 本アワセでファイト開始
//
// ファイトの操作系（センサー無しでも成立、センサーで上手くなる）:
//   長押し             = リールを巻く
//   走られ中に逆へ傾け  = いなし。無センサー時は走りと逆側の画面を押さえる
//   スマホを立てる      = 竿を立てて魚を浮かせる（寄る。ただし糸を巻かないと緩む）
//   スマホを倒しながら巻く = ポンピングの巻き取り局面（緩みを回収）
import { renderCreature } from '../render.js';
import { WEEK, CREATURES } from '../weeks/2026-w29-deepsea-neon.js';
import { sfx } from './sfx.js';
import { rod } from './rod.js';
import { coach } from './coach.js';

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);

// ================= 調整卓 =================
// 手触りのフィードバックはまずここを触る
const TUNE = {
  castMs: 580,            // キャスト飛行時間
  biteWindow: 1100,       // 合わせ猶予(ms)
  // --- 誘い（待機中のゲーム性） ---
  interestNeed: 100,      // これに達するとアタリ
  interestIdle: 0,        // 放置では増えない（誘わないと釣れない）
  interestDecay: 7,       // 誘いをやめると興味は冷める(/s) ← ゲージが減る
  interestTwitch: 15,     // 短タップ1回の誘い
  interestJerk: 30,       // 竿を煽る(スマホを立てる)1回の誘い
  interestPenalty: 22,    // 悪手(連打で警戒させた)時に興味が失われる量 ← 悪手で減る
  waryPerTwitch: 9,
  waryPerJerk: 16,
  waryDecay: 11,          // 何もしない時の警戒の下降(/s)
  waryLimit: 100,         // 振り切れると魚が散る
  twitchCooldown: 300,    // 連打防止(ms)。これ未満の連打は警戒↑＋興味↓の悪手になる
  nibbleAt: [45, 72, 90], // 興味がこの値を跨ぐと前アタリ（=もうすぐ）
  nibbleMs: 620,          // 前アタリの見た目/判定が続く時間(CSSの nib .3s×2 と一致させる)
  earlyPenalty: 30,       // 早アワセ（前アタリ中に合わせた）時に失う興味
  jerkPitch: 22,          // 煽り/合わせ判定のピッチ(度)
  // --- ファイト ---
  reelRate: 17,           // 長押し中の巻き速度(%/s)。魚のちからで減衰
  reelRateRun: 0,         // 走られ中（いなし無し）は巻いても寄らない ← いなしの価値
  reelRateCounter: 8,     // いなし成功中に巻いた時
  tensionHoldBase: 6,     // 巻き中のテンション上昇の基礎(/s)
  tensionHoldPer: 0.12,   // + ちから×これ。★1は無心で釣れ、★3から休ませ必須になる
  tensionRunBase: 20,     // 走られ中に巻き続けた時(/s)の基礎
  tensionRunPer: 0.5,     // + ちから×これ。小物の走りは可愛く、大物は凶暴
  tensionCounter: 15,     // いなし成功中に巻いた時(/s)
  tensionDecay: 46,       // 離した時の下降(/s)
  progressDecay: 2,
  progressDecayRun: 8,
  runEvery: [1300, 3200],
  runFor: [650, 1400],
  // --- センサー ---
  swingThreshold: 13,     // 振りキャスト判定(m/s²)
  swingMax: 34,           // 最大飛距離になる加速度
  counterTilt: 12,        // いなし判定の左右傾き(度)
  // 画面の竿がスマホの傾きに追従する量。スマホ自体が竿になる感覚を作る。
  // 副産物として「いなし」「竿立て」が効いているのが目で見て分かるようになる
  // 竿は画面の左上を向いているので、穂先を上げる＝時計回り(正)。
  // 右に傾ける／スマホを立てる のどちらも穂先が起きる向き＝正
  aimGainGamma: 0.75,     // 左右の傾き→竿の回転
  aimGainBeta: 0.5,       // 前後(立てる)→竿の回転
  pumpPitch: 15,          // 竿立て判定のピッチ(度)
  // ポンピング（実釣どおり）: 竿を立てて魚を浮かせ、倒しながら緩んだ分を巻き取る。
  // 立てている間はリールを巻かなくても寄る代わりに、糸がどんどん緩む。
  // 緩みは「倒しながら巻く」で回収する。緩んだまま放置するとハリが外れてバレる。
  pumpLift: 14,           // 竿を立てている間に寄る量(%/s)。巻きより速い＝立てる価値
  pumpShed: 26,           // 竿を立てている間のテンション下降(/s)
  slackPerSec: 34,        // 竿を立てている間に増える「糸ふけ」(/s)
  slackRecover: 60,       // 竿を倒して巻いている時の糸ふけ回収(/s)
  slackLimit: 100,        // 糸ふけが振り切れる=ハリが外れてバラす
  slackDecayWind: 26,     // 竿を倒して巻いていない時も少しは回収される(/s)
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

// ---------- センサー（振りキャスト + 傾き） ----------
// motionOn        = リスナーを付けた（=許可が下りた）
// orientationLive = 傾きデータが実際に届いている
// この2つを混同すると、リスナーは付くのにデータが来ない端末（Androidの一部）で
// 「傾け合わせも効かない・タップ合わせも無効」になり魚が一生掛からない。実際にそうなった。
let motionOn = false;
let orientationLive = false;
let orientationSeenAt = 0;
let swingPeak = 0;
let swingTimer = null;
const ori = { beta: null, gamma: null };   // 現在の傾き
const oriBase = { beta: 0, gamma: 0, set: false }; // 持ち方の基準（最初の姿勢／各局面の開始時）

function onMotion(e) {
  if (state !== 'idle') return;
  const a = e.acceleration;
  if (!a) return;
  const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
  if (mag < TUNE.swingThreshold && !swingTimer) return;
  swingPeak = Math.max(swingPeak, mag);
  if (!swingTimer) {
    swingTimer = setTimeout(() => {
      const strength = Math.min(1, (swingPeak - TUNE.swingThreshold) / (TUNE.swingMax - TUNE.swingThreshold));
      swingPeak = 0; swingTimer = null;
      castBySwing(strength);
    }, 250);
  }
}

function onOrientation(e) {
  if (e.beta == null && e.gamma == null) return; // 中身の無いイベントは無視
  ori.beta = e.beta;
  ori.gamma = e.gamma;
  orientationSeenAt = performance.now();
  if (!orientationLive) { orientationLive = true; updateSensorBtn(); coach.setTiltMode(true); }
  // 最初に持った姿勢を基準にする（以後の傾きはここからの差分）
  if (!oriBase.set && e.beta != null) {
    oriBase.beta = e.beta; oriBase.gamma = e.gamma ?? 0; oriBase.set = true;
  }
}

// センサーボタンは実状態を映す。端末の切り分け（データが来ているか）に使える
function updateSensorBtn() {
  const b = $('motion-btn');
  b.classList.remove('on', 'dead'); // hidden は消さない（classNameごと上書きしないこと）
  if (!motionOn) { b.textContent = '📳 センサー'; return; }
  if (orientationLive) { b.textContent = '📳 センサーON'; b.classList.add('on'); }
  else { b.textContent = '📳 センサー無効'; b.classList.add('dead'); }
}

function castBySwing(strength) {
  const y = innerHeight * (0.78 - 0.48 * strength);
  const x = innerWidth * 0.5 + rand(-90, 90);
  if (strength > 0.85) toast('フルキャスト！');
  cast(x, Math.max(y, innerHeight * 0.26));
}

function attachSensors() {
  addEventListener('devicemotion', onMotion);
  // 端末によっては deviceorientation が来ず deviceorientationabsolute だけ来る
  addEventListener('deviceorientation', onOrientation);
  addEventListener('deviceorientationabsolute', onOrientation);
  motionOn = true;
  $('motion-btn').classList.remove('hidden');
  updateSensorBtn();
  // データが実際に届くまで live にしない。2秒来なければ「無効」と表示して切り分け可能にする
  setTimeout(updateSensorBtn, 2000);
  setHint(hintForIdle());
}

function initMotion() {
  if (typeof DeviceMotionEvent === 'undefined') return; // センサーなし環境
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS: 許可リクエストは click / touchend ハンドラ内でしか呼べない
    // （pointerdown はユーザー操作と認められず例外になる）
    const b = $('motion-btn');
    b.classList.remove('hidden');
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (motionOn) return;
      try {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== 'granted') { toast('センサーが許可されなかった'); return; }
        // 傾きの許可は別APIのことがあるので念のため（同じプロンプトに束ねられる場合が多い）
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
          try { await DeviceOrientationEvent.requestPermission(); } catch { /* motion側の許可で足りる端末が多い */ }
        }
        attachSensors();
      } catch (err) {
        toast(`センサー起動失敗: ${String(err?.message || err).slice(0, 50)}`);
      }
    });
  } else {
    attachSensors(); // Android等: 許可不要
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
let lastPointerX = null; // 無センサー時のいなし判定に使う
let hookHeld = false;    // 合わせ: 画面を押さえているか

const rodTip = () => rod.screenTip(); // 竿の物理から実際の穂先位置を取る

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
  setTimeout(() => { t.style.display = 'none'; }, 1500);
}
function setHint(msg) { $('hint').textContent = msg; }
const hintForIdle = () => (orientationLive
  ? 'スマホを振ってキャスト！（タップでもOK）'
  : '画面をタップしてキャスト');
function setFightHint(msg) {
  const el = $('fight-hint');
  if (el.textContent !== msg) el.textContent = msg;
}

// ---------- キャスト〜アタリ ----------
function cast(x, y) {
  state = 'casting';
  document.body.classList.add('casting');
  rod.twitch(1.4); // 振り抜き
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
    sfx.splash();
    coach.note('cast');
    state = 'waiting';
    currentCatch = draw(); // この一投の魚を先に決める（誘いの手応えも魚で変わる）
    startLure();
  }, TUNE.castMs);
}

function nibble() {
  if (state !== 'waiting') return;
  const f = $('float');
  f.classList.remove('nibble');
  void f.offsetWidth; // アニメ再始動
  f.classList.add('nibble');
  // クラスを外し忘れると「前アタリ中」が永久に続いてしまう（実際にバグった）
  clearTimeout(lure.nibbleTimer);
  lure.nibbleTimer = setTimeout(() => f.classList.remove('nibble'), TUNE.nibbleMs);
  lure.nibbleUntil = performance.now() + TUNE.nibbleMs; // 判定はCSSでなく時間で持つ
  ripple(floatPos.x, floatPos.y);
  sfx.nibble();
  navigator.vibrate?.(40);
}

const isNibbling = () => performance.now() < (lure.nibbleUntil || 0);

// 早アワセ: 前アタリ中に合わせの動作をした = まだ食い込んでないのに引っ張った。
// 実釣でも同じで、ハリが口から抜けて魚は警戒する。ただし一発でキャストやり直しにはせず
// 「悪手はゲージが減る」に統一する
function earlyStrike() {
  lure.interest = Math.max(0, lure.interest - TUNE.earlyPenalty);
  lure.wary += TUNE.waryPerJerk;
  lure.nibbled = 0;
  lure.nibbleUntil = 0;
  $('float').classList.remove('nibble');
  rod.twitch(1.1);
  sfx.warn();
  navigator.vibrate?.(60);
  document.body.classList.add('bad');
  setTimeout(() => document.body.classList.remove('bad'), 260);
  toast('早アワセ！まだ食い込んでない…');
}

function bite() {
  if (state !== 'waiting') return;
  stopLure();
  state = 'bite';
  hookWatch();
  document.body.classList.add('bite');
  const f = $('float');
  f.classList.remove('landed', 'nibble');
  f.classList.add('dunk');
  const b = $('bite-mark');
  b.style.left = `${floatPos.x}px`; b.style.top = `${floatPos.y}px`;
  b.style.display = 'block';
  sfx.bite();
  coach.note('bite');
  navigator.vibrate?.(200);
  setHint(orientationLive ? '今だ！ 押さえてスマホを立てろ！' : '今だ！タップ！');
  // チュートリアル中は合わせを待ってあげる（猶予を長く）
  later(() => miss('逃げられた…'), coach.forgive() ? TUNE.biteWindow * 6 : TUNE.biteWindow);
}

// 合わせ（アワセ）: 押さえながらスマホを立てる = 竿を跳ね上げてハリを掛ける動作
// センサーが無い端末はタップだけで合わせられる（入力ハンドラ側）
let hookIv = 0;
function hookWatch() {
  clearInterval(hookIv);
  if (!orientationLive) return; // データが来ない端末はタップ合わせ（入力側）に任せる
  const base = ori.beta;
  hookIv = setInterval(() => {
    if (state !== 'bite') { clearInterval(hookIv); return; }
    if (!hookHeld || ori.beta == null || base == null) return;
    if (ori.beta - base >= TUNE.jerkPitch) { clearInterval(hookIv); startFight(); }
  }, 40);
}

function miss(msg) {
  clearTimers();
  stopLure();
  stopFight();
  document.body.classList.remove('bite', 'casting');
  $('bite-mark').style.display = 'none';
  $('float').style.opacity = '0';
  $('float').classList.remove('landed', 'dunk', 'nibble');
  clearLine();
  rod.setLoad(0);
  toast(msg);
  currentCatch = null;
  state = 'idle';
  setHint(hintForIdle());
}

// ---------- 誘い（待機中） ----------
const lure = { interest: 0, wary: 0, lastTwitch: 0, nibbled: 0, raf: 0, iv: 0, last: 0,
               nibbleUntil: 0, nibbleTimer: 0, wasPitched: false };

function startLure() {
  lure.interest = 0; lure.wary = 0; lure.nibbled = 0; lure.lastTwitch = 0;
  lure.nibbleUntil = 0; lure.wasPitched = false;
  clearTimeout(lure.nibbleTimer);
  $('float').classList.remove('nibble');
  oriBase.beta = ori.beta ?? 0; oriBase.gamma = ori.gamma ?? 0; // 今の持ち方を基準にする
  lure.last = performance.now();
  document.body.classList.add('luring');
  setHint(orientationLive ? 'タップで誘え！ スマホを立てると大きく誘える' : 'タップでチョンチョン誘え！');
  lure.raf = requestAnimationFrame(lureLoop);
  // rAFが止まる環境（非表示タブ・省電力WebView）でも誘いが進む保険
  lure.iv = setInterval(() => {
    if (state === 'waiting' && performance.now() - lure.last > 200) lureStep(performance.now());
  }, 150);
}

function stopLure() {
  cancelAnimationFrame(lure.raf);
  clearInterval(lure.iv);
  clearTimeout(lure.nibbleTimer);
  lure.nibbleUntil = 0;
  $('float').classList.remove('nibble');
  document.body.classList.remove('luring', 'spooked');
}

// 誘う（短タップ or 煽り）
function doLure(kind) {
  const now = performance.now();
  const tooFast = now - lure.lastTwitch < TUNE.twitchCooldown;
  lure.lastTwitch = now;
  if (tooFast) { // 連打 = 悪手。警戒が増えるうえに、警戒した魚は興味を失う
    coach.note('badLure');
    lure.wary += TUNE.waryPerTwitch;
    lure.interest = Math.max(0, lure.interest - TUNE.interestPenalty);
    lure.nibbled = 0; // 前アタリのサインもやり直し
    document.body.classList.add('bad');
    setTimeout(() => document.body.classList.remove('bad'), 260);
    sfx.warn();
    return;
  }
  if (kind === 'jerk') {
    lure.interest += TUNE.interestJerk;
    lure.wary += TUNE.waryPerJerk;
    rod.twitch(1);
    sfx.splash();
  } else {
    lure.interest += TUNE.interestTwitch;
    lure.wary += TUNE.waryPerTwitch;
    rod.twitch(0.55);
    sfx.reelTick();
  }
  ripple(floatPos.x, floatPos.y);
  document.body.classList.add('twitching');
  setTimeout(() => document.body.classList.remove('twitching'), 180);
}

// 誘いの1ステップ。'spooked' | 'bite' | null を返す
function lureStep(now) {
  if (state !== 'waiting') return null;
  const dt = Math.min(0.05, (now - lure.last) / 1000);
  if (dt <= 0) return null;
  lure.last = now;

  // スマホを立てる動作。跨いだ瞬間だけ判定（押しっぱなしで連続発火しないように）
  const pitchNow = orientationLive && ori.beta != null && (ori.beta - oriBase.beta) >= TUNE.jerkPitch;
  if (pitchNow && !lure.wasPitched) {
    // 押さえながら立てる = 合わせの動作。前アタリ中なら早アワセ、そうでなければ竿を煽る誘い
    if (hookHeld && isNibbling()) earlyStrike();
    else doLure('jerk');
  }
  lure.wasPitched = pitchNow;

  // 誘いをやめると興味は冷める（=ゲージが減る）。警戒はゆっくり下がる
  lure.interest = Math.max(0, lure.interest - TUNE.interestDecay * dt);
  lure.wary = Math.max(0, lure.wary - TUNE.waryDecay * dt);

  // 前アタリ = 興味の高まりのサイン（もう「ランダム」ではない）
  const marks = TUNE.nibbleAt;
  if (lure.nibbled < marks.length && lure.interest >= marks[lure.nibbled]) {
    lure.nibbled++;
    nibble();
  }

  if (lure.interest >= 40) coach.note('interest40');
  $('interest-fill').style.width = `${Math.min(100, lure.interest)}%`;
  $('wary-fill').style.width = `${Math.min(100, lure.wary)}%`;
  document.body.classList.toggle('spooked', lure.wary > 75);
  // 前アタリ中は「まだ合わせるな」を伝える。誘いは続けてよい
  if (isNibbling()) setHint('食ってる…！ まだ合わせるな、誘い続けろ');
  else if (lure.wary > 75) setHint('警戒されてる！ 少し待て');
  else setHint(orientationLive ? 'タップで誘え！ スマホを立てると大きく誘える' : 'タップでチョンチョン誘え！');
  rod.setLoad(0.05 + Math.min(1, lure.interest / 100) * 0.06); // 期待でわずかに張る

  // チュートリアル中は「魚が散る」を握り潰す（最初の1匹には必ず辿り着かせる）
  if (lure.wary >= TUNE.waryLimit) {
    if (coach.forgive()) { lure.wary = 55; }
    else { spooked(); return 'spooked'; }
  }
  if (lure.interest >= TUNE.interestNeed) { bite(); return 'bite'; }
  return null;
}

function lureLoop(now) {
  if (lureStep(now)) return;
  if (state === 'waiting') lure.raf = requestAnimationFrame(lureLoop);
}

function spooked() {
  stopLure();
  sfx.snap();
  miss('誘いすぎ！魚が散った…');
}

// ---------- ファイト ----------
const fight = {
  progress: 0, tension: 0, slack: 0, holding: false,
  running: false, runDir: 0, raf: 0, iv: 0, last: 0,
};

function startFight() {
  clearTimers();
  stopLure();
  document.body.classList.remove('bite');
  $('bite-mark').style.display = 'none';
  $('float').classList.remove('dunk');
  state = 'fight';
  document.body.classList.add('fighting');
  coach.note('hook');
  navigator.vibrate?.([60, 40, 60]);
  fight.progress = 12;
  fight.tension = 20;
  fight.slack = 0;
  fight.holding = false;
  fight.running = false;
  fight.runDir = 0;
  fight.last = performance.now();
  // ファイト開始時の持ち方を「ニュートラル」とする
  if (ori.beta != null) { oriBase.beta = ori.beta; oriBase.gamma = ori.gamma; }
  setFightHint('長押しで巻け！');
  scheduleRun();
  fight.raf = requestAnimationFrame(fightLoop);
  // rAFが止まる環境（非表示タブ・省電力WebView）でも進む保険
  fight.iv = setInterval(() => {
    if (state === 'fight' && performance.now() - fight.last > 200) fightStep(performance.now());
  }, 150);
}

function scheduleRun() {
  if (state !== 'fight') return;
  const laziness = 1 + Math.max(0, (60 - currentCatch.stats.power)) / 40; // 弱い魚ほど走らない(★1はほぼ棒立ち)
  later(() => {
    if (state !== 'fight') return;
    fight.running = true;
    fight.runDir = Math.random() < 0.5 ? -1 : 1;
    document.body.classList.add('run', 'bite'); // bite流用で竿を震わせる
    coach.note('run');
    navigator.vibrate?.([80, 50, 80]);
    later(() => {
      fight.running = false;
      fight.runDir = 0;
      document.body.classList.remove('run', 'bite');
      coach.note('runEnd');
      setFightHint('長押しで巻け！');
      scheduleRun();
    }, rand(TUNE.runFor[0], TUNE.runFor[1]));
  }, rand(TUNE.runEvery[0], TUNE.runEvery[1]) * laziness);
}

// いなし判定: 傾き(逆方向へcounterTilt度) or 走りと逆側の画面を押さえている
function isCountering() {
  if (fight.runDir === 0) return false;
  if (orientationLive && ori.gamma != null) {
    const dGamma = ori.gamma - oriBase.gamma;
    if (dGamma * fight.runDir <= -TUNE.counterTilt) return true;
  }
  if (fight.holding && lastPointerX != null) {
    if (fight.runDir > 0 && lastPointerX < innerWidth * 0.4) return true;
    if (fight.runDir < 0 && lastPointerX > innerWidth * 0.6) return true;
  }
  return false;
}

// 竿立て判定: スマホを起こす（ピッチ+）
function isPumping() {
  if (!orientationLive || ori.beta == null) return false;
  return (ori.beta - oriBase.beta) >= TUNE.pumpPitch;
}

// 物理1ステップ。'snap' | 'land' | null を返す
function fightStep(now) {
  if (state !== 'fight') return null;
  const dt = Math.min(0.05, (now - fight.last) / 1000);
  if (dt <= 0) return null;
  fight.last = now;
  const power = currentCatch.stats.power;
  const countered = fight.running && isCountering();
  const pumping = isPumping();
  const tensionHold = TUNE.tensionHoldBase + TUNE.tensionHoldPer * power;
  const tensionRun = TUNE.tensionRunBase + TUNE.tensionRunPer * power;
  const reel = TUNE.reelRate * (1 - power / 170);

  if (fight.holding) {
    if (fight.running) {
      // ドラグが出ている間に巻くのは実釣でも悪手（糸ヨレ・高切れ）。いなせば巻ける
      fight.progress += (countered ? TUNE.reelRateCounter : TUNE.reelRateRun) * dt;
      fight.tension += (countered ? TUNE.tensionCounter : tensionRun) * dt;
    } else {
      fight.progress += reel * dt;
      fight.tension += tensionHold * dt;
    }
  } else {
    fight.progress -= (fight.running ? TUNE.progressDecayRun : TUNE.progressDecay) * dt;
    fight.tension -= TUNE.tensionDecay * dt;
  }

  // ポンピング: 竿を立てる=魚が浮いて寄る（巻きより速い）が、糸ふけが増える
  if (pumping) {
    fight.progress += TUNE.pumpLift * dt;
    fight.tension -= TUNE.pumpShed * dt;
    fight.slack += TUNE.slackPerSec * dt;
  } else {
    // 竿を倒している局面。巻いていれば緩みを一気に回収する（= ポンピングの後半）
    fight.slack -= (fight.holding ? TUNE.slackRecover : TUNE.slackDecayWind) * dt;
  }
  fight.progress = Math.max(0, fight.progress);
  fight.tension = Math.max(0, fight.tension);
  fight.slack = Math.max(0, fight.slack);

  // ヒント（状況で切り替え）
  if (fight.slack > 55) {
    setFightHint('糸がたるんでる！竿を倒して巻け！'); // 最優先。緩むとハリが外れる
  } else if (fight.running) {
    if (countered) setFightHint('いなしてる！巻け巻け！');
    else setFightHint(fight.runDir > 0 ? '➡ 右に走ってる！左へいなせ！' : '⬅ 左に走ってる！右へいなせ！');
  } else if (pumping) {
    setFightHint('浮いてくる！ 倒して巻いて糸を回収！');
  } else if (fight.tension > 70) {
    setFightHint(orientationLive ? 'スマホを立てて竿を起こせ！' : '一旦離して休ませろ！');
  }

  // 手触りパルス（音+振動を状態ごとのリズムで刻む）。iOSは音が主役(vibrate非対応)
  if (countered && !fight.wasCountered) { sfx.counterOk(); navigator.vibrate?.([20, 30, 20]); } // いなし成立の瞬間
  fight.wasCountered = countered;
  const pulseEvery = fight.running ? (countered ? 150 : 90) : (pumping ? 200 : (fight.holding ? 95 : 0));
  if (pulseEvery && now - (fight.pulseAt || 0) > pulseEvery) {
    fight.pulseAt = now;
    if (fight.running && !countered) { sfx.dragHard(); navigator.vibrate?.(40); } // ドラグが鳴く
    else if (fight.running) sfx.dragSoft();
    else if (pumping) { sfx.shed(fight.tension); navigator.vibrate?.(12); }
    else sfx.reelTick();
  }
  // 危険域(テンション78+): 独立した警告リズム + 画面が赤く滲む
  const danger = fight.tension > 78 || fight.slack > 78;
  if (danger && now - (fight.warnAt || 0) > 350) {
    fight.warnAt = now;
    sfx.warn(); navigator.vibrate?.(50);
  }
  document.body.classList.toggle('danger', danger);
  document.body.classList.toggle('pumping', pumping);

  // ウキ: 巻き上げで竿元へ寄る。走られ中は走り方向へ暴れる
  const t = rodTip();
  const k = Math.min(1, fight.progress / 100);
  const jx = fight.running ? rand(2, 10) * fight.runDir : rand(-2, 2);
  const jy = fight.running ? rand(-7, 7) : rand(-1.5, 1.5);
  moveFloat(landPos.x + (t.x - landPos.x) * k * 0.8 + jx, landPos.y + (t.y - landPos.y) * k * 0.5 + jy);
  drawLine(floatPos.x, floatPos.y, true);
  if (fight.running && Math.random() < 0.15) ripple(floatPos.x, floatPos.y);

  $('reel-fill').style.width = `${Math.min(100, fight.progress)}%`;
  $('tension-fill').style.width = `${Math.min(100, fight.tension)}%`;
  $('slack-fill').style.width = `${Math.min(100, fight.slack)}%`;
  document.body.classList.toggle('slacking', fight.slack > 55);
  rod.setLoad(0.18 + (fight.tension / 100) * 0.82); // テンションで竿がしなる
  if (fight.running && !countered) rod.twitch(0.25); // 走られると竿が叩かれる

  if (fight.tension >= 100) {
    if (coach.forgive()) fight.tension = 70; // チュートリアル中は糸が切れない
    else { snap(); return 'snap'; }
  }
  if (fight.slack >= TUNE.slackLimit) {
    if (coach.forgive()) fight.slack = 60; // チュートリアル中はハリが外れない
    else { throwHook(); return 'slack'; }
  }
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
  document.body.classList.remove('fighting', 'run', 'danger', 'pumping', 'slacking');
}

function snap() {
  const escaped = currentCatch;
  stopFight();
  rod.setLoad(0);
  rod.twitch(1.8); // 糸が切れて竿が跳ね返る
  sfx.snap();
  navigator.vibrate?.(300);
  showEscape(escaped);
  clearTimers();
  document.body.classList.remove('bite');
  $('float').style.opacity = '0';
  clearLine();
  state = 'result';
}

// 糸を緩めすぎてハリが外れる = 実釣で最も多いバラシ。糸切れとは別の失敗
function throwHook() {
  const escaped = currentCatch;
  stopFight();
  rod.setLoad(0);
  rod.twitch(1.2);
  sfx.snap();
  navigator.vibrate?.(300);
  showEscape(escaped, 'slack');
  clearTimers();
  document.body.classList.remove('bite');
  $('float').style.opacity = '0';
  clearLine();
  state = 'result';
}

function land() {
  stopFight();
  rod.setLoad(0);
  ripple(floatPos.x, floatPos.y);
  sfx.land();
  navigator.vibrate?.([60, 40, 120]);
  coach.note('land');
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

function showEscape(c, reason = 'snap') {
  const dark = { ...c, palette: SILHOUETTE, effect: 'none', pattern: 'none' };
  const stars = '★'.repeat(c.rarity) + '☆'.repeat(5 - c.rarity);
  const R = reason === 'slack'
    ? { title: 'ハリが外れた…！', tip: '竿を立てたら、倒しながら巻いて糸を回収しよう' }
    : { title: '糸が切れた…！', tip: '走られたら逆へいなすか、指を離してかわそう' };
  $('result-card').innerHTML = `
    <div class="card">
      <div class="stage">${renderCreature(dark)}</div>
      <div class="stars">${stars}</div>
      <h2>${R.title}</h2>
      <p class="flavor">${c.stats.weight}kg くらいの影が、ゆっくり消えていった。</p>
      <div class="statline">${R.tip}</div>
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
  sfx.init(); // AudioContextはユーザー操作内でしか起動できない
  if (e.target.closest('.modal, #topbar')) return;
  lastPointerX = e.clientX;
  if (state === 'idle') {
    const y = Math.min(Math.max(e.clientY, innerHeight * 0.26), innerHeight * 0.9);
    cast(e.clientX, y);
  } else if (state === 'waiting') {
    // 合わせは「押さえながらスマホを立てる」なので、ただのタップは常に誘い。
    // 前アタリ中でも誘い続けてよい（早アワセは合わせの動作をした時だけ = lureLoop側で判定）
    hookHeld = true;
    doLure('twitch');
  } else if (state === 'bite') {
    hookHeld = true;
    // 傾きデータが来ない端末はタップだけで合わせられる（フォールバック）
    if (!orientationLive) startFight();
  } else if (state === 'fight') {
    fight.holding = true;
  }
});
document.body.addEventListener('pointermove', (e) => {
  if (state === 'fight' && fight.holding) lastPointerX = e.clientX; // 指を滑らせていなす
});
const release = () => { fight.holding = false; hookHeld = false; };
document.body.addEventListener('pointerup', release);
document.body.addEventListener('pointercancel', release);

// ---------- ミュート ----------
const muteBtn = $('mute-btn');
const muteLabel = () => { muteBtn.textContent = sfx.isMuted() ? '🔇' : '🔊'; };
muteBtn.addEventListener('click', (e) => { e.stopPropagation(); sfx.toggleMute(); muteLabel(); });
muteLabel();

// ---------- 竿の物理（常時） ----------
let rodLast = performance.now();
function rodLoop(now) {
  const dt = Math.min(0.05, (now - rodLast) / 1000);
  rodLast = now;
  // スマホの傾きに竿を追従させる（スマホ＝竿）
  if (orientationLive && ori.beta != null) {
    const dG = (ori.gamma ?? 0) - oriBase.gamma;
    const dB = ori.beta - oriBase.beta;
    // 右に傾ける→穂先が右へ / スマホを立てる→穂先が起き上がる（どちらも時計回り）
    rod.setAim(dG * TUNE.aimGainGamma + dB * TUNE.aimGainBeta);
  }
  rod.update(dt);
  // 待機/ファイト中は道糸が穂先から出る（穂先が動くので追従が要る）
  if (state === 'waiting' || state === 'bite') drawLine(floatPos.x, floatPos.y);
  requestAnimationFrame(rodLoop);
}
requestAnimationFrame(rodLoop);

// ---------- チュートリアル ----------
function startTutorial() {
  $('intro-modal').classList.remove('show');
  sfx.init();
  miss(null);              // 状態を初期化してから始める
  coach.start(orientationLive);
}
$('intro-start').addEventListener('click', (e) => { e.stopPropagation(); startTutorial(); });
$('intro-skip').addEventListener('click', (e) => {
  e.stopPropagation();
  localStorage.setItem('dokodemo.tutorial.done.v1', '1');
  $('intro-modal').classList.remove('show');
});
$('help-btn').addEventListener('click', (e) => { e.stopPropagation(); startTutorial(); });

// ---------- 起動 ----------
renderPlaces();
updateZukanCount();
initCamera();
initMotion();
if (!coach.seen()) $('intro-modal').classList.add('show');

// ?debug=1 でテスト用フック（非表示タブでは rAF/タイマーが動かないため状態機械を直接進める）
if (new URLSearchParams(location.search).has('debug')) {
  window.__game = {
    st: () => state,
    fight, ori, oriBase,
    fightStep,
    catchName: () => currentCatch?.name ?? null,
    forceMotion: () => { motionOn = true; },
    setPointerX: (x) => { lastPointerX = x; },
    lure, doLure, startLure, lureStep, rod, isNibbling, earlyStrike,
    setHookHeld: (v) => { hookHeld = v; },
    forceFight: (name) => { // タイマーを介さず直接ファイトに入る
      currentCatch = CREATURES.find((c) => c.name === name) ?? CREATURES[0];
      landPos = { x: innerWidth / 2, y: innerHeight / 2 };
      state = 'bite';
      startFight();
    },
  };
}
