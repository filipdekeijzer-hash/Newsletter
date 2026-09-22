/* CONO Strip maker — vaste 6-vaks huisstijl, wisselende inhoud per onderwerp. */

const STORAGE_KEY = 'cono_strip_draft_v1';
const PANEL_COUNT = 6;

const SPREKERS = {
  daan: { naam: 'Data-Daan', kleur: '#2f6fb0' },
  bert: { naam: 'Boer Bert', kleur: '#345c34' },
  verteller: { naam: 'Verteller', kleur: '#e0a730' },
  geen: { naam: 'Geen (alleen beeld)', kleur: '#9c8b6b' }
};

const SCENES = {
  kaasfabriek: 'Kaasfabriek',
  kantoor: 'Kantoor',
  vergaderzaal: 'Vergaderzaal',
  wei: 'Buiten / wei',
  laptop: 'Laptop-close-up',
  feest: 'Feestje'
};

function defaultPanel(i) {
  const volgorde = ['kaasfabriek', 'kantoor', 'vergaderzaal', 'wei', 'laptop', 'feest'];
  const sprekers = ['bert', 'daan', 'daan', 'bert', 'verteller', 'geen'];
  return { id: uid(), scene: volgorde[i] || 'kantoor', spreker: sprekers[i] || 'geen', tekst: '' };
}

function defaultState() {
  return {
    titel: 'Data-Daan en Boer Bert',
    onderwerp: 'Thema: nieuw onderwerp',
    panels: Array.from({ length: PANEL_COUNT }, (_, i) => defaultPanel(i))
  };
}

function voorbeeldState() {
  return {
    titel: 'Data-Daan en Boer Bert over datakwaliteit',
    onderwerp: 'Thema: datakwaliteit',
    panels: [
      { id: uid(), scene: 'kaasfabriek', spreker: 'bert', tekst: 'Kijk Daan, dit wiel heeft nummer 482. Simpel toch?' },
      { id: uid(), scene: 'laptop', spreker: 'daan', tekst: 'Hmm... in het systeem staat 428. Iemand heeft de cijfers omgedraaid!' },
      { id: uid(), scene: 'kantoor', spreker: 'daan', tekst: 'Zo\'n foutje lijkt klein, maar verderop telt het systeem het drie keer over.' },
      { id: uid(), scene: 'vergaderzaal', spreker: 'verteller', tekst: 'Twee weken later...' },
      { id: uid(), scene: 'vergaderzaal', spreker: 'bert', tekst: 'Sinds we dubbel checken bij het invoeren, komt dit niet meer voor!' },
      { id: uid(), scene: 'feest', spreker: 'geen', tekst: 'Eén klein moment van checken. Groot verschil verderop. 🧀' }
    ]
  };
}

let state = loadLocal(STORAGE_KEY) || voorbeeldState();

const els = {
  titel: document.getElementById('f-titel'),
  onderwerp: document.getElementById('f-onderwerp'),
  panelsEditor: document.getElementById('panels-editor'),
  sheet: document.getElementById('strip-sheet'),
  status: document.getElementById('status-text')
};

const persist = debounce(() => {
  saveLocal(STORAGE_KEY, state);
  showStatus(els.status, 'Opgeslagen ✓', 1500);
}, 300);

/* ------------------------------- Editor UI -------------------------------- */
function fillStaticFields() {
  els.titel.value = state.titel;
  els.onderwerp.value = state.onderwerp;
}

function attachStaticBindings() {
  els.titel.addEventListener('input', () => { state.titel = els.titel.value; persist(); renderPreview(); });
  els.onderwerp.addEventListener('input', () => { state.onderwerp = els.onderwerp.value; persist(); renderPreview(); });
}

function optionsHTML(map, selected) {
  return Object.entries(map).map(([k, v]) =>
    `<option value="${k}" ${k === selected ? 'selected' : ''}>${typeof v === 'string' ? v : v.naam}</option>`
  ).join('');
}

function renderPanelsEditor() {
  els.panelsEditor.innerHTML = state.panels.map((p, i) => `
    <div class="section-card" data-panel-row="${p.id}">
      <div class="section-card-head">
        <span class="section-type-label">Vakje ${i + 1}</span>
      </div>
      <div class="field">
        <label>Spreker</label>
        <select data-field="spreker" data-panel="${p.id}">${optionsHTML(SPREKERS, p.spreker)}</select>
      </div>
      <div class="field">
        <label>Decor</label>
        <select data-field="scene" data-panel="${p.id}">${optionsHTML(SCENES, p.scene)}</select>
      </div>
      <div class="field">
        <label>Tekst${p.spreker === 'geen' ? ' (optioneel bijschrift)' : ''}</label>
        <textarea data-field="tekst" data-panel="${p.id}" rows="2" placeholder="Wat wordt hier gezegd of getoond?">${escapeHtml(p.tekst)}</textarea>
      </div>
    </div>
  `).join('');
}

els.panelsEditor.addEventListener('input', (e) => {
  const t = e.target;
  const panel = state.panels.find(p => p.id === t.dataset.panel);
  if (!panel || !t.dataset.field) return;
  panel[t.dataset.field] = t.value;
  persist();
  renderPreview();
});

/* -------------------------------- SVG bouwers ------------------------------ */
function wrapText(text, maxChars) {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (test.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function svgTextLines(lines, x, y, lineHeight, opts = {}) {
  const anchor = opts.anchor || 'middle';
  const fill = opts.fill || '#2c2013';
  const weight = opts.weight || '600';
  const size = opts.size || 13;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Nunito Sans, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">
    ${lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(l)}</tspan>`).join('')}
  </text>`;
}

/* --- Decors (400x300 viewBox) --- */
function sceneSVG(scene) {
  switch (scene) {
    case 'kaasfabriek':
      return `
        <rect width="400" height="300" fill="#f4e6bf"/>
        <rect x="0" y="150" width="400" height="150" fill="#e3d09a"/>
        <rect x="30" y="60" width="150" height="110" fill="#d8cdb8"/>
        <polygon points="30,60 105,20 180,60" fill="#b7a98a"/>
        <rect x="70" y="100" width="30" height="70" fill="#8d7f63"/>
        <circle cx="280" cy="210" r="55" fill="#e0a730"/>
        <circle cx="280" cy="210" r="55" fill="none" stroke="#c68a1f" stroke-width="4"/>
        <circle cx="260" cy="195" r="5" fill="#c68a1f"/>
        <circle cx="300" cy="200" r="4" fill="#c68a1f"/>
        <circle cx="285" cy="225" r="6" fill="#c68a1f"/>
        <circle cx="255" cy="225" r="4" fill="#c68a1f"/>
        <rect x="330" y="120" width="14" height="90" fill="#9c8b6b"/>
        <rect x="322" y="100" width="30" height="24" fill="#c8262a"/>`;
    case 'kantoor':
      return `
        <rect width="400" height="300" fill="#eef1e9"/>
        <rect x="0" y="200" width="400" height="100" fill="#d9cba4"/>
        <rect x="60" y="120" width="140" height="90" rx="6" fill="#345c34"/>
        <rect x="72" y="132" width="116" height="60" fill="#eaf3e6"/>
        <polyline points="82,180 105,150 125,165 150,135 178,150" fill="none" stroke="#c8262a" stroke-width="3"/>
        <rect x="118" y="210" width="24" height="16" fill="#5c4f39"/>
        <rect x="240" y="150" width="90" height="60" fill="#8d7f63"/>
        <circle cx="330" cy="150" r="18" fill="#568a4f"/>
        <rect x="322" y="150" width="16" height="40" fill="#8d7f63"/>`;
    case 'vergaderzaal':
      return `
        <rect width="400" height="300" fill="#f7f0dd"/>
        <ellipse cx="200" cy="210" rx="140" ry="40" fill="#c9a86a"/>
        <rect x="30" y="150" width="70" height="10" fill="#5c4f39"/>
        <rect x="60" y="130" width="10" height="30" fill="#5c4f39"/>
        <rect x="300" y="150" width="70" height="10" fill="#5c4f39"/>
        <rect x="330" y="130" width="10" height="30" fill="#5c4f39"/>
        <rect x="130" y="40" width="140" height="80" fill="#fff" stroke="#345c34" stroke-width="4"/>
        <polyline points="150,100 175,70 195,90 220,60 250,85" fill="none" stroke="#c8262a" stroke-width="3"/>`;
    case 'wei':
      return `
        <rect width="400" height="180" fill="#bcdcf0"/>
        <circle cx="330" cy="60" r="30" fill="#f4d998"/>
        <rect x="0" y="180" width="400" height="120" fill="#7fae5c"/>
        <rect x="0" y="175" width="400" height="14" fill="#5c8f45"/>
        <ellipse cx="110" cy="235" rx="38" ry="24" fill="#fdfdfd"/>
        <circle cx="80" cy="222" r="8" fill="#2c2013"/>
        <circle cx="120" cy="240" r="7" fill="#2c2013"/>
        <circle cx="90" cy="245" r="5" fill="#2c2013"/>
        <rect x="20" y="260" width="360" height="6" fill="#8d7f63"/>
        <rect x="40" y="245" width="6" height="35" fill="#8d7f63"/>
        <rect x="140" y="245" width="6" height="35" fill="#8d7f63"/>
        <rect x="260" y="245" width="6" height="35" fill="#8d7f63"/>
        <rect x="360" y="245" width="6" height="35" fill="#8d7f63"/>`;
    case 'laptop':
      return `
        <rect width="400" height="300" fill="#2c2013"/>
        <rect x="80" y="70" width="240" height="140" rx="6" fill="#1f1710"/>
        <rect x="92" y="82" width="216" height="116" fill="#345c34"/>
        <rect x="112" y="150" width="20" height="40" fill="#e0a730"/>
        <rect x="142" y="130" width="20" height="60" fill="#f4d998"/>
        <rect x="172" y="110" width="20" height="80" fill="#e0a730"/>
        <rect x="202" y="140" width="20" height="50" fill="#f4d998"/>
        <rect x="232" y="120" width="20" height="70" fill="#e0a730"/>
        <polygon points="60,210 340,210 380,270 20,270" fill="#4a3c26"/>
        <rect x="150" y="220" width="100" height="8" fill="#2c2013"/>`;
    case 'feest':
      return `
        <rect width="400" height="300" fill="#f4d998"/>
        <polygon points="0,0 30,0 15,30" fill="#c8262a"/>
        <polygon points="60,0 90,0 75,30" fill="#345c34"/>
        <polygon points="120,0 150,0 135,30" fill="#c8262a"/>
        <polygon points="180,0 210,0 195,30" fill="#345c34"/>
        <polygon points="240,0 270,0 255,30" fill="#c8262a"/>
        <polygon points="300,0 330,0 315,30" fill="#345c34"/>
        <polygon points="360,0 390,0 375,30" fill="#c8262a"/>
        <circle cx="60" cy="80" r="6" fill="#c8262a"/>
        <circle cx="340" cy="100" r="6" fill="#345c34"/>
        <circle cx="100" cy="130" r="5" fill="#e0a730"/>
        <circle cx="300" cy="60" r="5" fill="#c8262a"/>
        <rect x="90" y="210" width="220" height="18" fill="#8d7f63"/>
        <circle cx="150" cy="200" r="26" fill="#e0a730"/>
        <circle cx="240" cy="205" r="20" fill="#f4d998" stroke="#e0a730" stroke-width="3"/>`;
    default:
      return `<rect width="400" height="300" fill="#eef1e9"/>`;
  }
}

/* --- Personages --- */
function daanAvatar(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-32" y="10" width="64" height="70" rx="14" fill="#2f6fb0"/>
    <circle cx="0" cy="-6" r="28" fill="#f3cfa0"/>
    <path d="M -26 -18 Q 0 -42 26 -18 Q 20 -30 0 -30 Q -20 -30 -26 -18 Z" fill="#4a3626"/>
    <circle cx="-11" cy="-4" r="8" fill="none" stroke="#2c2013" stroke-width="2.5"/>
    <circle cx="11" cy="-4" r="8" fill="none" stroke="#2c2013" stroke-width="2.5"/>
    <line x1="-3" y1="-4" x2="3" y2="-4" stroke="#2c2013" stroke-width="2.5"/>
    <path d="M -6 8 Q 0 12 6 8" fill="none" stroke="#8a5a3a" stroke-width="2"/>
    <rect x="-22" y="40" width="30" height="22" rx="3" fill="#e8e8e8" stroke="#9c8b6b" stroke-width="2"/>
    <polyline points="-18,58 -10,46 -3,52 6,40" fill="none" stroke="#c8262a" stroke-width="2"/>
  </g>`;
}

function bertAvatar(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <path d="M -34 80 L -26 10 Q 0 -2 26 10 L 34 80 Z" fill="#345c34"/>
    <rect x="-14" y="20" width="28" height="34" fill="#f4d998" stroke="#24401f" stroke-width="2"/>
    <circle cx="0" cy="-6" r="28" fill="#f3cfa0"/>
    <path d="M -28 -14 Q 0 -34 28 -14 L 26 -22 Q 0 -36 -26 -22 Z" fill="#fdfdfd" stroke="#dcdcdc" stroke-width="1"/>
    <circle cx="-11" cy="-6" r="4" fill="#2c2013"/>
    <circle cx="11" cy="-6" r="4" fill="#2c2013"/>
    <path d="M -14 8 Q 0 4 14 8 Q 0 16 -14 8 Z" fill="#7a5230"/>
    <circle cx="34" cy="40" r="20" fill="#e0a730"/>
    <circle cx="27" cy="33" r="3" fill="#c68a1f"/>
    <circle cx="40" cy="45" r="3" fill="#c68a1f"/>
  </g>`;
}

function speechBubble(text, side) {
  const isLeft = side === 'left';
  const bx = isLeft ? 16 : 172;
  const bw = 212;
  const by = 14;
  const bh = 86;
  const tailPoints = isLeft
    ? `${bx + 46},${by + bh} ${bx + 70},${by + bh} ${bx + 40},${by + bh + 22}`
    : `${bx + bw - 70},${by + bh} ${bx + bw - 46},${by + bh} ${bx + bw - 40},${by + bh + 22}`;
  const lines = wrapText(text || '...', 24);
  const textBlock = svgTextLines(lines, bx + bw / 2, by + 30, 17, { anchor: 'middle', size: 13.5 });
  return `
    <g>
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="16" fill="#ffffff" stroke="#2c2013" stroke-width="3"/>
      <polygon points="${tailPoints}" fill="#ffffff" stroke="#2c2013" stroke-width="3"/>
      <polygon points="${tailPoints}" fill="#ffffff"/>
      ${textBlock}
    </g>`;
}

function captionBanner(text) {
  const lines = wrapText(text || '...', 44);
  return `
    <g>
      <rect x="0" y="0" width="400" height="${34 + (lines.length - 1) * 16}" fill="#e0a730"/>
      ${svgTextLines(lines, 200, 22, 16, { anchor: 'middle', size: 14, fill: '#2c2013', weight: '800' })}
    </g>`;
}

function captionBottom(text) {
  const lines = wrapText(text, 46);
  const h = 22 + (lines.length - 1) * 15;
  return `
    <g>
      <rect x="0" y="${300 - h - 10}" width="400" height="${h + 10}" fill="rgba(44,32,19,0.82)"/>
      ${svgTextLines(lines, 200, 300 - h + 8, 15, { anchor: 'middle', size: 12.5, fill: '#fff', weight: '600' })}
    </g>`;
}

function renderPanelSVG(panel) {
  const bg = sceneSVG(panel.scene);
  let overlay = '';
  if (panel.spreker === 'daan') {
    overlay = daanAvatar(80, 210, 1) + speechBubble(panel.tekst, 'left');
  } else if (panel.spreker === 'bert') {
    overlay = bertAvatar(320, 210, 1) + speechBubble(panel.tekst, 'right');
  } else if (panel.spreker === 'verteller') {
    overlay = captionBanner(panel.tekst);
  } else if (panel.tekst) {
    overlay = captionBottom(panel.tekst);
  }
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${bg}${overlay}</svg>`;
}

/* -------------------------------- Preview -------------------------------- */
function renderPreview() {
  els.sheet.innerHTML = `
    <div class="strip-header">
      <span class="strip-kicker">CONO Strip</span>
      <h1>${escapeHtml(state.titel || 'Data-Daan en Boer Bert')}</h1>
      ${state.onderwerp ? `<span class="onderwerp-tag">${escapeHtml(state.onderwerp)}</span>` : ''}
    </div>
    <div class="strip-grid">
      ${state.panels.map((p, i) => `
        <div class="strip-panel">
          <span class="panel-number">${i + 1}</span>
          ${renderPanelSVG(p)}
        </div>
      `).join('')}
    </div>
    <div class="legend-cast">
      <span class="cast-item"><span class="swatch" style="background:${SPREKERS.daan.kleur}"></span> Data-Daan</span>
      <span class="cast-item"><span class="swatch" style="background:${SPREKERS.bert.kleur}"></span> Boer Bert</span>
      <span class="cast-item"><span class="swatch" style="background:${SPREKERS.verteller.kleur}"></span> Verteller</span>
    </div>
    <p class="strip-footer-note">Vast stripformaat van CONO Kaasmakers — vul per editie een nieuw onderwerp in via het formulier links.</p>
  `;
}

/* --------------------------------- Toolbar -------------------------------- */
document.getElementById('btn-nieuw').addEventListener('click', () => {
  if (!confirm('Dit wist de huidige strip en start een lege versie. Doorgaan?')) return;
  state = defaultState();
  fillStaticFields();
  renderPanelsEditor();
  renderPreview();
  persist();
});

document.getElementById('btn-voorbeeld').addEventListener('click', () => {
  if (!confirm('Dit vervangt de huidige strip door een voorbeeld. Doorgaan?')) return;
  state = voorbeeldState();
  fillStaticFields();
  renderPanelsEditor();
  renderPreview();
  persist();
});

document.getElementById('btn-export').addEventListener('click', () => {
  const naam = (state.titel || 'cono-strip').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  downloadJSON(`${naam}.json`, state);
});

document.getElementById('input-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readJSONFile(file, (data) => {
    if (!data.panels || data.panels.length !== PANEL_COUNT) {
      alert(`Dit bestand heeft geen geldige set van ${PANEL_COUNT} vakjes.`);
      return;
    }
    state = data;
    fillStaticFields();
    renderPanelsEditor();
    renderPreview();
    persist();
  }, () => alert('Dit bestand kon niet worden gelezen. Is het een geldig JSON-exportbestand?'));
  e.target.value = '';
});

document.getElementById('btn-print').addEventListener('click', () => window.print());

/* ---------------------------------- Init ---------------------------------- */
fillStaticFields();
attachStaticBindings();
renderPanelsEditor();
renderPreview();
