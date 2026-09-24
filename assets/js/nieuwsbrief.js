/* CONO Nieuwsbrief bouwer — state, editor en live preview */

const STORAGE_KEY = 'cono_nieuwsbrief_draft_v1';

/* Een nieuwsbrief bestaat uit vrije blokken. Er zijn geen vaste soorten meer:
   elk blok heeft een kop die je zelf bepaalt en een opmaak die alleen bepaalt
   hóé het eruitziet, niet waar het over mag gaan. */

const KLEUREN = ['rood', 'groen', 'goud', 'blauw'];

/* De beschikbare opmaken, met de naam van het afsluitende regeltje en of er
   een lijst bij hoort. De schrijver kiest deze; je hoeft er niet over na te
   denken. */
const OPMAKEN = {
  tekst:       { naam: 'Tekst',        slotLabel: 'Afsluitende regel',      lijst: false, tekstLabel: 'Tekst' },
  lijst:       { naam: 'Lijst',        slotLabel: 'Afsluitende regel',      lijst: true,  tekstLabel: 'Inleiding (mag leeg)' },
  citaat:      { naam: 'Citaat',       slotLabel: 'Wie zegt het',           lijst: false, tekstLabel: 'Het citaat' },
  cijfers:     { naam: 'Cijfers',      slotLabel: 'Afsluitende regel',      lijst: true,  tekstLabel: 'Inleiding (mag leeg)' },
  woordenboek: { naam: 'Woordenboek',  slotLabel: 'Afsluitende regel',      lijst: true,  tekstLabel: 'De constatering' },
  stappen:     { naam: 'Stappen',      slotLabel: 'Afsluitende regel',      lijst: true,  tekstLabel: 'De prikkelende kop' },
  oproep:      { naam: 'Oproep',       slotLabel: 'Wat het oplevert',       lijst: true,  tekstLabel: 'De oproep' }
};

function opmaakVan(sec) {
  return OPMAKEN[sec.opmaak] ? sec.opmaak : 'tekst';
}

function nieuweSectie(basis) {
  return Object.assign({
    id: uid(),
    kop: 'Kop van dit blok',
    ondertitel: '',
    icoon: '📄',
    kleur: 'groen',
    opmaak: 'tekst',
    tekst: '',
    slot: '',
    items: []
  }, basis || {});
}

function nieuwItem(tekst, bij) {
  return { id: uid(), tekst: tekst || '', bij: bij || '' };
}

/* Edities van vóór de vrije blokken bevatten nog de oude vaste rubrieken.
   Die worden bij het inladen omgezet, zodat niemand zijn werk kwijtraakt. */
const OUDE_RUBRIEKEN = {
  kopvandemaand:   { kop: 'Kop van de maand', icoon: '📰', kleur: 'rood', opmaak: 'tekst',
                     tekst: ['uitleg'], slot: 'brug', chip: 'term' },
  iam:             { kop: 'Veilig inloggen', icoon: '🔑', kleur: 'groen', opmaak: 'tekst',
                     koptekst: 'titel', tekst: ['uitleg'], slot: 'tip' },
  stamdata:        { kop: 'Uit ons systeem', icoon: '🔦', kleur: 'goud', opmaak: 'woordenboek',
                     term: 'term', definitie: 'definitie', tekst: ['constatering'] },
  aianalytics:     { kop: 'AI in het echte leven', icoon: '🤖', kleur: 'blauw', opmaak: 'tekst',
                     koptekst: 'titel', tekst: ['bron', 'uitleg'] },
  successen:       { kop: 'Waar we trots op zijn', icoon: '🏆', kleur: 'groen', opmaak: 'lijst' },
  jargonjudo:      { kop: 'JargonJudo', icoon: '🥋', kleur: 'rood', opmaak: 'stappen',
                     term: 'term', tekst: ['prikkel'], stappen: ['observatie', 'ontknoping'], slot: 'striplink' },
  actietips:       { kop: 'Wat kun jij doen?', icoon: '✅', kleur: 'groen', opmaak: 'tekst',
                     tekst: ['tekst'], slot: 'actie' },
  vraagvandemaand: { kop: 'Vraag van de maand', icoon: '❓', kleur: 'goud', opmaak: 'oproep',
                     tekst: ['vraag'], stappen: ['waar'], slot: 'beloning' },
  wistjedat:       { kop: 'Wist je dat...', icoon: '💡', kleur: 'goud', opmaak: 'tekst',
                     tekst: ['bron', 'citaat', 'uitleg'] },
  onderwerp:       { kop: 'Onderwerp', icoon: '📘', kleur: 'groen', opmaak: 'tekst',
                     koptekst: 'titel', tekst: ['uitleg', 'waarom'], slot: 'actie' },
  cijfer:          { kop: 'Cijfers', icoon: '📊', kleur: 'groen', opmaak: 'cijfers' },
  quote:           { kop: 'Aan het woord', icoon: '💬', kleur: 'groen', opmaak: 'citaat',
                     tekst: ['quote'], slot: 'naam' },
  tekst:           { kop: 'Tekstblok', icoon: '📝', kleur: 'groen', opmaak: 'tekst',
                     koptekst: 'titel', tekst: ['tekst'] }
};

function migreerSectie(oud) {
  if (!oud || !oud.type) return oud && oud.opmaak ? oud : null;
  const regel = OUDE_RUBRIEKEN[oud.type];
  if (!regel) return null;

  const sec = nieuweSectie({
    kop: oud.label || (regel.koptekst && oud[regel.koptekst]) || regel.kop,
    ondertitel: oud.subtitel || '',
    icoon: oud.icoon || oud.emoji || regel.icoon,
    kleur: regel.kleur,
    opmaak: regel.opmaak
  });

  const delen = (regel.tekst || []).map(v => oud[v]).filter(Boolean);
  sec.tekst = delen.join('\n\n');
  if (regel.slot && oud[regel.slot]) sec.slot = oud[regel.slot];
  if (regel.chip && oud[regel.chip]) sec.ondertitel = sec.ondertitel || oud[regel.chip];

  if (regel.opmaak === 'woordenboek') {
    sec.items = [nieuwItem(oud[regel.term] || '', oud[regel.definitie] || '')];
  } else if (regel.opmaak === 'stappen') {
    sec.items = (regel.stappen || []).map(v => nieuwItem(oud[v] || '')).filter(i => i.tekst);
    if (oud[regel.term]) sec.ondertitel = sec.ondertitel || oud[regel.term];
  } else if (regel.opmaak === 'oproep') {
    sec.items = (regel.stappen || []).map(v => nieuwItem(oud[v] || '')).filter(i => i.tekst);
  } else if (regel.opmaak === 'lijst') {
    sec.items = (oud.items || []).map(it => nieuwItem(it.tekst, it.toelichting));
  } else if (regel.opmaak === 'cijfers') {
    sec.items = (oud.tiles || []).map(t => nieuwItem(t.getal, t.label + (t.toelichting ? ' — ' + t.toelichting : '')));
  }
  return sec;
}

function migreerState(st) {
  if (!st || !Array.isArray(st.sections)) return st;
  st.sections = st.sections.map(sec => (sec && sec.type) ? migreerSectie(sec) : sec).filter(Boolean);
  return st;
}

function defaultState() {
  return {
    meta: {
      titel: 'CONO Databericht',
      ondertitel: 'Samen slim met data — zonder moeilijke woorden',
      editie: 'Editie 1',
      datum: todayNL()
    },
    voorwoord: {
      tekst: 'Welkom bij deze editie! Hierin lees je op een luchtige manier waar we mee bezig zijn rond data bij CONO, zonder ingewikkeld jargon.',
      auteur: 'Team Data & Informatie'
    },
    sections: [],
    strip: { tonen: true, teaser: '' },
    compact: 1,
    footer: {
      contact: 'Data-team — data@cono.nl',
      volgende: 'De volgende editie verschijnt over een maand.'
    }
  };
}

/* Het voorbeeld laat zien wat eruit kan komen; alle blokken zijn vrij. */
function voorbeeldState() {
  const s = defaultState();
  s.meta = {
    titel: 'CONO Databericht',
    ondertitel: 'Data en AI, gewoon uitgelegd',
    editie: 'Editie 1 — probeersel',
    datum: todayNL()
  };
  s.voorwoord = {
    tekst: 'Data en AI klinken als een taal die je eerst moet leren voordat je mee kunt praten. Dat draaien we hier om: elke editie een paar onderwerpen in gewone taal, met voorbeelden die je van buiten je werk herkent. Heb je zelf een vraag? Onderaan lees je waar die heen kan.',
    auteur: 'Team Data & Informatie'
  };
  s.sections = [
    nieuweSectie({
      kop: 'Kop van de maand', ondertitel: 'wat je deze maand wilt weten',
      icoon: '📰', kleur: 'rood', opmaak: 'tekst',
      tekst: 'Je praat over een nieuwe fiets en een uur later staat je tijdlijn vol fietsreclame. Toeval? Je telefoon hoeft daar niet voor mee te luisteren: zodra iets je aandacht heeft, valt het je overal op. Bovendien hebben ze allang genoeg gegevens — wat je zoekt, waar je bent, wat je koopt — om die reclame gericht te tonen.',
      slot: 'En bij ons? Hebben wij de gegevens die we nodig hebben om onze eigen vragen te beantwoorden?'
    }),
    nieuweSectie({
      kop: 'Uit ons systeem', ondertitel: 'wat leggen we eigenlijk vast?',
      icoon: '🔦', kleur: 'goud', opmaak: 'woordenboek',
      items: [nieuwItem('Geitenkaas', 'Kaas gemaakt van geitenmelk.')],
      tekst: 'Klinkt logisch — maar deze omschrijving staat nergens vastgelegd. Iedereen wéét wat het is, en precies daarom schrijft niemand het op. Dat gaat goed tot iemand nieuw begint.'
    }),
    nieuweSectie({
      kop: 'Waar we trots op zijn', ondertitel: 'deze maand',
      icoon: '🏆', kleur: 'groen', opmaak: 'lijst',
      items: [
        nieuwItem('Lactaat herkennen met AI'),
        nieuwItem('Bestuursverslag deels met AI geschreven'),
        nieuwItem('Hoeveel droogt een kaas nu werkelijk in?')
      ]
    }),
    nieuweSectie({
      kop: 'JargonJudo', ondertitel: 'moeilijk woord in gewone taal',
      icoon: '🥋', kleur: 'rood', opmaak: 'stappen',
      tekst: 'Verbod op ijs vanwege toename aantal verdrinkingen',
      items: [
        nieuwItem('Er is een duidelijk verband: meer ijsverkoop, meer verdrinkingen. Dat staat gewoon in de cijfers.'),
        nieuwItem('Maar het ijs duwt niemand het water in. Als het warm is wordt er véél gezwommen én veel ijs gegeten.')
      ],
      slot: 'Zie de strip onderaan deze pagina.'
    }),
    nieuweSectie({
      kop: 'Wat kun jij doen?', icoon: '✅', kleur: 'groen', opmaak: 'tekst',
      tekst: 'Heb je recent gekeken tot welke rapporten jij toegang hebt, en gebruik je ze allemaal? In de meeste rapporten kun je filteren of inzoomen, zodat de cijfers precies over jouw afdeling gaan.',
      slot: 'Neem deze maand vijf minuten om je eigen rapportenlijst door te lopen.'
    }),
    nieuweSectie({
      kop: 'Vraag van de maand', icoon: '❓', kleur: 'goud', opmaak: 'oproep',
      tekst: 'Heb je een vraag over data, rapporten of AI? Stel hem!',
      items: [nieuwItem('Mail je vraag naar het data-team.')],
      slot: 'De beste vraag krijgt gevulde koeken voor de hele afdeling.'
    })
  ];
  s.strip = { tonen: true, teaser: 'JargonJudo: correlatie is nog geen oorzaak.' };
  s.footer = { contact: 'Data-team — data@cono.nl', volgende: 'De volgende editie verschijnt over een maand.' };
  return s;
}

let state = migreerState(loadLocal(STORAGE_KEY)) || voorbeeldState();

/* ---------------------------- DOM references ---------------------------- */
const els = {
  titel: document.getElementById('f-titel'),
  ondertitel: document.getElementById('f-ondertitel'),
  editie: document.getElementById('f-editie'),
  datum: document.getElementById('f-datum'),
  voorwoordTekst: document.getElementById('f-voorwoord-tekst'),
  voorwoordAuteur: document.getElementById('f-voorwoord-auteur'),
  stripTonen: document.getElementById('f-strip-tonen'),
  stripTeaser: document.getElementById('f-strip-teaser'),
  compact: document.getElementById('f-compact'),
  contact: document.getElementById('f-contact'),
  volgende: document.getElementById('f-volgende'),
  sectionsList: document.getElementById('sections-list'),
  newSectionType: document.getElementById('new-section-type'),
  previewSheet: document.getElementById('preview-sheet'),
  status: document.getElementById('status-text')
};

/* ------------------------------ Persistentie ----------------------------- */
const persist = debounce(() => {
  saveLocal(STORAGE_KEY, state);
  showStatus(els.status, 'Opgeslagen ✓', 1500);
}, 300);

function herteken() {
  persist();
  renderSectionsEditor();
  renderPreview();
}

/* --------------------------- Formulier -> state --------------------------- */
function fillStaticFields() {
  els.titel.value = state.meta.titel;
  els.ondertitel.value = state.meta.ondertitel;
  els.editie.value = state.meta.editie;
  els.datum.value = state.meta.datum;
  els.voorwoordTekst.value = state.voorwoord.tekst;
  els.voorwoordAuteur.value = state.voorwoord.auteur;
  els.stripTonen.checked = state.strip.tonen !== false;
  els.stripTeaser.value = state.strip.teaser;
  els.compact.value = state.compact || 1;
  els.contact.value = state.footer.contact;
  els.volgende.value = state.footer.volgende;
}

function bindStatic(el, setter) {
  el.addEventListener('input', () => {
    setter(el.value);
    persist();
    renderPreview();
  });
}

function attachStaticBindings() {
  bindStatic(els.titel, v => state.meta.titel = v);
  bindStatic(els.ondertitel, v => state.meta.ondertitel = v);
  bindStatic(els.editie, v => state.meta.editie = v);
  bindStatic(els.datum, v => state.meta.datum = v);
  bindStatic(els.voorwoordTekst, v => state.voorwoord.tekst = v);
  bindStatic(els.voorwoordAuteur, v => state.voorwoord.auteur = v);
  bindStatic(els.stripTeaser, v => state.strip.teaser = v);
  els.stripTonen.addEventListener('change', () => {
    state.strip.tonen = els.stripTonen.checked;
    persist(); renderPreview();
  });
  els.compact.addEventListener('input', () => {
    state.compact = parseFloat(els.compact.value);
    persist(); pasCompactheidToe(); meetPaginas();
  });
  bindStatic(els.contact, v => state.footer.contact = v);
  bindStatic(els.volgende, v => state.footer.volgende = v);
}

/* ------------------------------ Secties editor ---------------------------- */
function veld(label, field, value, rows, hint) {
  const input = rows
    ? `<textarea data-field="${field}" rows="${rows}">${escapeHtml(value || '')}</textarea>`
    : `<input data-field="${field}" value="${escapeHtml(value || '')}">`;
  return `<div class="field"><label>${label}</label>${input}${hint ? `<small class="hint">${hint}</small>` : ''}</div>`;
}

/* Uiterlijk van een blok: kleurstipjes en opmaakknoppen. Eén klik, geen
   uitklaplijst — en je hoeft er niets mee te doen als het al goed staat. */
function uiterlijkRij(sec) {
  const kleuren = KLEUREN.map(k =>
    `<button type="button" class="kleurstip kleurstip--${k}${sec.kleur === k ? ' is-aan' : ''}"
       data-actie="kleur" data-waarde="${k}" data-section="${sec.id}" title="${k}"></button>`).join('');
  const opmaken = Object.entries(OPMAKEN).map(([sleutel, o]) =>
    `<button type="button" class="opmaakknop${opmaakVan(sec) === sleutel ? ' is-aan' : ''}"
       data-actie="opmaak" data-waarde="${sleutel}" data-section="${sec.id}">${o.naam}</button>`).join('');
  return `<div class="uiterlijk">
      <input class="icoonveld" data-field="icoon" value="${escapeHtml(sec.icoon || '')}" maxlength="3" title="Icoon">
      <div class="kleurstippen">${kleuren}</div>
      <div class="opmaakknoppen">${opmaken}</div>
    </div>`;
}

function itemVelden(sec, item, i) {
  const vorm = opmaakVan(sec);
  const labels = {
    cijfers: ['Getal', 'Waar het over gaat'],
    woordenboek: ['Term', 'Wat het betekent'],
    stappen: ['Stap ' + (i + 1), ''],
    oproep: ['Regel', ''],
    lijst: ['Regel', 'Toelichting (mag leeg)']
  }[vorm] || ['Regel', 'Toelichting (mag leeg)'];

  return `<div class="item-regel">
      <input data-item-field="tekst" data-item="${item.id}" value="${escapeHtml(item.tekst)}" placeholder="${labels[0]}">
      ${labels[1] ? `<input data-item-field="bij" data-item="${item.id}" value="${escapeHtml(item.bij)}" placeholder="${labels[1]}">` : ''}
      <button type="button" class="btn-danger" data-actie="item-weg" data-section="${sec.id}" data-item="${item.id}">✕</button>
    </div>`;
}

function sectionFieldsHTML(sec) {
  const vorm = opmaakVan(sec);
  const o = OPMAKEN[vorm];
  const lijst = o.lijst
    ? `<div class="field"><label>Regels</label>
        ${(sec.items || []).map((it, i) => itemVelden(sec, it, i)).join('')}
        <button type="button" class="btn btn-icon" data-actie="item-erbij" data-section="${sec.id}">+ Regel</button>
      </div>`
    : '';

  return uiterlijkRij(sec)
    + `<div class="veld-paar">
         ${veld('Kop', 'kop', sec.kop)}
         ${veld('Ondertitel', 'ondertitel', sec.ondertitel)}
       </div>`
    + veld(o.tekstLabel, 'tekst', sec.tekst, 4)
    + lijst
    + veld(o.slotLabel, 'slot', sec.slot);
}

function renderSectionsEditor() {
  if (state.sections.length === 0) {
    els.sectionsList.innerHTML = `<p class="empty-state">Nog geen blokken. Laat de nieuwsbrief hierboven schrijven, of voeg er zelf een toe.</p>`;
    return;
  }
  els.sectionsList.innerHTML = state.sections.map((sec, i) => `
    <div class="section-card" data-section-row="${sec.id}">
      <div class="section-card-head">
        <span class="section-type-label">${escapeHtml((sec.icoon || '') + ' ' + (sec.kop || 'Blok'))}</span>
        <div class="section-actions">
          <button type="button" class="btn-icon" data-actie="omhoog" data-section="${sec.id}" ${i === 0 ? 'disabled' : ''} title="Naar boven">↑</button>
          <button type="button" class="btn-icon" data-actie="omlaag" data-section="${sec.id}" ${i === state.sections.length - 1 ? 'disabled' : ''} title="Naar beneden">↓</button>
          <button type="button" class="btn-danger" data-actie="blok-weg" data-section="${sec.id}" title="Verwijderen">✕</button>
        </div>
      </div>
      ${sectionFieldsHTML(sec)}
    </div>
  `).join('');
}

function findSection(id) { return state.sections.find(s => s.id === id); }

els.sectionsList.addEventListener('input', (e) => {
  const rij = e.target.closest('[data-section-row]');
  if (!rij) return;
  const sec = findSection(rij.dataset.sectionRow);
  if (!sec) return;

  if (e.target.dataset.field) {
    sec[e.target.dataset.field] = e.target.value;
  } else if (e.target.dataset.itemField) {
    const item = (sec.items || []).find(it => it.id === e.target.dataset.item);
    if (item) item[e.target.dataset.itemField] = e.target.value;
  } else {
    return;
  }
  persist();
  renderPreview();
});

els.sectionsList.addEventListener('click', (e) => {
  const knop = e.target.closest('[data-actie]');
  if (!knop) return;
  const sec = findSection(knop.dataset.section);
  if (!sec) return;
  const i = state.sections.indexOf(sec);
  const actie = knop.dataset.actie;

  if (actie === 'omhoog' && i > 0) {
    [state.sections[i - 1], state.sections[i]] = [state.sections[i], state.sections[i - 1]];
  } else if (actie === 'omlaag' && i < state.sections.length - 1) {
    [state.sections[i + 1], state.sections[i]] = [state.sections[i], state.sections[i + 1]];
  } else if (actie === 'blok-weg') {
    if (!confirm('Dit blok verwijderen?')) return;
    state.sections.splice(i, 1);
  } else if (actie === 'kleur') {
    sec.kleur = knop.dataset.waarde;
  } else if (actie === 'opmaak') {
    sec.opmaak = knop.dataset.waarde;
    if (OPMAKEN[sec.opmaak].lijst && !(sec.items || []).length) sec.items = [nieuwItem()];
  } else if (actie === 'item-erbij') {
    sec.items = (sec.items || []).concat([nieuwItem()]);
  } else if (actie === 'item-weg') {
    sec.items = (sec.items || []).filter(it => it.id !== knop.dataset.item);
  } else {
    return;
  }
  herteken();
});

document.getElementById('btn-add-section').addEventListener('click', () => {
  state.sections.push(nieuweSectie({ kop: 'Nieuw blok', tekst: '' }));
  herteken();
});

/* --------------------------------- Preview -------------------------------- */
function blokWrapper(sec, binnenkant, extraClass) {
  const kleur = KLEUREN.indexOf(sec.kleur) === -1 ? 'groen' : sec.kleur;
  return `
    <div class="nl-section">
      <div class="rubriek rubriek--${kleur}${extraClass ? ' ' + extraClass : ''}">
        ${sec.kop ? `<div class="rubriek-label">
          ${sec.icoon ? `<span>${escapeHtml(sec.icoon)}</span>` : ''} ${escapeHtml(sec.kop)}
          ${sec.ondertitel ? `<span class="rubriek-subtitel">${escapeHtml(sec.ondertitel)}</span>` : ''}
        </div>` : ''}
        <div class="rubriek-body">${binnenkant}</div>
      </div>
    </div>`;
}

function sectionPreviewHTML(sec) {
  const items = (sec.items || []).filter(it => (it.tekst || '').trim() || (it.bij || '').trim());
  const slot = (sec.slot || '').trim();

  switch (opmaakVan(sec)) {
    case 'lijst':
      return blokWrapper(sec, `
        ${textToParagraphs(sec.tekst)}
        <ul class="successen-lijst">
          ${items.map(it => `<li><strong>${escapeHtml(it.tekst)}</strong>
            ${it.bij ? `<span class="toelichting">${escapeHtml(it.bij)}</span>` : ''}</li>`).join('')}
        </ul>
        ${slot ? `<div class="rubriek-brug">👉 ${escapeHtml(slot)}</div>` : ''}`);

    case 'citaat':
      return blokWrapper(sec, `
        <div class="card-quote">“${escapeHtml(sec.tekst)}”
          ${slot ? `<div class="naam">${escapeHtml(slot)}</div>` : ''}
        </div>`);

    case 'cijfers':
      return blokWrapper(sec, `
        ${textToParagraphs(sec.tekst)}
        <div class="cijfer-grid">
          ${items.map(it => `<div class="cijfer-tile">
            <div class="getal">${escapeHtml(it.tekst)}</div>
            ${it.bij ? `<div class="label">${escapeHtml(it.bij)}</div>` : ''}
          </div>`).join('')}
        </div>
        ${slot ? `<div class="rubriek-brug">👉 ${escapeHtml(slot)}</div>` : ''}`);

    case 'woordenboek': {
      const eerste = items[0] || { tekst: '', bij: '' };
      return blokWrapper(sec, `
        <div class="woordenboek">
          <span class="woord">${escapeHtml(eerste.tekst)}</span>
          <span class="definitie">${escapeHtml(eerste.bij)}</span>
        </div>
        ${textToParagraphs(sec.tekst)}
        ${slot ? `<div class="rubriek-brug">👉 ${escapeHtml(slot)}</div>` : ''}`);
    }

    case 'stappen':
      return blokWrapper(sec, `
        ${sec.tekst ? `<div class="jargon-prikkel">“${escapeHtml(sec.tekst)}”</div>` : ''}
        ${items.map((it, i) => `<div class="jargon-stap${i === items.length - 1 && items.length > 1 ? ' jargon-stap--pointe' : ''}">
          <span class="stap-nr">${i + 1}</span><span>${escapeHtml(it.tekst)}</span></div>`).join('')}
        ${slot ? `<div class="jargon-strip">📖 ${escapeHtml(slot)}</div>` : ''}`);

    case 'oproep':
      return blokWrapper(sec, `
        <p class="vraag-tekst">${escapeHtml(sec.tekst)}</p>
        ${items.map(it => `<p>${escapeHtml(it.tekst)}</p>`).join('')}
        ${slot ? `<div class="beloning">🍪 ${escapeHtml(slot)}</div>` : ''}`, 'vraag-coupon');

    default:
      return blokWrapper(sec, `
        ${textToParagraphs(sec.tekst)}
        ${slot ? `<div class="rubriek-brug">👉 ${escapeHtml(slot)}</div>` : ''}`);
  }
}

let stripVoorVel = null;

function haalStripOp() {
  stripVoorVel = (typeof leesOpgeslagenStrip === 'function') ? leesOpgeslagenStrip() : null;
}

function renderPreview() {
  const m = state.meta, v = state.voorwoord, f = state.footer, st = state.strip;
  els.previewSheet.innerHTML = `
    <div class="nl-header">
      <span class="eyebrow">${escapeHtml(m.editie || 'CONO Nieuwsbrief')}</span>
      <h1>${escapeHtml(m.titel || 'CONO Databericht')}</h1>
      <div class="subtitle">${escapeHtml(m.ondertitel)}</div>
      <div class="meta-row"><span>📅 ${escapeHtml(m.datum)}</span></div>
    </div>
    <div class="nl-body">
      ${v.tekst ? `
      <div class="nl-intro">
        ${textToParagraphs(v.tekst)}
        ${v.auteur ? `<div class="auteur">— ${escapeHtml(v.auteur)}</div>` : ''}
      </div>` : ''}

      ${state.sections.length ? state.sections.map(sectionPreviewHTML).join('') : `<p class="empty-state">Voeg links secties toe om de nieuwsbrief te vullen.</p>`}

      ${st.tonen === false ? '' : `
      <div class="nl-strip">
        ${stripVoorVel ? tekenStripHTML(stripVoorVel) : '<p class="nl-strip-leeg">Nog geen strip gemaakt. Ga naar de Strip maker en kom daarna terug.</p>'}
        ${st.teaser ? `<p class="strip-teaser">${escapeHtml(st.teaser)}</p>` : ''}
      </div>`}
    </div>
    <div class="nl-footer">
      <span>✉️ ${escapeHtml(f.contact)}</span>
      <span>${escapeHtml(f.volgende)}</span>
    </div>
  `;
  meetPaginas();
}

/* ------------------------------ Eén pagina -------------------------------- */
/* A4 met 8 mm marge rondom: de verhouding van het bedrukte vlak. */
const PAGINA_VERHOUDING = 281 / 194;

/* Bij het afdrukken is één CSS-pixel precies 1/96 inch, dus de lettergrootte
   in punten volgt rechtstreeks uit de ingestelde compactheid. */
function puntGrootte(compact) {
  return 13 * (compact || 1) * 0.75;
}

function pasCompactheidToe() {
  els.previewSheet.style.setProperty('--compact', state.compact || 1);
  const uitvoer = document.getElementById('compact-waarde');
  if (uitvoer) {
    uitvoer.textContent = Math.round((state.compact || 1) * 100) + '% · ' +
      puntGrootte(state.compact).toFixed(1).replace('.', ',') + ' pt';
  }
}

function meetPaginas() {
  const meter = document.getElementById('pagina-meter');
  if (!meter) return;
  const vak = els.previewSheet.getBoundingClientRect();
  if (!vak.width) return;
  const paginaHoogte = vak.width * PAGINA_VERHOUDING;
  const paginas = vak.height / paginaHoogte;
  const pt = puntGrootte(state.compact);
  const ptTekst = pt.toFixed(1).replace('.', ',') + ' pt';

  if (paginas > 1.005) {
    meter.textContent = `${paginas.toFixed(2).replace('.', ',')} pagina bij ${ptTekst}. Kort in, laat een rubriek weg of maak het compacter.`;
    meter.className = 'pagina-meter is-fout';
  } else if (pt < 8) {
    meter.textContent = `Past op één pagina, maar de tekst wordt ${ptTekst} — te klein om prettig te lezen. Laat een paar rubrieken weg.`;
    meter.className = 'pagina-meter is-waarschuwing';
  } else {
    meter.textContent = `Past op één pagina ✓ — tekst ${ptTekst}`;
    meter.className = 'pagina-meter is-goed';
  }
  return paginas;
}

/* Zoekt in een paar stappen de grootste letter waarbij alles nog op één
   pagina past. Meten is nodig omdat tekst in kolommen niet recht evenredig
   meekrimpt. */
function maakPassend() {
  let schaal = 1;
  for (let poging = 0; poging < 8; poging++) {
    state.compact = schaal;
    pasCompactheidToe();
    const vak = els.previewSheet.getBoundingClientRect();
    const paginas = vak.height / (vak.width * PAGINA_VERHOUDING);
    if (paginas <= 1) break;
    schaal = Math.max(0.5, schaal * Math.sqrt(1 / paginas) - 0.004);
    if (schaal <= 0.5) { state.compact = 0.5; pasCompactheidToe(); break; }
  }
  els.compact.value = state.compact;
  persist();
  const paginas = meetPaginas();
  const meter = document.getElementById('pagina-meter');
  if (paginas > 1.005 && meter) {
    meter.textContent = 'Past nog steeds niet, zelfs op de kleinste letter. Er moeten rubrieken af.';
    meter.className = 'pagina-meter is-fout';
  }
}

/* --------------------------------- Toolbar -------------------------------- */
document.getElementById('btn-nieuw').addEventListener('click', () => {
  if (!confirm('Dit wist het huidige formulier en start een lege editie. Doorgaan?')) return;
  state = defaultState();
  fillStaticFields();
  herteken();
});

document.getElementById('btn-voorbeeld').addEventListener('click', () => {
  if (!confirm('Dit vervangt de huidige inhoud door de voorbeeldeditie. Doorgaan?')) return;
  state = voorbeeldState();
  fillStaticFields();
  herteken();
});

document.getElementById('btn-export').addEventListener('click', () => {
  const naam = (state.meta.editie || 'cono-nieuwsbrief').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  exporteerJSON(`${naam}.json`, state);
});

document.getElementById('input-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readJSONFile(file, (data) => {
    state = Object.assign(defaultState(), data);
    fillStaticFields();
    pasCompactheidToe();
    herteken();
  }, () => alert('Dit bestand kon niet worden gelezen. Is het een geldig JSON-exportbestand?'));
  e.target.value = '';
});

document.getElementById('btn-print').addEventListener('click', () => window.print());

document.getElementById('btn-strip-ververs').addEventListener('click', () => {
  haalStripOp();
  renderPreview();
});

document.getElementById('btn-passend').addEventListener('click', maakPassend);

/* De strip kan in het andere tabblad gewijzigd zijn. */
window.__conoVerversNieuwsbrief = () => { haalStripOp(); renderPreview(); };

/* ========================================================================
   REDACTIE — de nieuwsbrief laten schrijven
   ===================================================================== */

function redactieMelding(tekst, soort) {
  const el = document.getElementById('r-melding');
  if (!el) return;
  el.textContent = tekst || '';
  el.className = 'regie-melding' + (soort ? ' is-' + soort : '');
}

/* LLM's zetten hun antwoord vaak tussen ```-hekjes of met een zin ervoor. */
function pluisRedactieJSON(tekst) {
  const schoon = String(tekst || '').replace(/```[a-z]*\s*/gi, '').trim();
  const van = schoon.indexOf('{');
  const tot = schoon.lastIndexOf('}');
  if (van === -1 || tot <= van) throw new Error('Geen JSON gevonden in dit antwoord.');
  return JSON.parse(schoon.slice(van, tot + 1));
}

function redactieInvoer() {
  return {
    waarover: document.getElementById('r-waarover').value,
    maand: document.getElementById('r-maand').value,
    moeilijkWoord: document.getElementById('r-woord').value,
    successen: document.getElementById('r-successen').value
  };
}

function vulUitRedactie(antwoord) {
  const uitkomst = sectiesUitRedactie(antwoord);
  /* Zit er een strip bij, dan tekent de strip maker die meteen. */
  if (antwoord && antwoord.strip && window.__conoBouwStrip) {
    try {
      window.__conoBouwStrip(antwoord.strip);
      haalStripOp();
    } catch (e) { /* strip mislukt, de tekst blijft gewoon staan */ }
  }
  if (uitkomst.titel) state.meta.titel = uitkomst.titel;
  if (uitkomst.ondertitel) state.meta.ondertitel = uitkomst.ondertitel;
  if (uitkomst.editie) state.meta.editie = uitkomst.editie;
  if (uitkomst.voorwoord) state.voorwoord.tekst = uitkomst.voorwoord;
  state.sections = uitkomst.secties;
  fillStaticFields();
  herteken();
  /* Meteen passend maken, zodat er niets meer bij te stellen valt. */
  maakPassend();
  return uitkomst.secties.length;
}

document.getElementById('r-btn-prompt').addEventListener('click', () => {
  const invoer = redactieInvoer();
  if (!invoer.waarover.trim()) { redactieMelding('Schrijf eerst kort waar het deze maand over gaat.', 'fout'); return; }
  const prompt = redactiePrompt(invoer);
  const klaar = () => {
    redactieMelding('Prompt gekopieerd. Plak hem in ChatGPT, Claude of Copilot en zet het antwoord hieronder terug.', 'goed');
    document.getElementById('r-plak-blok').open = true;
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(klaar, () => {
      document.getElementById('r-script').value = prompt;
      document.getElementById('r-plak-blok').open = true;
      redactieMelding('Kopiëren mocht niet. De prompt staat nu in het plakvak — knip hem daaruit.', 'fout');
    });
  } else {
    document.getElementById('r-script').value = prompt;
    document.getElementById('r-plak-blok').open = true;
    redactieMelding('Kopiëren kan hier niet. De prompt staat in het plakvak.', 'fout');
  }
});

document.getElementById('r-btn-vul').addEventListener('click', () => {
  const ruw = document.getElementById('r-script').value;
  if (!ruw.trim()) { redactieMelding('Plak eerst het antwoord van de LLM.', 'fout'); return; }
  try {
    const aantal = vulUitRedactie(pluisRedactieJSON(ruw));
    redactieMelding(`${aantal} blokken klaar, strip erbij. Pas gerust nog teksten en koppen aan.`, 'goed');
  } catch (fout) {
    redactieMelding('Dit lukte niet: ' + fout.message, 'fout');
  }
});

/* In de gedeelde online versie kan de pagina Claude zelf laten schrijven. */
const redactieKnop = document.getElementById('r-btn-claude');
if (redactieKnop && window.claude && typeof window.claude.use === 'function') {
  window.claude.use('sample').then((sample) => {
    if (!sample) return;
    redactieKnop.hidden = false;
    /* Claude kan het hier zelf; dan is kopiëren de tweede keus. */
    document.getElementById('r-btn-prompt').className = 'btn btn-secondary';
    redactieKnop.addEventListener('click', () => {
      const invoer = redactieInvoer();
      if (!invoer.waarover.trim()) { redactieMelding('Schrijf eerst kort waar het deze maand over gaat.', 'fout'); return; }
          redactieKnop.disabled = true;
      redactieMelding('Claude schrijft de nieuwsbrief...');
      sample.json(redactiePrompt(invoer), { modelTier: 'default' }).then((antwoord) => {
        try {
          const aantal = vulUitRedactie(antwoord);
          redactieMelding(`${aantal} blokken geschreven. Niet tevreden? Klik nog eens — elke keer is anders.`, 'goed');
        } catch (fout) {
          redactieMelding('Het antwoord klopte niet: ' + fout.message, 'fout');
        }
      }, (fout) => {
        redactieMelding(fout && fout.code === 'declined' ? 'Geannuleerd.' : 'Het lukte niet om de tekst op te halen.', 'fout');
      }).then(() => { redactieKnop.disabled = false; });
    });
  });
}

/* ---------------------------------- Init ---------------------------------- */
haalStripOp();
pasCompactheidToe();
fillStaticFields();
attachStaticBindings();
renderSectionsEditor();
renderPreview();
