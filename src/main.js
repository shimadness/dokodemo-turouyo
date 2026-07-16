import { renderCreature } from './render.js';
import { SAMPLES, randomSpec } from './samples.js';
import { HABITAT_LABELS } from './parts.js';
import { WEEK, CREATURES } from './weeks/2026-w29-deepsea-neon.js';

const RARITY_CLASS = { 1: 'r1', 2: 'r2', 3: 'r3', 4: 'r4', 5: 'r5' };

function card(spec) {
  const stars = '★'.repeat(spec.rarity) + '☆'.repeat(5 - spec.rarity);
  const chips = spec.habitat.map((h) => `<span class="chip">${HABITAT_LABELS[h] ?? h}</span>`).join('');
  return `
    <div class="card ${RARITY_CLASS[spec.rarity]}">
      <div class="stage">${renderCreature(spec)}</div>
      <div class="stars">${stars}</div>
      <h2>${spec.name}</h2>
      <p class="flavor">${spec.flavor}</p>
      <div class="chips">${chips}</div>
      <div class="stats">
        <span>ちから ${spec.stats.power}</span>
        <span>はやさ ${spec.stats.speed}</span>
        <span>${spec.stats.weight}kg</span>
      </div>
    </div>`;
}

const show = (specs, el) => { el.innerHTML = specs.map(card).join(''); };

// 今週のプール（レア度順に並べる = 図鑑の見え方に近い）
const byRarity = [...CREATURES].sort((a, b) => a.rarity - b.rarity);
show(byRarity, document.getElementById('week'));
document.getElementById('week-theme').textContent = WEEK.theme;
document.getElementById('week-id').textContent = WEEK.id;
document.getElementById('week-note').textContent = WEEK.note;
document.getElementById('week-count').textContent = `${CREATURES.length}体`;

show(SAMPLES, document.getElementById('samples'));

const randGrid = document.getElementById('randoms');
const regen = () => show(Array.from({ length: 8 }, randomSpec), randGrid);
document.getElementById('regen').addEventListener('click', regen);
regen();
