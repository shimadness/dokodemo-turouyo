// チュートリアル（コーチ）
// 方針: 説明文を読ませない。1ステップ1動作で、実際にやったら次へ進む。
// ゲーム本体は coach.note(event) で「何が起きたか」を伝えるだけ。判定はここに閉じる。
const $ = (id) => document.getElementById(id);
const KEY = 'dokodemo.tutorial.done.v1';

// 各ステップ: title=太字の指示 / sub=補足 / done=このイベントで次へ
// forgive=true の間はゲーム本体が失敗（魚が散る/バラす）を握り潰す
const STEPS = [
  {
    id: 'cast',
    title: '画面をタップして投げよう',
    sub: 'スマホを振ってもキャストできる',
    done: 'cast',
  },
  {
    id: 'lure',
    title: 'タップして魚を誘え！',
    sub: '連打はダメ。1回ずつ、リズムよく',
    done: 'interest40',
    watch: 'badLure', // 連打したら教える
  },
  {
    id: 'nibble',
    title: 'ウキがピクッ！ 食いついてる',
    sub: 'まだ合わせちゃダメ。誘い続けろ',
    done: 'bite',
    hold: 1200, // 最低これだけは表示する
  },
  {
    id: 'hook',
    title: '❗が出た！ いま合わせろ！',
    subTilt: '画面を押さえたまま、スマホを立てる！',
    subTap: '画面をタップ！',
    done: 'hook',
  },
  {
    id: 'reel',
    title: '掛かった！ 押さえてリールを巻け',
    sub: '押している間だけ巻ける',
    done: 'run',
  },
  {
    id: 'run',
    title: '走ってる！ 指を離して耐えろ！',
    sub: '走られてる時に巻くと糸が切れる',
    done: 'runEnd',
  },
  {
    id: 'finish',
    title: 'あとは巻いて寄せるだけ！',
    sub: '走ったら離す、止まったら巻く',
    done: 'land',
  },
];

let idx = -1;
let active = false;
let stepAt = 0;
let tiltMode = false;

function render() {
  const el = $('coach');
  if (!active || idx < 0 || idx >= STEPS.length) { el.classList.remove('show'); return; }
  const s = STEPS[idx];
  const sub = s.subTilt ? (tiltMode ? s.subTilt : s.subTap) : s.sub;
  $('coach-step').textContent = `${idx + 1} / ${STEPS.length}`;
  $('coach-title').textContent = s.title;
  $('coach-sub').textContent = sub || '';
  el.classList.add('show');
}

function go(i) {
  idx = i;
  stepAt = performance.now();
  render();
}

function finish() {
  active = false;
  localStorage.setItem(KEY, '1');
  $('coach').classList.remove('show');
  $('coach-done').classList.add('show');
  setTimeout(() => $('coach-done').classList.remove('show'), 2600);
}

export const coach = {
  active: () => active,
  // チュートリアル中は失敗させない（子供が最初の1匹に辿り着けるように）
  forgive: () => active,
  seen: () => localStorage.getItem(KEY) === '1',

  start(useTilt) {
    tiltMode = !!useTilt;
    active = true;
    go(0);
  },
  stop() { active = false; $('coach').classList.remove('show'); },
  setTiltMode(v) { tiltMode = !!v; if (active) render(); },

  // ゲーム本体からの通知。ステップの done と一致したら次へ
  note(event) {
    if (!active || idx < 0) return;
    const s = STEPS[idx];

    // 連打したら、その場で教える（ステップは進めない）
    if (s.watch === 'badLure' && event === 'badLure') {
      $('coach-sub').textContent = '⚠ 連打すると魚が警戒する！ ゆっくり1回ずつ';
      $('coach').classList.add('warn');
      setTimeout(() => $('coach').classList.remove('warn'), 900);
      return;
    }
    if (event !== s.done) return;
    if (s.hold && performance.now() - stepAt < s.hold) return;

    if (idx + 1 >= STEPS.length) finish();
    else go(idx + 1);
  },
};
