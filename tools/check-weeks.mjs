// 週ファイルの検品: 名前の重複（全週横断）・パーツID/パターン/エフェクト/生息地の妥当性
// 使い方: node tools/check-weeks.mjs   （週ファイルを追加したら WEEK_FILES に足す）
import { BODIES, HEADS, TAILS, EYES, DECOS, PATTERNS, HABITAT_LABELS } from '../src/parts.js';

const WEEK_FILES = [
  '../src/weeks/2026-w29-deepsea-neon.js',
  '../src/weeks/2026-w30-natsumatsuri.js',
];

const EFFECTS = new Set(['none', 'bioluminescence', 'bubbles', 'sparkle']);
const errors = [];
const names = new Map(); // name -> 週ID

for (const file of WEEK_FILES) {
  const { WEEK, CREATURES } = await import(file);
  for (const c of CREATURES) {
    const at = `${WEEK.id} ${c.name}`;
    if (names.has(c.name)) errors.push(`${at}: 名前が ${names.get(c.name)} と重複`);
    names.set(c.name, WEEK.id);

    if (!(c.rarity >= 1 && c.rarity <= 5)) errors.push(`${at}: rarity不正 (${c.rarity})`);
    for (const h of c.habitat) if (!HABITAT_LABELS[h]) errors.push(`${at}: habitat不正 (${h})`);
    for (const k of ['power', 'speed', 'weight'])
      if (typeof c.stats?.[k] !== 'number') errors.push(`${at}: stats.${k} 欠落`);

    if (c.image) continue; // 画像1枚ものはパーツ検査不要
    const P = { body: BODIES, head: HEADS, tail: TAILS, eyes: EYES };
    for (const [slot, table] of Object.entries(P))
      if (!table[c.parts?.[slot]]) errors.push(`${at}: parts.${slot} 不正 (${c.parts?.[slot]})`);
    if (c.parts.deco !== null && !DECOS[c.parts.deco]) errors.push(`${at}: parts.deco 不正 (${c.parts.deco})`);
    if (!(c.pattern in PATTERNS)) errors.push(`${at}: pattern不正 (${c.pattern})`);
    if (!EFFECTS.has(c.effect)) errors.push(`${at}: effect不正 (${c.effect})`);
    if (!c.palette?.primary || !c.palette?.secondary || !c.palette?.accent) errors.push(`${at}: palette欠落`);
  }
}

if (errors.length) {
  console.error(`NG (${errors.length}件)`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`OK: ${WEEK_FILES.length}週 ${names.size}体、重複なし・ID全て妥当`);
