// 効果音: WebAudio合成（音声アセット無し）
// iOS SafariにはバイブレーションAPIが無いため、Webでの「手触り」の主役は音。
// 本物の振動は Capacitor 化した時に Haptics で乗せる。
let ac = null;
let muted = localStorage.getItem('dokodemo.muted') === '1';
let noiseBuf = null;

function ready() { return !muted && ac && ac.state === 'running'; }

function env(vol, dur) {
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  g.connect(ac.destination);
  return g;
}

function tone(freq, dur, type = 'sine', vol = 0.12, sweepTo = null) {
  if (!ready()) return;
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, ac.currentTime + dur);
  o.connect(env(vol, dur));
  o.start();
  o.stop(ac.currentTime + dur + 0.02);
}

function noise(dur, vol = 0.2, freq = 800, q = 1.5) {
  if (!ready()) return;
  if (!noiseBuf) {
    const n = ac.sampleRate * 0.5;
    noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  s.connect(f); f.connect(env(vol, dur));
  s.start();
  s.stop(ac.currentTime + dur + 0.02);
}

export const sfx = {
  // AudioContextはユーザー操作内でしか起動できない → 最初のタップで呼ぶ
  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ac) ac = new AC();
    if (ac.state === 'suspended') ac.resume();
  },
  splash() { noise(0.22, 0.22, 480, 0.8); tone(150, 0.16, 'sine', 0.1, 55); },
  nibble() { tone(340, 0.06, 'sine', 0.14); },
  bite() { tone(210, 0.09, 'square', 0.18); setTimeout(() => tone(150, 0.13, 'square', 0.18), 90); },
  reelTick() { tone(1250, 0.018, 'square', 0.04); },              // カリ…カリ…(巻き)
  dragHard() { noise(0.09, 0.22, 950, 2.2); },                    // ジーッ！(走られてる・危険)
  dragSoft() { noise(0.1, 0.06, 480, 2.2); },                     // ジ…(いなして制御下)
  counterOk() { tone(560, 0.06, 'sine', 0.14); setTimeout(() => tone(840, 0.08, 'sine', 0.14), 70); },
  shed(t) { tone(160 + t * 4, 0.08, 'triangle', 0.11); },          // テンションが抜ける(音程が下がっていく)
  warn() { tone(1050, 0.05, 'square', 0.09); },
  snap() { tone(950, 0.32, 'sawtooth', 0.2, 65); noise(0.22, 0.2, 300, 1); },
  land() { tone(520, 0.1, 'sine', 0.16); setTimeout(() => tone(784, 0.2, 'sine', 0.16), 110); },
  toggleMute() {
    muted = !muted;
    localStorage.setItem('dokodemo.muted', muted ? '1' : '0');
    if (!muted) sfx.init();
    return muted;
  },
  isMuted() { return muted; },
};
