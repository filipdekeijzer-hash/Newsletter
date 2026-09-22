/* CONO Strip maker — vaste opmaak van 6 vakjes, wisselende inhoud per onderwerp.
 *
 * De tekeningen zijn opgebouwd uit SVG-vormen met een doorlopende inktlijn,
 * zodat de personages, decors en ballonnen dezelfde beeldtaal delen. Per
 * vakje kies je wie er in beeld staat, wie er praat, met welke uitdrukking,
 * in welk decor en met welk voorwerp — daarmee ziet elke editie er anders
 * uit terwijl de vormgeving hetzelfde blijft.
 */

const STORAGE_KEY = 'cono_strip_draft_v1';
const PANEL_COUNT = 6;

const INKT = '#2b2118';

const KARAKTERS = {
  daan: {
    naam: 'Data-Daan',
    kleur: '#3a7bbf',
    shirt: '#3a7bbf',
    shirtDonker: '#2c5f96',
    huid: '#f0c69c',
    huidSchaduw: '#d9a87c',
    haar: '#4a3426'
  },
  bert: {
    naam: 'Boer Bert',
    kleur: '#3d6b3a',
    shirt: '#f7f4ec',
    shirtDonker: '#d9d3c4',
    huid: '#f0c69c',
    huidSchaduw: '#d9a87c',
    haar: '#8a6236'
  }
};

const CAST = {
  daan: 'Alleen Data-Daan',
  bert: 'Alleen Boer Bert',
  beiden: 'Allebei in beeld',
  niemand: 'Niemand (alleen decor)'
};

const SPREKERS = {
  daan: 'Data-Daan',
  bert: 'Boer Bert',
  verteller: 'Verteller (tekstbalk)',
  geen: 'Niemand (alleen bijschrift)'
};

const EMOTIES = {
  neutraal: 'Neutraal',
  blij: 'Blij',
  verbaasd: 'Verbaasd',
  denkend: 'Denkend',
  boos: 'Fel',
  geschrokken: 'Geschrokken'
};

const BALLONNEN = {
  spreek: 'Spreekballon',
  denk: 'Denkballon',
  roep: 'Roepballon'
};

const SCENES = {
  kaasfabriek: 'Kaasfabriek',
  kantoor: 'Kantoor',
  vergaderzaal: 'Vergaderzaal',
  wei: 'Buiten / wei',
  strand: 'Strand / zwembad',
  laptop: 'Scherm met grafiek',
  feest: 'Feestje'
};

const PROPS = {
  geen: 'Geen',
  ijsje: 'IJsje',
  kaaswiel: 'Kaaswiel',
  grafiek: 'Grafiekje',
  vraagteken: 'Vraagteken',
  sleutel: 'Sleutel',
  map: 'Ordner'
};

/* ------------------------------- Gegevens -------------------------------- */
function defaultPanel(i) {
  const scenes = ['kaasfabriek', 'kantoor', 'vergaderzaal', 'wei', 'laptop', 'feest'];
  return {
    id: uid(),
    scene: scenes[i] || 'kantoor',
    cast: 'beiden',
    spreker: i % 2 === 0 ? 'bert' : 'daan',
    emotie: 'neutraal',
    ballon: 'spreek',
    prop: 'geen',
    tekst: ''
  };
}

function defaultState() {
  return {
    titel: 'Data-Daan en Boer Bert',
    onderwerp: 'Thema: nieuw onderwerp',
    panels: Array.from({ length: PANEL_COUNT }, (_, i) => defaultPanel(i))
  };
}

/* Voorbeeld: de JargonJudo-strip bij de rubriek "Causaal verband". */
function voorbeeldState() {
  return {
    titel: 'JargonJudo: causaal verband',
    onderwerp: 'Thema: correlatie is geen oorzaak',
    panels: [
      { id: uid(), scene: 'laptop', cast: 'beiden', spreker: 'daan', emotie: 'verbaasd', ballon: 'spreek', prop: 'geen',
        tekst: 'Kijk nou! Hoe meer ijsjes er verkocht worden, hoe meer mensen er verdrinken.' },
      { id: uid(), scene: 'kantoor', cast: 'beiden', spreker: 'bert', emotie: 'boos', ballon: 'roep', prop: 'ijsje',
        tekst: 'Dan verbieden we het ijs! Vandaag nog!' },
      { id: uid(), scene: 'vergaderzaal', cast: 'niemand', spreker: 'verteller', emotie: 'neutraal', ballon: 'spreek', prop: 'geen',
        tekst: 'Het voorstel "IJsverbod redt levens" gaat naar de directie.' },
      { id: uid(), scene: 'kantoor', cast: 'daan', spreker: 'daan', emotie: 'denkend', ballon: 'denk', prop: 'vraagteken',
        tekst: 'Wacht eens... duwt een hoorntje iemand het water in?' },
      { id: uid(), scene: 'strand', cast: 'beiden', spreker: 'bert', emotie: 'geschrokken', ballon: 'spreek', prop: 'ijsje',
        tekst: 'Oh. Het is gewoon warm. Dus méér zwemmers én méér ijsjes.' },
      { id: uid(), scene: 'strand', cast: 'beiden', spreker: 'daan', emotie: 'blij', ballon: 'spreek', prop: 'geen',
        tekst: 'Correlatie is geen oorzaak. Geniet van je ijsje.' }
    ]
  };
}

let state = loadLocal(STORAGE_KEY) || voorbeeldState();

const els = {
  titel: document.getElementById('st-titel'),
  onderwerp: document.getElementById('st-onderwerp'),
  panelsEditor: document.getElementById('st-panels-editor'),
  sheet: document.getElementById('st-sheet'),
  status: document.getElementById('st-status')
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
    `<option value="${k}"${k === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`
  ).join('');
}

function keuzeVeld(label, veld, map, waarde, panelId) {
  return `<div class="field">
    <label>${label}</label>
    <select data-field="${veld}" data-panel="${panelId}">${optionsHTML(map, waarde)}</select>
  </div>`;
}

function renderPanelsEditor() {
  els.panelsEditor.innerHTML = state.panels.map((p, i) => `
    <div class="section-card" data-panel-row="${p.id}">
      <div class="section-card-head">
        <span class="section-type-label">Vakje ${i + 1}</span>
      </div>
      <div class="veld-paar">
        ${keuzeVeld('In beeld', 'cast', CAST, p.cast || 'beiden', p.id)}
        ${keuzeVeld('Wie praat', 'spreker', SPREKERS, p.spreker, p.id)}
      </div>
      <div class="field">
        <label>Tekst${p.spreker === 'geen' ? ' (bijschrift)' : ''}</label>
        <textarea data-field="tekst" data-panel="${p.id}" rows="2" placeholder="Wat wordt hier gezegd of getoond?">${escapeHtml(p.tekst)}</textarea>
      </div>
      <details class="meer-opties">
        <summary>Beeld bijstellen</summary>
        <div class="veld-paar">
          ${keuzeVeld('Uitdrukking', 'emotie', EMOTIES, p.emotie || 'neutraal', p.id)}
          ${keuzeVeld('Ballon', 'ballon', BALLONNEN, p.ballon || 'spreek', p.id)}
        </div>
        <div class="veld-paar">
          ${keuzeVeld('Decor', 'scene', SCENES, p.scene, p.id)}
          ${keuzeVeld('Voorwerp', 'prop', PROPS, p.prop || 'geen', p.id)}
        </div>
      </details>
    </div>
  `).join('');
}

els.panelsEditor.addEventListener('input', (e) => {
  const t = e.target;
  const panel = state.panels.find(p => p.id === t.dataset.panel);
  if (!panel || !t.dataset.field) return;
  panel[t.dataset.field] = t.value;
  persist();
  if (t.dataset.field === 'spreker') renderPanelsEditor();
  renderPreview();
});

/* ------------------------------ Tekstopmaak ------------------------------ */
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
  const fill = opts.fill || INKT;
  const weight = opts.weight || '700';
  const size = opts.size || 13.5;
  const family = opts.family || 'Poppins, Nunito Sans, sans-serif';
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">
    ${lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(l)}</tspan>`).join('')}
  </text>`;
}

/* --------------------------------- Decors --------------------------------- */
/* Alle decors delen hetzelfde formaat (400×300) en dezelfde inktlijn. */
function sceneSVG(scene) {
  const inkt = `stroke="${INKT}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (scene) {
    case 'kaasfabriek':
      return `
        <rect width="400" height="300" fill="#f7ead0"/>
        <rect x="0" y="196" width="400" height="104" fill="#e2cfa4"/>
        <line x1="0" y1="196" x2="400" y2="196" stroke="${INKT}" stroke-width="2.5"/>
        <rect x="22" y="66" width="128" height="130" fill="#ded2ba" ${inkt}/>
        <polygon points="14,66 86,24 158,66" fill="#c0b394" ${inkt}/>
        <rect x="46" y="104" width="34" height="42" fill="#b9d4e4" ${inkt}/>
        <rect x="100" y="104" width="34" height="42" fill="#b9d4e4" ${inkt}/>
        <rect x="236" y="120" width="132" height="76" rx="8" fill="#b9bcc0" ${inkt}/>
        <rect x="252" y="138" width="46" height="30" rx="4" fill="#8e9398" ${inkt}/>
        <circle cx="330" cy="153" r="14" fill="#e0a730" ${inkt}/>
        <rect x="196" y="176" width="38" height="20" rx="4" fill="#9aa0a4" ${inkt}/>
        <ellipse cx="296" cy="236" rx="56" ry="20" fill="#e0a730" ${inkt}/>
        <path d="M 240 236 v 16 a 56 20 0 0 0 112 0 v -16" fill="#c68a1f" ${inkt}/>
        <circle cx="276" cy="232" r="5" fill="#c68a1f"/>
        <circle cx="308" cy="238" r="4" fill="#c68a1f"/>`;

    case 'kantoor':
      return `
        <rect width="400" height="300" fill="#eef1ea"/>
        <rect x="0" y="206" width="400" height="94" fill="#d7c8a2"/>
        <line x1="0" y1="206" x2="400" y2="206" stroke="${INKT}" stroke-width="2.5"/>
        <rect x="222" y="54" width="150" height="104" rx="6" fill="#fbf7ea" ${inkt}/>
        <polyline points="240,134 272,96 296,118 326,74 356,100" fill="none" stroke="#c8262a" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="240" cy="134" r="4" fill="#c8262a"/>
        <circle cx="356" cy="100" r="4" fill="#c8262a"/>
        <rect x="26" y="150" width="118" height="56" rx="5" fill="#a8825a" ${inkt}/>
        <rect x="40" y="120" width="54" height="30" rx="4" fill="#4c5358" ${inkt}/>
        <rect x="46" y="126" width="42" height="18" fill="#9fd0e8"/>
        <rect x="100" y="138" width="34" height="12" rx="3" fill="#cfd4d8" ${inkt}/>
        <rect x="336" y="170" width="40" height="36" rx="4" fill="#b4794a" ${inkt}/>
        <path d="M 356 170 q -26 -18 -14 -40 q 20 6 14 40 z" fill="#5c8f4f" ${inkt}/>
        <path d="M 356 170 q 26 -14 18 -38 q -22 8 -18 38 z" fill="#79a862" ${inkt}/>`;

    case 'vergaderzaal':
      return `
        <rect width="400" height="300" fill="#f7f1e0"/>
        <rect x="0" y="210" width="400" height="90" fill="#dccdae"/>
        <line x1="0" y1="210" x2="400" y2="210" stroke="${INKT}" stroke-width="2.5"/>
        <rect x="118" y="34" width="168" height="98" rx="5" fill="#fdfbf4" ${inkt}/>
        <polyline points="138,108 170,72 196,94 226,58 266,88" fill="none" stroke="#c8262a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="138" y1="118" x2="266" y2="118" stroke="#c9bfa6" stroke-width="3"/>
        <rect x="22" y="150" width="12" height="46" rx="4" fill="#7c6a4e" ${inkt}/>
        <rect x="22" y="146" width="56" height="12" rx="4" fill="#7c6a4e" ${inkt}/>
        <rect x="366" y="150" width="12" height="46" rx="4" fill="#7c6a4e" ${inkt}/>
        <rect x="322" y="146" width="56" height="12" rx="4" fill="#7c6a4e" ${inkt}/>
        <ellipse cx="200" cy="244" rx="156" ry="42" fill="#c49a62" ${inkt}/>
        <ellipse cx="200" cy="238" rx="156" ry="42" fill="#d9b478" ${inkt}/>
        <rect x="96" y="222" width="42" height="28" rx="3" fill="#fdfbf4" ${inkt} transform="rotate(-7 117 236)"/>
        <rect x="256" y="230" width="42" height="28" rx="3" fill="#fdfbf4" ${inkt} transform="rotate(6 277 244)"/>
        <path d="M 186 248 h 26 v 14 a 13 13 0 0 1 -26 0 z" fill="#fdfbf4" ${inkt}/>`;

    case 'wei':
      return `
        <rect width="400" height="300" fill="#c3e0f2"/>
        <circle cx="336" cy="52" r="30" fill="#f6d98f" ${inkt}/>
        <ellipse cx="86" cy="60" rx="44" ry="20" fill="#fdfdfd" ${inkt}/>
        <ellipse cx="128" cy="52" rx="30" ry="18" fill="#fdfdfd"/>
        <rect x="0" y="176" width="400" height="124" fill="#86b661"/>
        <path d="M 0 176 q 60 -16 120 -2 t 120 0 t 160 -6 v 132 H 0 z" fill="#79a955" ${inkt}/>
        <ellipse cx="292" cy="222" rx="46" ry="28" fill="#fdfdfd" ${inkt}/>
        <ellipse cx="270" cy="212" rx="12" ry="9" fill="${INKT}"/>
        <ellipse cx="306" cy="232" rx="9" ry="7" fill="${INKT}"/>
        <circle cx="248" cy="206" r="17" fill="#fdfdfd" ${inkt}/>
        <circle cx="243" cy="204" r="2.6" fill="${INKT}"/>
        <circle cx="253" cy="204" r="2.6" fill="${INKT}"/>
        <line x1="0" y1="252" x2="400" y2="252" stroke="#8d6f47" stroke-width="7"/>
        <rect x="48" y="228" width="9" height="56" fill="#8d6f47" ${inkt}/>
        <rect x="168" y="228" width="9" height="56" fill="#8d6f47" ${inkt}/>`;

    case 'strand':
      return `
        <rect width="400" height="300" fill="#c3e0f2"/>
        <circle cx="62" cy="50" r="28" fill="#f6d98f" ${inkt}/>
        <rect x="0" y="128" width="400" height="86" fill="#4b9fd2"/>
        <line x1="0" y1="128" x2="400" y2="128" stroke="${INKT}" stroke-width="2.5"/>
        <path d="M 0 152 q 26 -10 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0" fill="none" stroke="#b8dcf0" stroke-width="3.5"/>
        <path d="M 0 184 q 26 -10 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0" fill="none" stroke="#86c3e4" stroke-width="3.5"/>
        <rect x="0" y="210" width="400" height="90" fill="#f0dcab"/>
        <line x1="0" y1="210" x2="400" y2="210" stroke="${INKT}" stroke-width="2.5"/>
        <rect x="128" y="228" width="92" height="30" rx="4" fill="#c8262a" ${inkt}/>
        <rect x="128" y="238" width="92" height="9" fill="#fdfdfd"/>
        <circle cx="96" cy="238" r="15" fill="#fdfdfd" ${inkt}/>
        <path d="M 96 223 a 15 15 0 0 1 13 22 z" fill="#c8262a"/>
        <path d="M 96 253 a 15 15 0 0 1 -13 -22 z" fill="#3d6b3a"/>`;

    case 'laptop':
      return `
        <rect width="400" height="300" fill="#3a3228"/>
        <rect x="52" y="34" width="296" height="184" rx="10" fill="#241e17" ${inkt}/>
        <rect x="68" y="50" width="264" height="152" rx="4" fill="#f7f2e4" ${inkt}/>
        <line x1="92" y1="178" x2="316" y2="178" stroke="#b9ae95" stroke-width="3"/>
        <line x1="92" y1="64" x2="92" y2="178" stroke="#b9ae95" stroke-width="3"/>
        <rect x="106" y="126" width="26" height="52" fill="#e0a730" ${inkt}/>
        <rect x="146" y="106" width="26" height="72" fill="#c8262a" ${inkt}/>
        <rect x="186" y="140" width="26" height="38" fill="#e0a730" ${inkt}/>
        <rect x="226" y="92" width="26" height="86" fill="#c8262a" ${inkt}/>
        <rect x="266" y="118" width="26" height="60" fill="#e0a730" ${inkt}/>
        <polygon points="30,218 370,218 396,262 4,262" fill="#4f4536" ${inkt}/>
        <rect x="150" y="232" width="100" height="10" rx="4" fill="#241e17"/>`;

    case 'feest':
      return `
        <rect width="400" height="300" fill="#f6dfa4"/>
        <path d="M 0 14 q 50 26 100 0 t 100 0 t 100 0 t 100 0" fill="none" stroke="${INKT}" stroke-width="2.5"/>
        <polygon points="18,20 44,14 32,48" fill="#c8262a" ${inkt}/>
        <polygon points="82,20 108,20 95,52" fill="#3d6b3a" ${inkt}/>
        <polygon points="146,20 172,16 159,50" fill="#e0a730" ${inkt}/>
        <polygon points="228,16 254,20 241,50" fill="#c8262a" ${inkt}/>
        <polygon points="292,20 318,16 305,48" fill="#3d6b3a" ${inkt}/>
        <polygon points="356,16 382,20 369,50" fill="#e0a730" ${inkt}/>
        <circle cx="52" cy="92" r="6" fill="#c8262a"/>
        <circle cx="348" cy="108" r="6" fill="#3d6b3a"/>
        <circle cx="106" cy="132" r="5" fill="#c8262a"/>
        <circle cx="306" cy="76" r="5" fill="#3d6b3a"/>
        <rect x="0" y="212" width="400" height="88" fill="#e3c88a"/>
        <line x1="0" y1="212" x2="400" y2="212" stroke="${INKT}" stroke-width="2.5"/>
        <rect x="88" y="226" width="224" height="16" rx="4" fill="#a8825a" ${inkt}/>
        <path d="M 128 226 l 26 -34 l 26 34 z" fill="#e0a730" ${inkt}/>
        <circle cx="236" cy="212" r="20" fill="#f4d998" ${inkt}/>`;

    default:
      return `<rect width="400" height="300" fill="#eef1ea"/>`;
  }
}

/* ------------------------------- Personages ------------------------------- */
/* Lokale maten: middel op y=0, schouders op y=-66, hoofdmidden op y=-104. */

const ARMEN = {
  neutraal:    { l: 'M -24 -64 Q -36 -42 -32 -16', r: 'M 24 -64 Q 36 -42 32 -16', hl: [-32, -16], hr: [32, -16], anker: [50, -22] },
  blij:        { l: 'M -24 -64 Q -37 -44 -33 -18', r: 'M 24 -64 Q 44 -68 45 -94', hl: [-33, -18], hr: [45, -94], anker: [50, -102] },
  verbaasd:    { l: 'M -24 -64 Q -43 -68 -44 -92', r: 'M 24 -64 Q 43 -68 44 -92', hl: [-44, -92], hr: [44, -92], anker: [49, -100] },
  denkend:     { l: 'M -24 -64 Q -33 -44 -16 -38', r: 'M 24 -64 Q 35 -52 13 -82', hl: [-16, -38], hr: [13, -82], anker: [-50, -30] },
  boos:        { l: 'M -24 -64 Q -32 -46 -7 -42', r: 'M 24 -64 Q 32 -46 7 -36', hl: [-7, -42], hr: [7, -36], anker: [52, -30] },
  geschrokken: { l: 'M -24 -64 Q -46 -72 -48 -98', r: 'M 24 -64 Q 46 -72 48 -98', hl: [-48, -98], hr: [48, -98], anker: [53, -104] }
};

function gezichtSVG(emotie) {
  const oogY = -108;
  /* Gewone ogen zijn een gevulde pupil met een lichtpuntje: een omlijnde
     witte oogbol leest op dit formaat als een bril. */
  const oog = (dx, dy) => `
    <circle cx="${dx}" cy="${oogY + (dy || 0)}" r="4.4" fill="${INKT}"/>
    <circle cx="${dx + 1.5}" cy="${oogY + (dy || 0) - 1.5}" r="1.5" fill="#fff"/>`;
  const pupil = (dx, dy, r) => `<circle cx="${dx}" cy="${oogY + (dy || 0)}" r="${r || 3.2}" fill="${INKT}"/>`;
  const wenkbrauw = (x, y, d) => `<path d="M ${x - 7} ${y} q 7 ${d} 14 0" fill="none" stroke="${INKT}" stroke-width="2.8" stroke-linecap="round"/>`;
  const mond = (d, vul) => `<path d="${d}" fill="${vul || 'none'}" stroke="${INKT}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;

  switch (emotie) {
    case 'blij':
      return `
        <path d="M -16 ${oogY + 1} q 6 -8 12 0" fill="none" stroke="${INKT}" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M 4 ${oogY + 1} q 6 -8 12 0" fill="none" stroke="${INKT}" stroke-width="2.8" stroke-linecap="round"/>
        ${wenkbrauw(-10, -124, -4)}${wenkbrauw(10, -124, -4)}
        ${mond('M -12 -95 q 12 15 24 0 q -12 4 -24 0 z', '#a24a4a')}
        <circle cx="-20" cy="-98" r="5" fill="#e79a8c" opacity=".55"/>
        <circle cx="20" cy="-98" r="5" fill="#e79a8c" opacity=".55"/>`;

    case 'verbaasd':
      return `
        <circle cx="-10" cy="${oogY}" r="7" fill="#fff" stroke="${INKT}" stroke-width="2.4"/>
        <circle cx="10" cy="${oogY}" r="7" fill="#fff" stroke="${INKT}" stroke-width="2.4"/>
        ${pupil(-10, 1, 3)}${pupil(10, 1, 3)}
        ${wenkbrauw(-11, -126, -6)}${wenkbrauw(11, -126, -6)}
        <ellipse cx="0" cy="-92" rx="6" ry="8" fill="#a24a4a" stroke="${INKT}" stroke-width="2.4"/>`;

    case 'denkend':
      return `
        ${oog(-8, -2)}${oog(12, -2)}
        <path d="M -17 -126 q 7 -5 14 -1" fill="none" stroke="${INKT}" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M 4 -122 q 7 2 14 0" fill="none" stroke="${INKT}" stroke-width="2.8" stroke-linecap="round"/>
        ${mond('M -7 -93 q 7 3 14 -1')}`;

    case 'boos':
      return `
        ${oog(-10, 0)}${oog(10, 0)}
        <path d="M -19 -124 L -3 -117" fill="none" stroke="${INKT}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M 19 -124 L 3 -117" fill="none" stroke="${INKT}" stroke-width="3.2" stroke-linecap="round"/>
        ${mond('M -11 -90 q 11 -7 22 0')}`;

    case 'geschrokken':
      return `
        <circle cx="-11" cy="${oogY}" r="9" fill="#fff" stroke="${INKT}" stroke-width="2.4"/>
        <circle cx="11" cy="${oogY}" r="9" fill="#fff" stroke="${INKT}" stroke-width="2.4"/>
        ${pupil(-11, 0, 3)}${pupil(11, 0, 3)}
        ${wenkbrauw(-12, -128, -6)}${wenkbrauw(12, -128, -6)}
        <ellipse cx="0" cy="-90" rx="8" ry="10" fill="#a24a4a" stroke="${INKT}" stroke-width="2.4"/>
        <path d="M 26 -118 q 6 8 0 12 q -6 -4 0 -12 z" fill="#8ec6e8" stroke="${INKT}" stroke-width="2"/>`;

    default: /* neutraal */
      return `
        ${oog(-10, 0)}${oog(10, 0)}
        ${wenkbrauw(-10, -123, -3)}${wenkbrauw(10, -123, -3)}
        ${mond('M -8 -93 q 8 6 16 0')}`;
  }
}

function personageSVG(type, opties) {
  const k = KARAKTERS[type];
  const emotie = ARMEN[opties.emotie] ? opties.emotie : 'neutraal';
  const arm = ARMEN[emotie];
  const inkt = `stroke="${INKT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const armLijn = (d) => `
    <path d="${d}" fill="none" stroke="${INKT}" stroke-width="15" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${k.shirt}" stroke-width="9.5" stroke-linecap="round"/>`;
  const hand = (p) => `<circle cx="${p[0]}" cy="${p[1]}" r="7.5" fill="${k.huid}" ${inkt}/>`;

  const hoofddeksel = type === 'daan'
    ? `<path d="M -26 -116 q 4 -22 26 -22 q 22 0 26 22 q -12 -10 -26 -9 q -16 1 -26 9 z" fill="${k.haar}" ${inkt}/>`
    : `<path d="M -27 -118 q 3 -24 27 -24 q 24 0 27 24 q -13 -8 -27 -8 q -14 0 -27 8 z" fill="#fdfdfd" ${inkt}/>
       <path d="M -29 -118 q 29 -10 58 0 q -29 8 -58 0 z" fill="#ece7db" ${inkt}/>`;

  const accessoire = type === 'daan'
    ? `<g fill="none" stroke="${INKT}" stroke-width="2.6">
         <rect x="-20" y="-116" width="20" height="17" rx="6"/>
         <rect x="0" y="-116" width="20" height="17" rx="6"/>
         <path d="M -20 -110 h -6 M 20 -110 h 6 M 0 -110 h 0"/>
       </g>`
    : `<path d="M -17 -98 q 9 -8 17 -3 q 8 -5 17 3 q -9 8 -17 4 q -8 4 -17 -4 z" fill="${k.haar}" ${inkt}/>`;

  const romp = type === 'daan'
    ? `<path d="M -31 4 L -27 -56 Q -25 -68 -10 -72 L 10 -72 Q 25 -68 27 -56 L 31 4 Z" fill="${k.shirt}" ${inkt}/>
       <path d="M -10 -72 L 0 -56 L 10 -72" fill="${k.shirtDonker}" ${inkt}/>`
    : `<path d="M -31 4 L -27 -56 Q -25 -68 -10 -72 L 10 -72 Q 25 -68 27 -56 L 31 4 Z" fill="${k.shirt}" ${inkt}/>
       <path d="M -19 4 L -17 -58 Q -9 -64 0 -64 Q 9 -64 17 -58 L 19 4 Z" fill="${k.kleur}" ${inkt}/>`;

  const schaal = opties.schaal || 1;
  const spiegel = opties.spiegel ? -1 : 1;

  return `<g transform="translate(${opties.x},${opties.y}) scale(${schaal * spiegel},${schaal})">
    ${armLijn(arm.l)}
    ${romp}
    ${armLijn(arm.r)}
    ${hand(arm.hl)}${hand(arm.hr)}
    <rect x="-8" y="-84" width="16" height="16" fill="${k.huidSchaduw}" ${inkt}/>
    <ellipse cx="0" cy="-104" rx="26" ry="29" fill="${k.huid}" ${inkt}/>
    <ellipse cx="-26" cy="-104" rx="5" ry="7" fill="${k.huid}" ${inkt}/>
    <ellipse cx="26" cy="-104" rx="5" ry="7" fill="${k.huid}" ${inkt}/>
    ${hoofddeksel}
    ${gezichtSVG(emotie)}
    ${accessoire}
  </g>`;
}

/* -------------------------------- Voorwerpen ------------------------------ */
function propSVG(type, x, y, schaal) {
  const inkt = `stroke="${INKT}" stroke-width="2.6" stroke-linejoin="round"`;
  let vorm = '';
  switch (type) {
    case 'ijsje':
      vorm = `
        <polygon points="-12,0 12,0 0,30" fill="#d9a441" ${inkt}/>
        <path d="M -12 0 L 12 0 M -8 10 L 8 10" stroke="#a8761f" stroke-width="1.6"/>
        <circle cx="-6" cy="-7" r="11" fill="#f6c9d4" ${inkt}/>
        <circle cx="7" cy="-9" r="11" fill="#fdf4e0" ${inkt}/>
        <circle cx="0" cy="-19" r="10" fill="#a95f3d" ${inkt}/>`;
      break;
    case 'kaaswiel':
      vorm = `
        <ellipse cx="0" cy="0" rx="20" ry="15" fill="#e0a730" ${inkt}/>
        <path d="M -20 0 v 9 a 20 15 0 0 0 40 0 v -9" fill="#c68a1f" ${inkt}/>
        <circle cx="-7" cy="-3" r="3.4" fill="#c68a1f"/>
        <circle cx="6" cy="2" r="2.8" fill="#c68a1f"/>`;
      break;
    case 'grafiek':
      vorm = `
        <rect x="-23" y="-19" width="46" height="38" rx="4" fill="#fdfbf4" ${inkt}/>
        <polyline points="-16,10 -6,-4 3,4 15,-11" fill="none" stroke="#c8262a" stroke-width="3" stroke-linecap="round"/>
        <line x1="-16" y1="13" x2="16" y2="13" stroke="#b9ae95" stroke-width="2"/>`;
      break;
    case 'vraagteken':
      vorm = `
        <circle cx="0" cy="0" r="20" fill="#fdfbf4" ${inkt}/>
        <text x="0" y="9" text-anchor="middle" font-family="Poppins, sans-serif" font-size="27" font-weight="800" fill="#c8262a">?</text>`;
      break;
    case 'sleutel':
      vorm = `
        <circle cx="-11" cy="0" r="10" fill="none" stroke="${INKT}" stroke-width="6"/>
        <circle cx="-11" cy="0" r="10" fill="none" stroke="#e0a730" stroke-width="3"/>
        <rect x="-3" y="-3.5" width="27" height="7" rx="2" fill="#e0a730" ${inkt}/>
        <rect x="13" y="3" width="5" height="9" fill="#e0a730" ${inkt}/>
        <rect x="21" y="3" width="5" height="9" fill="#e0a730" ${inkt}/>`;
      break;
    case 'map':
      vorm = `
        <rect x="-19" y="-22" width="38" height="44" rx="3" fill="#c8262a" ${inkt}/>
        <rect x="-19" y="-22" width="12" height="44" fill="#9c1c1f" ${inkt}/>
        <rect x="-2" y="-12" width="15" height="4" rx="2" fill="#fdfbf4"/>
        <rect x="-2" y="-2" width="15" height="4" rx="2" fill="#fdfbf4"/>`;
      break;
    default:
      return '';
  }
  return `<g transform="translate(${x},${y}) scale(${schaal || 1})">${vorm}</g>`;
}

/* --------------------------------- Ballonnen ------------------------------ */
function ballonAfmeting(lines) {
  const langste = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.min(Math.max(langste * 7.6 + 34, 132), 320);
  const h = 26 + lines.length * 19;
  return { w, h };
}

/* Eén gesloten pad: bubbel mét staart, zodat er geen naden zichtbaar zijn. */
function spreekballonPad(x, y, w, h, tipX, tipY) {
  const r = 16;
  const basis = Math.max(Math.min(tipX, x + w - 30), x + 30);
  const b1 = basis - 12;
  const b2 = basis + 12;
  return `M ${x + r} ${y}
    H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r}
    V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}
    H ${b2} L ${tipX} ${tipY} L ${b1} ${y + h}
    H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r}
    V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}

function roepballonPad(x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const punten = 18;
  const d = [];
  for (let i = 0; i < punten; i++) {
    const hoek = (i / punten) * Math.PI * 2 - Math.PI / 2;
    const straal = i % 2 === 0 ? 1 : 0.84;
    d.push(`${(cx + Math.cos(hoek) * (w / 2) * straal).toFixed(1)},${(cy + Math.sin(hoek) * (h / 2) * straal).toFixed(1)}`);
  }
  return `M ${d.join(' L ')} Z`;
}

function ballonSVG(tekst, soort, tipX, tipY) {
  const lines = wrapText(tekst || '...', soort === 'roep' ? 20 : 24);
  const { w, h } = ballonAfmeting(lines);
  const x = Math.min(Math.max(tipX - w / 2, 10), 390 - w);
  const y = Math.max(10, Math.min(tipY - h - 32, 300 - h - 150));
  const tekstBlok = svgTextLines(lines, x + w / 2, y + 28, 19, { size: soort === 'roep' ? 14 : 13.5 });

  if (soort === 'denk') {
    /* Wolk: eerst alle vormen mét lijn, daarna nogmaals gevuld zodat
       alleen de buitenrand als één silhouet overblijft. */
    const bollen = [];
    const stappen = 9;
    for (let i = 0; i < stappen; i++) {
      const hoek = (i / stappen) * Math.PI * 2;
      bollen.push({ cx: x + w / 2 + Math.cos(hoek) * (w / 2 - 14), cy: y + h / 2 + Math.sin(hoek) * (h / 2 - 6), r: 19 });
    }
    const romp = `<rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 16}" rx="18"/>`;
    const teken = (attr) => bollen.map(b => `<circle cx="${b.cx.toFixed(1)}" cy="${b.cy.toFixed(1)}" r="${b.r}" ${attr}/>`).join('') + romp.replace('/>', ` ${attr}/>`);
    return `
      <g>
        ${teken(`fill="#fff" stroke="${INKT}" stroke-width="3"`)}
        ${teken('fill="#fff"')}
        <circle cx="${(x + w / 2 + tipX) / 2}" cy="${tipY - 30}" r="8.5" fill="#fff" stroke="${INKT}" stroke-width="3"/>
        <circle cx="${(x + w / 2 + tipX * 3) / 4}" cy="${tipY - 13}" r="5" fill="#fff" stroke="${INKT}" stroke-width="3"/>
        ${tekstBlok}
      </g>`;
  }

  if (soort === 'roep') {
    return `
      <g>
        <path d="${roepballonPad(x, y, w, h + 6)}" fill="#fff" stroke="${INKT}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M ${tipX - 10} ${y + h - 4} L ${tipX} ${tipY} L ${tipX + 12} ${y + h - 6} Z" fill="#fff" stroke="${INKT}" stroke-width="3" stroke-linejoin="round"/>
        ${tekstBlok}
      </g>`;
  }

  return `
    <g>
      <path d="${spreekballonPad(x, y, w, h, tipX, tipY)}" fill="#fff" stroke="${INKT}" stroke-width="3" stroke-linejoin="round"/>
      ${tekstBlok}
    </g>`;
}

function vertellerSVG(tekst) {
  const lines = wrapText(tekst || '...', 42);
  const h = 30 + (lines.length - 1) * 17;
  return `
    <g>
      <rect x="8" y="8" width="384" height="${h}" rx="5" fill="#f6e3b4" stroke="${INKT}" stroke-width="3"/>
      ${svgTextLines(lines, 200, 30, 17, { size: 14, weight: '700' })}
    </g>`;
}

function bijschriftSVG(tekst) {
  const lines = wrapText(tekst, 44);
  const h = 26 + (lines.length - 1) * 16;
  return `
    <g>
      <rect x="8" y="${292 - h}" width="384" height="${h}" rx="5" fill="#f6e3b4" stroke="${INKT}" stroke-width="3"/>
      ${svgTextLines(lines, 200, 310 - h, 16, { size: 13, weight: '700' })}
    </g>`;
}

/* -------------------------------- Vakje bouwen ---------------------------- */
const VLOER = 300;

function castOpstelling(cast) {
  switch (cast) {
    case 'daan':
      return [{ type: 'daan', x: 132, schaal: 1.05, spiegel: false }];
    case 'bert':
      return [{ type: 'bert', x: 268, schaal: 1.05, spiegel: true }];
    case 'beiden':
      return [
        { type: 'daan', x: 104, schaal: 0.88, spiegel: false },
        { type: 'bert', x: 296, schaal: 0.88, spiegel: true }
      ];
    default:
      return [];
  }
}

function renderPanelSVG(panel) {
  const cast = panel.cast || (panel.spreker === 'verteller' || panel.spreker === 'geen' ? 'niemand' : panel.spreker);
  const opstelling = castOpstelling(cast);
  const emotie = panel.emotie || 'neutraal';

  const spreekt = opstelling.find(p => p.type === panel.spreker);
  const figuren = opstelling.map(p => {
    const eigenEmotie = (p.type === panel.spreker || opstelling.length === 1) ? emotie : 'neutraal';
    const schaduw = `<ellipse cx="${p.x}" cy="${VLOER - 4}" rx="${46 * p.schaal}" ry="9" fill="${INKT}" opacity=".14"/>`;
    return schaduw + personageSVG(p.type, { x: p.x, y: VLOER, schaal: p.schaal, emotie: eigenEmotie, spiegel: p.spiegel });
  }).join('');

  /* Het voorwerp komt in de hand van wie praat, anders midden in beeld. */
  let voorwerp = '';
  if (panel.prop && panel.prop !== 'geen') {
    const drager = spreekt || opstelling[0];
    if (drager) {
      const arm = ARMEN[ARMEN[emotie] ? emotie : 'neutraal'];
      const richting = drager.spiegel ? -1 : 1;
      voorwerp = propSVG(panel.prop,
        drager.x + arm.anker[0] * drager.schaal * richting,
        VLOER + arm.anker[1] * drager.schaal,
        0.82 * drager.schaal);
    } else {
      voorwerp = propSVG(panel.prop, 200, 190, 1.1);
    }
  }

  let tekstlaag = '';
  if (panel.spreker === 'verteller') {
    tekstlaag = vertellerSVG(panel.tekst);
  } else if (panel.spreker === 'geen') {
    if (panel.tekst) tekstlaag = bijschriftSVG(panel.tekst);
  } else {
    const doelX = spreekt ? spreekt.x : 200;
    const doelY = spreekt ? VLOER - 138 * spreekt.schaal : 150;
    tekstlaag = ballonSVG(panel.tekst, panel.ballon || 'spreek', doelX, doelY);
  }

  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    ${sceneSVG(panel.scene)}${figuren}${voorwerp}${tekstlaag}
  </svg>`;
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
      <span class="cast-item"><span class="swatch" style="background:${KARAKTERS.daan.kleur}"></span> Data-Daan — het datateam</span>
      <span class="cast-item"><span class="swatch" style="background:${KARAKTERS.bert.kleur}"></span> Boer Bert — de praktijk</span>
    </div>
    <p class="strip-footer-note">Vast stripformaat van CONO Kaasmakers — vul per editie een nieuw onderwerp in via het formulier links.</p>
  `;
}

/* --------------------------------- Toolbar -------------------------------- */
document.getElementById('st-btn-nieuw').addEventListener('click', () => {
  if (!confirm('Dit wist de huidige strip en start een lege versie. Doorgaan?')) return;
  state = defaultState();
  fillStaticFields();
  renderPanelsEditor();
  renderPreview();
  persist();
});

document.getElementById('st-btn-voorbeeld').addEventListener('click', () => {
  if (!confirm('Dit vervangt de huidige strip door een voorbeeld. Doorgaan?')) return;
  state = voorbeeldState();
  fillStaticFields();
  renderPanelsEditor();
  renderPreview();
  persist();
});

document.getElementById('st-btn-export').addEventListener('click', () => {
  const naam = (state.titel || 'cono-strip').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  exporteerJSON(`${naam}.json`, state);
});

document.getElementById('st-input-import').addEventListener('change', (e) => {
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

document.getElementById('st-btn-print').addEventListener('click', () => window.print());

/* ---------------------------------- Init ---------------------------------- */
fillStaticFields();
attachStaticBindings();
renderPanelsEditor();
renderPreview();
