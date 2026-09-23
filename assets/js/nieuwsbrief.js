/* CONO Nieuwsbrief bouwer — state, editor en live preview */

const STORAGE_KEY = 'cono_nieuwsbrief_draft_v1';

/* De vaste rubrieken die elke editie terugkeren. Per rubriek: het label dat
   boven het blok komt, een icoon, de accentkleur en een eventuele ondertitel. */
const RUBRIEK_META = {
  kopvandemaand:   { label: 'Kop van de maand',     icoon: '📰', kleur: 'rood',  subtitel: 'wat je deze maand echt wilt weten' },
  iam:             { label: 'Veilig inloggen',      icoon: '🔑', kleur: 'groen', subtitel: 'wachtwoorden en toegang' },
  stamdata:        { label: 'Uit ons systeem',      icoon: '🔦', kleur: 'goud',  subtitel: 'wat leggen we eigenlijk vast?' },
  aianalytics:     { label: 'AI in het echte leven', icoon: '🤖', kleur: 'blauw', subtitel: 'wat er buiten CONO gebeurt' },
  successen:       { label: 'Waar we trots op zijn', icoon: '🏆', kleur: 'groen', subtitel: 'waar we zelf mee bezig zijn' },
  jargonjudo:      { label: 'JargonJudo',           icoon: '🥋', kleur: 'rood',  subtitel: 'moeilijk woord in gewone taal' },
  actietips:       { label: 'Wat kun jij doen?',    icoon: '✅', kleur: 'groen', subtitel: '' },
  vraagvandemaand: { label: 'Vraag van de maand',   icoon: '❓', kleur: 'goud',  subtitel: '' }
};

/* De kop van een rubriek mag per editie worden veranderd; staat er niets,
   dan geldt de standaardnaam hierboven. */
function rubriekKop(sec) {
  const meta = RUBRIEK_META[sec.type] || {};
  return {
    label: (sec.label !== undefined && sec.label !== null) ? sec.label : (meta.label || ''),
    subtitel: (sec.subtitel !== undefined && sec.subtitel !== null) ? sec.subtitel : (meta.subtitel || ''),
    icoon: meta.icoon || '📄',
    kleur: meta.kleur || 'groen'
  };
}

const STANDAARD_VOLGORDE = ['kopvandemaand', 'iam', 'stamdata', 'aianalytics', 'successen', 'jargonjudo', 'actietips', 'vraagvandemaand'];

const VRIJE_BLOK_LABELS = {
  wistjedat: '💡 Wist-je-dat',
  onderwerp: '📘 Onderwerp uitgelegd',
  cijfer: '📊 Cijfers & weetjes',
  quote: '💬 Quote van een collega',
  tekst: '📝 Tekstblok'
};

function sectionLabel(sec) {
  if (RUBRIEK_META[sec.type]) {
    const kop = rubriekKop(sec);
    return `${kop.icoon} ${kop.label || RUBRIEK_META[sec.type].label}`;
  }
  return VRIJE_BLOK_LABELS[sec.type] || sec.type;
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

function nieuwSectie(type) {
  const id = uid();
  switch (type) {
    /* --- Vaste rubrieken --- */
    case 'kopvandemaand':
      return { id, type, kop: 'De prikkelende vraag van deze maand?', term: 'Het begrip erachter',
        uitleg: 'Leg in gewone taal uit hoe het zit. Gebruik een voorbeeld dat iedereen van buiten het werk herkent.',
        brug: 'En bij ons? Vertaal het door naar een vraag over data bij CONO.' };
    case 'iam':
      return { id, type, titel: 'Onderwerp rond toegang of wachtwoorden',
        uitleg: 'Waarom dit speelt en hoe het werkt, in gewone taal.',
        tip: 'Concrete tip of eerste stap.' };
    case 'stamdata':
      return { id, type, term: 'Term uit ons systeem', definitie: 'De definitie zoals iedereen hem zou opschrijven.',
        constatering: 'De verrassing: wat is er wél of niet vastgelegd, en waarom maakt dat uit?' };
    case 'aianalytics':
      return { id, type, titel: 'Wat er buiten CONO gebeurt met AI of analytics',
        bron: 'Bron: titel van het artikel', link: '',
        uitleg: 'Wat het artikel laat zien en wat dat betekent nu we een paar jaar verder zijn.' };
    case 'successen':
      return { id, type, items: [
        { id: uid(), tekst: 'Naam van het project of de vraag', toelichting: '' }
      ] };
    case 'jargonjudo':
      return { id, type, term: 'Het moeilijke woord', prikkel: 'Een kop die niet klopt, maar wel logisch klinkt',
        observatie: 'Wat je ziet in de cijfers.', ontknoping: 'Hoe het écht zit — en waarom de kop dus onzin is.',
        striplink: 'Zie de strip onderaan deze pagina.' };
    case 'actietips':
      return { id, type, tekst: 'Wat kan de lezer deze maand zelf doen?', actie: 'De concrete actie in één zin' };
    case 'vraagvandemaand':
      return { id, type, vraag: 'Heb je een vraag over data, rapporten of AI? Stel hem!',
        waar: 'Mail je vraag naar het data-team.', beloning: 'De beste vraag krijgt gevulde koeken voor de hele afdeling.' };

    /* --- Vrije blokken --- */
    case 'wistjedat':
      return { id, type, titel: 'Wist je dat...', emoji: '🧀', bron: 'Bron: naam van artikel of paper', citaat: 'Een pakkende zin of cijfer uit het artikel...', uitleg: 'Leg in gewone taal uit wat dit betekent voor CONO en waarom het leuk/interessant is als opstapje naar dit onderwerp.' };
    case 'onderwerp':
      return { id, type, titel: 'Naam van het onderwerp', icoon: '🗂️', uitleg: 'Wat het onderwerp inhoudt, in simpele taal — alsof je het aan een collega uitlegt die er niets van weet.', waarom: 'Waarom dit voor CONO belangrijk is.', actie: 'Wat iemand nu concreet kan doen' };
    case 'cijfer':
      return { id, type, titel: 'Cijfers & weetjes', tiles: [ { id: uid(), getal: '87%', label: 'Korte omschrijving', toelichting: 'Extra duiding in één zin.' } ] };
    case 'quote':
      return { id, type, naam: 'Naam collega', functie: 'Functie / afdeling', quote: 'Wat deze collega zegt over data of dit onderwerp.' };
    case 'tekst':
      return { id, type, titel: 'Titel van dit blok', tekst: 'Vrije tekst voor bijvoorbeeld een oproep, agenda-item of terugblik.' };
    default:
      return { id, type: 'tekst', titel: '', tekst: '' };
  }
}

/* De voorbeeldeditie: de standaard indeling, ingevuld met de onderwerpen uit
   het voorstel voor de eerste nieuwsbrief. */
function voorbeeldState() {
  const s = defaultState();
  s.meta = {
    titel: 'CONO Databericht',
    ondertitel: 'Data, AI en stamdata — uitgelegd zonder moeilijke woorden',
    editie: 'Editie 1 — probeersel',
    datum: todayNL()
  };
  s.voorwoord = {
    tekst: 'Data, AI, stamdata, IAM — het klinkt als een taal die je eerst moet leren voordat je mee kunt praten. Dat draaien we met dit Databericht om: elke editie een paar onderwerpen in gewone taal, met voorbeelden die je van buiten je werk herkent. Heb je zelf een vraag? Onderaan staat hoe je hem kwijt kunt.',
    auteur: 'Team Data & Informatie'
  };
  s.sections = [
    { id: uid(), type: 'kopvandemaand',
      kop: 'Luistert je telefoon met je mee om je gerichte advertenties te tonen?',
      term: 'Baader-Meinhof-fenomeen',
      uitleg: 'Je praat over een nieuwe fiets en een uur later staat je tijdlijn vol fietsreclame. Toeval? Je telefoon hoeft daar niet voor mee te luisteren: zodra iets je aandacht heeft, valt het je overal op. Dat heet het Baader-Meinhof-fenomeen. Bovendien hebben ze allang genoeg gegevens — wat je zoekt, waar je bent, wat je koopt — om die reclame gericht te tonen. Meeluisteren is niet nodig.',
      brug: 'En bij ons? Hebben wij eigenlijk alle gegevens die we nodig hebben om de vragen te beantwoorden die we onszelf stellen?' },

    { id: uid(), type: 'iam',
      titel: '1Password: één wachtwoord voor alles — is dat nou wel veilig?',
      uitleg: 'Alles achter één wachtwoord zetten voelt tegenstrijdig, maar het is veiliger dan wat de meesten nu doen: overal ongeveer hetzelfde wachtwoord. Lekt er dan één, dan liggen ze allemaal op straat. Met een kluis krijgt elke site een eigen, lang en willekeurig wachtwoord dat je niet hoeft te onthouden — jij onthoudt er nog precies één.',
      tip: 'Nog geen kluis in gebruik? Vraag ernaar bij IT — het inrichten kost je ongeveer vijf minuten.' },

    { id: uid(), type: 'stamdata',
      term: 'Geitenkaas',
      definitie: 'Kaas gemaakt van geitenmelk.',
      constatering: 'Klinkt logisch — maar deze definitie staat nergens in ons systeem. Iedereen wéét wat het is, en precies daarom schrijft niemand het op. Dat gaat goed tot iemand nieuw begint, of twee afdelingen er nét iets anders onder blijken te verstaan.' },

    { id: uid(), type: 'aianalytics',
      titel: 'Een artikel uit 2017 dat inmiddels gewoon je dagelijks leven beschrijft',
      bron: 'Bron: artikel uit 2017 over de mogelijkheden van AI',
      link: '',
      uitleg: 'Dit artikel uit 2017 las destijds als toekomstmuziek. Bijna tien jaar later is het dat niet meer: spraakassistenten, automatische vertalingen, foto\'s die zichzelf sorteren, chatbots die je e-mail voorschrijven. Stuk voor stuk technieken uit dat artikel die zo gewoon zijn dat we ze niet eens meer "AI" noemen.' },

    { id: uid(), type: 'successen', items: [
      { id: uid(), tekst: 'Lactaat herkennen met AI', toelichting: '' },
      { id: uid(), tekst: 'Hoeveel droogt een kaas nu werkelijk in — en verschilt dat per oplegger?', toelichting: '' },
      { id: uid(), tekst: 'Bestuursverslag (onderdeel van het jaarverslag) opgesteld met hulp van AI', toelichting: '' },
      { id: uid(), tekst: 'Wat is het statistische verband tussen de zuivelmarkt en de melkprijs van RFC?', toelichting: '' }
    ] },

    { id: uid(), type: 'jargonjudo',
      term: 'Causaal verband',
      prikkel: 'Verbod op ijs vanwege toename aantal verdrinkingen',
      observatie: 'Er is een duidelijke correlatie tussen de hoeveelheid ijs die verkocht wordt en het aantal verdrinkingen in zwembaden en buitenwater. Meer ijs, meer verdrinkingen — de cijfers liegen niet.',
      ontknoping: 'Maar er is geen causaal verband. Als het warm is, wordt er véél gezwommen én veel ijs gegeten. Het weer veroorzaakt allebei; het ijs duwt niemand het water in. Twee dingen die samen bewegen, hoeven elkaar dus niet te veroorzaken.',
      striplink: 'Zie de strip onderaan deze pagina.' },

    { id: uid(), type: 'actietips',
      tekst: 'Heb je recent gekeken tot welke rapporten jij toegang hebt, en gebruik je ze allemaal? In de meeste rapporten kun je filteren of inzoomen, zodat de cijfers precies over jouw afdeling gaan.',
      actie: 'Neem deze maand vijf minuten om je eigen rapportenlijst door te lopen.' },

    { id: uid(), type: 'vraagvandemaand',
      vraag: 'Heb je een vraag over data, rapporten of AI? Stel hem!',
      waar: 'Mail je vraag naar het data-team.',
      beloning: 'De beste vraag krijgt gevulde koeken voor de hele afdeling.' }
  ];
  s.strip = { tonen: true, teaser: 'JargonJudo: correlatie is nog geen oorzaak.' };
  s.footer = { contact: 'Data-team — data@cono.nl', volgende: 'De volgende editie verschijnt over een maand.' };
  return s;
}

let state = loadLocal(STORAGE_KEY) || voorbeeldState();

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
    ? `<textarea data-field="${field}" rows="${rows}">${escapeHtml(value)}</textarea>`
    : `<input data-field="${field}" value="${escapeHtml(value)}">`;
  return `<div class="field"><label>${label}</label>${input}${hint ? `<small class="hint">${hint}</small>` : ''}</div>`;
}

/* Elke vaste rubriek begint met zijn eigen kop, die je mag overschrijven. */
function kopVelden(sec) {
  const kop = rubriekKop(sec);
  return `<div class="veld-paar">
      <div class="field"><label>Kop van deze rubriek</label><input data-field="label" value="${escapeHtml(kop.label)}"></div>
      <div class="field"><label>Ondertitel</label><input data-field="subtitel" value="${escapeHtml(kop.subtitel)}"></div>
    </div>`;
}

function sectionFieldsHTML(sec) {
  if (RUBRIEK_META[sec.type]) return kopVelden(sec) + rubriekVelden(sec);
  return rubriekVelden(sec);
}

function rubriekVelden(sec) {
  switch (sec.type) {
    /* --- Vaste rubrieken --- */
    case 'kopvandemaand':
      return veld('Prikkelende kop of vraag', 'kop', sec.kop, 2)
        + veld('Begrip (optioneel)', 'term', sec.term, 0, 'Bijv. het fenomeen of de term achter het verhaal.')
        + veld('Uitleg in gewone taal', 'uitleg', sec.uitleg, 6)
        + veld('Brug naar CONO', 'brug', sec.brug, 2, 'De vraag die dit verhaal oproept over onze eigen gegevens.');
    case 'iam':
      return veld('Titel', 'titel', sec.titel, 2)
        + veld('Uitleg', 'uitleg', sec.uitleg, 5)
        + veld('Tip / eerste stap (optioneel)', 'tip', sec.tip, 2);
    case 'stamdata':
      return veld('Term', 'term', sec.term, 0)
        + veld('Definitie', 'definitie', sec.definitie, 2)
        + veld('De constatering', 'constatering', sec.constatering, 4, 'Wat is er wél of juist niet vastgelegd — en waarom maakt dat uit?');
    case 'aianalytics':
      return veld('Titel', 'titel', sec.titel, 2)
        + veld('Bron', 'bron', sec.bron, 0)
        + veld('Link (optioneel)', 'link', sec.link, 0, 'Volledige link, bijv. https://...')
        + veld('Uitleg', 'uitleg', sec.uitleg, 5);
    case 'successen':
      return `<div id="items-${sec.id}">${(sec.items || []).map(it => itemFieldsHTML(sec.id, it)).join('')}</div>
        <button type="button" class="btn btn-icon" data-action="add-item" data-section="${sec.id}">+ Succes toevoegen</button>`;
    case 'jargonjudo':
      return veld('Het moeilijke woord', 'term', sec.term, 0)
        + veld('Prikkelende (foute) kop', 'prikkel', sec.prikkel, 2, 'Een conclusie die logisch klinkt maar niet klopt.')
        + veld('1. Wat je ziet', 'observatie', sec.observatie, 3)
        + veld('2. Hoe het écht zit', 'ontknoping', sec.ontknoping, 4)
        + veld('Verwijzing naar de strip (optioneel)', 'striplink', sec.striplink, 0);
    case 'actietips':
      return veld('Tekst', 'tekst', sec.tekst, 5)
        + veld('Concrete actie (optioneel)', 'actie', sec.actie, 2);
    case 'vraagvandemaand':
      return veld('De oproep', 'vraag', sec.vraag, 2)
        + veld('Waar kan de vraag heen?', 'waar', sec.waar, 2)
        + veld('Beloning (optioneel)', 'beloning', sec.beloning, 2);

    /* --- Vrije blokken --- */
    case 'wistjedat':
      return veld('Titel', 'titel', sec.titel, 0)
        + veld('Emoji', 'emoji', sec.emoji, 0)
        + veld('Bron (artikel / paper)', 'bron', sec.bron, 0)
        + veld('Citaat of opvallend feit', 'citaat', sec.citaat, 2)
        + veld('Speelse uitleg / koppeling naar onderwerp', 'uitleg', sec.uitleg, 3);
    case 'onderwerp':
      return veld('Titel van het onderwerp', 'titel', sec.titel, 0)
        + veld('Icoon (emoji)', 'icoon', sec.icoon, 0)
        + veld('Uitleg in simpele taal', 'uitleg', sec.uitleg, 3)
        + veld('Waarom dit belangrijk is', 'waarom', sec.waarom, 2)
        + veld('Actiepunt (optioneel)', 'actie', sec.actie, 0);
    case 'cijfer':
      return veld('Titel van dit blok', 'titel', sec.titel, 0)
        + `<div id="tiles-${sec.id}">${sec.tiles.map(t => tileFieldsHTML(sec.id, t)).join('')}</div>
           <button type="button" class="btn btn-icon" data-action="add-tile" data-section="${sec.id}">+ Cijfer toevoegen</button>`;
    case 'quote':
      return veld('Naam', 'naam', sec.naam, 0)
        + veld('Functie / afdeling', 'functie', sec.functie, 0)
        + veld('Quote', 'quote', sec.quote, 3);
    case 'tekst':
      return veld('Titel', 'titel', sec.titel, 0)
        + veld('Tekst', 'tekst', sec.tekst, 4);
    default:
      return '';
  }
}

function tileFieldsHTML(sectionId, tile) {
  return `
    <div class="section-card" style="background:#fff;">
      <div class="section-card-head">
        <span class="section-type-label" style="color:var(--cono-green-dark);">Cijfer</span>
        <button type="button" class="btn-danger" data-action="delete-tile" data-section="${sectionId}" data-tile="${tile.id}">✕</button>
      </div>
      <div class="field"><label>Getal</label><input data-tile-field="getal" data-tile="${tile.id}" value="${escapeHtml(tile.getal)}"></div>
      <div class="field"><label>Label</label><input data-tile-field="label" data-tile="${tile.id}" value="${escapeHtml(tile.label)}"></div>
      <div class="field"><label>Toelichting</label><input data-tile-field="toelichting" data-tile="${tile.id}" value="${escapeHtml(tile.toelichting)}"></div>
    </div>`;
}

function itemFieldsHTML(sectionId, item) {
  return `
    <div class="section-card" style="background:#fff;">
      <div class="section-card-head">
        <span class="section-type-label" style="color:var(--cono-green-dark);">Succes</span>
        <button type="button" class="btn-danger" data-action="delete-item" data-section="${sectionId}" data-item="${item.id}">✕</button>
      </div>
      <div class="field"><label>Titel</label><input data-item-field="tekst" data-item="${item.id}" value="${escapeHtml(item.tekst)}"></div>
      <div class="field"><label>Toelichting (optioneel)</label><input data-item-field="toelichting" data-item="${item.id}" value="${escapeHtml(item.toelichting)}"></div>
    </div>`;
}

function renderSectionsEditor() {
  if (state.sections.length === 0) {
    els.sectionsList.innerHTML = `<p class="empty-state">Nog geen secties. Klik op "Standaard indeling" voor de vaste rubrieken, of kies hieronder los een blok.</p>`;
    return;
  }
  els.sectionsList.innerHTML = state.sections.map((sec, i) => `
    <div class="section-card" data-section-row="${sec.id}">
      <div class="section-card-head">
        <span class="section-type-label">${escapeHtml(sectionLabel(sec))}</span>
        <div class="section-actions">
          <button type="button" class="btn-icon" data-action="move-up" data-section="${sec.id}" ${i === 0 ? 'disabled' : ''} title="Naar boven">↑</button>
          <button type="button" class="btn-icon" data-action="move-down" data-section="${sec.id}" ${i === state.sections.length - 1 ? 'disabled' : ''} title="Naar beneden">↓</button>
          <button type="button" class="btn-danger" data-action="delete-section" data-section="${sec.id}" title="Verwijderen">✕</button>
        </div>
      </div>
      ${sectionFieldsHTML(sec)}
    </div>
  `).join('');
}

function findSection(id) { return state.sections.find(s => s.id === id); }

els.sectionsList.addEventListener('input', (e) => {
  const target = e.target;
  const row = target.closest('[data-section-row]');
  if (!row) return;
  const sec = findSection(row.dataset.sectionRow);
  if (!sec) return;

  if (target.dataset.field) {
    sec[target.dataset.field] = target.value;
  } else if (target.dataset.tileField) {
    const tile = sec.tiles.find(t => t.id === target.dataset.tile);
    if (tile) tile[target.dataset.tileField] = target.value;
  } else if (target.dataset.itemField) {
    const item = sec.items.find(it => it.id === target.dataset.item);
    if (item) item[target.dataset.itemField] = target.value;
  } else {
    return;
  }
  persist();
  renderPreview();
});

els.sectionsList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const sec = findSection(btn.dataset.section);
  const idx = state.sections.indexOf(sec);
  if (!sec) return;

  if (action === 'move-up' && idx > 0) {
    [state.sections[idx - 1], state.sections[idx]] = [state.sections[idx], state.sections[idx - 1]];
  } else if (action === 'move-down' && idx < state.sections.length - 1) {
    [state.sections[idx + 1], state.sections[idx]] = [state.sections[idx], state.sections[idx + 1]];
  } else if (action === 'delete-section') {
    if (!confirm('Deze sectie verwijderen?')) return;
    state.sections.splice(idx, 1);
  } else if (action === 'add-tile') {
    sec.tiles.push({ id: uid(), getal: '0', label: 'Nieuw cijfer', toelichting: '' });
  } else if (action === 'delete-tile') {
    const tIdx = sec.tiles.findIndex(t => t.id === btn.dataset.tile);
    if (tIdx > -1) sec.tiles.splice(tIdx, 1);
  } else if (action === 'add-item') {
    sec.items.push({ id: uid(), tekst: 'Nieuw project of nieuwe vraag', toelichting: '' });
  } else if (action === 'delete-item') {
    const iIdx = sec.items.findIndex(it => it.id === btn.dataset.item);
    if (iIdx > -1) sec.items.splice(iIdx, 1);
  } else {
    return;
  }
  herteken();
});

document.getElementById('btn-add-section').addEventListener('click', () => {
  state.sections.push(nieuwSectie(els.newSectionType.value));
  herteken();
});

document.getElementById('btn-standaard').addEventListener('click', () => {
  if (state.sections.length && !confirm('Dit vervangt de huidige secties door de acht vaste rubrieken. Doorgaan?')) return;
  state.sections = STANDAARD_VOLGORDE.map(nieuwSectie);
  herteken();
});

/* --------------------------------- Preview -------------------------------- */
function rubriekWrapper(sec, binnenkant, extraClass) {
  const kop = rubriekKop(sec);
  return `
    <div class="nl-section">
      <div class="rubriek rubriek--${kop.kleur}${extraClass ? ' ' + extraClass : ''}">
        <div class="rubriek-label">
          <span>${kop.icoon}</span> ${escapeHtml(kop.label)}
          ${kop.subtitel ? `<span class="rubriek-subtitel">${escapeHtml(kop.subtitel)}</span>` : ''}
        </div>
        <div class="rubriek-body">${binnenkant}</div>
      </div>
    </div>`;
}

function sectionPreviewHTML(sec) {
  switch (sec.type) {
    /* --- Vaste rubrieken --- */
    case 'kopvandemaand':
      return rubriekWrapper(sec, `
        <h3 class="rubriek-kop">${escapeHtml(sec.kop)}</h3>
        ${sec.term ? `<span class="term-chip">${escapeHtml(sec.term)}</span>` : ''}
        ${textToParagraphs(sec.uitleg)}
        ${sec.brug ? `<div class="rubriek-brug">👉 ${escapeHtml(sec.brug)}</div>` : ''}`);

    case 'iam':
      return rubriekWrapper(sec, `
        <h3 class="rubriek-kop">${escapeHtml(sec.titel)}</h3>
        ${textToParagraphs(sec.uitleg)}
        ${sec.tip ? `<div class="rubriek-tip">💡 ${escapeHtml(sec.tip)}</div>` : ''}`);

    case 'stamdata':
      return rubriekWrapper(sec, `
        <div class="woordenboek">
          <span class="woord">${escapeHtml(sec.term)}</span>
          <span class="definitie">${escapeHtml(sec.definitie)}</span>
        </div>
        ${textToParagraphs(sec.constatering)}`);

    case 'aianalytics': {
      const url = safeUrl(sec.link);
      return rubriekWrapper(sec, `
        <h3 class="rubriek-kop">${escapeHtml(sec.titel)}</h3>
        ${sec.bron ? `<div class="bron-regel">📄 ${escapeHtml(sec.bron)}</div>` : ''}
        ${textToParagraphs(sec.uitleg)}
        ${url ? `<a class="bron-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>` : ''}`);
    }

    case 'successen':
      return rubriekWrapper(sec, `
        <ul class="successen-lijst">
          ${(sec.items || []).map(it => `
            <li><strong>${escapeHtml(it.tekst)}</strong>
              ${it.toelichting ? `<span class="toelichting">${escapeHtml(it.toelichting)}</span>` : ''}
            </li>`).join('')}
        </ul>`);

    case 'jargonjudo':
      return rubriekWrapper(sec, `
        <div class="jargon-term">${escapeHtml(sec.term)}</div>
        <div class="jargon-prikkel">“${escapeHtml(sec.prikkel)}”</div>
        <div class="jargon-stap"><span class="stap-nr">1</span><span>${escapeHtml(sec.observatie)}</span></div>
        <div class="jargon-stap jargon-stap--pointe"><span class="stap-nr">2</span><span>${escapeHtml(sec.ontknoping)}</span></div>
        ${sec.striplink ? `<div class="jargon-strip">📖 ${escapeHtml(sec.striplink)}</div>` : ''}`);

    case 'actietips':
      return rubriekWrapper(sec, `
        ${textToParagraphs(sec.tekst)}
        ${sec.actie ? `<span class="actie">👉 ${escapeHtml(sec.actie)}</span>` : ''}`);

    case 'vraagvandemaand':
      return rubriekWrapper(sec, `
        <p class="vraag-tekst">${escapeHtml(sec.vraag)}</p>
        ${sec.waar ? `<p>${escapeHtml(sec.waar)}</p>` : ''}
        ${sec.beloning ? `<div class="beloning">🍪 ${escapeHtml(sec.beloning)}</div>` : ''}`, 'vraag-coupon');

    /* --- Vrije blokken --- */
    case 'wistjedat':
      return `
        <div class="nl-section">
          <div class="nl-section-title"><span class="icon-badge">${escapeHtml(sec.emoji || '💡')}</span> ${escapeHtml(sec.titel)}</div>
          <div class="card-wistjedat">
            <span class="stempel">Wist je dat?</span>
            <div class="bron">${escapeHtml(sec.bron)}</div>
            <blockquote>${escapeHtml(sec.citaat)}</blockquote>
            ${textToParagraphs(sec.uitleg)}
          </div>
        </div>`;
    case 'onderwerp':
      return `
        <div class="nl-section">
          <div class="nl-section-title"><span class="icon-badge">${escapeHtml(sec.icoon || '📘')}</span> ${escapeHtml(sec.titel)}</div>
          <div class="card-onderwerp">
            ${textToParagraphs(sec.uitleg)}
            <div class="waarom"><strong>Waarom dit ertoe doet:</strong> ${escapeHtml(sec.waarom)}</div>
            ${sec.actie ? `<span class="actie">👉 ${escapeHtml(sec.actie)}</span>` : ''}
          </div>
        </div>`;
    case 'cijfer':
      return `
        <div class="nl-section">
          <div class="nl-section-title"><span class="icon-badge">📊</span> ${escapeHtml(sec.titel)}</div>
          <div class="cijfer-grid">
            ${sec.tiles.map(t => `
              <div class="cijfer-tile">
                <div class="getal">${escapeHtml(t.getal)}</div>
                <div class="label">${escapeHtml(t.label)}</div>
                ${t.toelichting ? `<div class="toelichting">${escapeHtml(t.toelichting)}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
    case 'quote':
      return `
        <div class="nl-section">
          <div class="card-quote">
            “${escapeHtml(sec.quote)}”
            <div class="naam">${escapeHtml(sec.naam)} <span class="functie">— ${escapeHtml(sec.functie)}</span></div>
          </div>
        </div>`;
    case 'tekst':
      return `
        <div class="nl-section">
          ${sec.titel ? `<div class="nl-section-title"><span class="icon-badge">📝</span> ${escapeHtml(sec.titel)}</div>` : ''}
          <div class="card-tekst">${textToParagraphs(sec.tekst)}</div>
        </div>`;
    default:
      return '';
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

function gekozenRubrieken() {
  return Array.from(document.querySelectorAll('#r-rubrieken input:checked')).map(i => i.value);
}

function redactieInvoer() {
  return {
    waarover: document.getElementById('r-waarover').value,
    maand: document.getElementById('r-maand').value,
    moeilijkWoord: document.getElementById('r-woord').value,
    successen: document.getElementById('r-successen').value,
    rubrieken: gekozenRubrieken()
  };
}

function vulUitRedactie(antwoord) {
  const uitkomst = sectiesUitRedactie(antwoord);
  if (uitkomst.titel) state.meta.titel = uitkomst.titel;
  if (uitkomst.ondertitel) state.meta.ondertitel = uitkomst.ondertitel;
  if (uitkomst.editie) state.meta.editie = uitkomst.editie;
  if (uitkomst.voorwoord) state.voorwoord.tekst = uitkomst.voorwoord;
  state.sections = uitkomst.secties;
  fillStaticFields();
  herteken();
  return uitkomst.secties.length;
}

/* De lijst met rubrieken om uit te kiezen; standaard staan ze allemaal aan
   behalve de twee die niet elke maand een onderwerp zijn. */
(function vulRubriekKeuze() {
  const doel = document.getElementById('r-rubrieken');
  if (!doel) return;
  const uitgezet = ['iam', 'aianalytics'];
  doel.innerHTML = STANDAARD_VOLGORDE.map(soort => {
    const meta = RUBRIEK_META[soort];
    return `<label class="schakel"><input type="checkbox" value="${soort}"${uitgezet.indexOf(soort) === -1 ? ' checked' : ''}> ${meta.icoon} ${escapeHtml(meta.label)}</label>`;
  }).join('');
})();

document.getElementById('r-btn-prompt').addEventListener('click', () => {
  const invoer = redactieInvoer();
  if (!invoer.waarover.trim()) { redactieMelding('Schrijf eerst kort waar het deze maand over gaat.', 'fout'); return; }
  if (!invoer.rubrieken.length) { redactieMelding('Kies minstens één rubriek.', 'fout'); return; }
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
    redactieMelding(`${aantal} rubrieken ingevuld. Pas gerust nog teksten en koppen aan.`, 'goed');
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
    redactieKnop.addEventListener('click', () => {
      const invoer = redactieInvoer();
      if (!invoer.waarover.trim()) { redactieMelding('Schrijf eerst kort waar het deze maand over gaat.', 'fout'); return; }
      if (!invoer.rubrieken.length) { redactieMelding('Kies minstens één rubriek.', 'fout'); return; }
      redactieKnop.disabled = true;
      redactieMelding('Claude schrijft de nieuwsbrief...');
      sample.json(redactiePrompt(invoer), { modelTier: 'default' }).then((antwoord) => {
        try {
          const aantal = vulUitRedactie(antwoord);
          redactieMelding(`${aantal} rubrieken geschreven. Niet tevreden? Klik nog eens — elke keer is anders.`, 'goed');
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
