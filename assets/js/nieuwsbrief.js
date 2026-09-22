/* CONO Nieuwsbrief bouwer — state, editor en live preview */

const STORAGE_KEY = 'cono_nieuwsbrief_draft_v1';

const SECTION_LABELS = {
  wistjedat: '💡 Wist-je-dat',
  onderwerp: '📘 Onderwerp uitgelegd',
  cijfer: '📊 Cijfers & weetjes',
  quote: '💬 Quote van een collega',
  tekst: '📝 Tekstblok'
};

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
    strip: {
      titel: '',
      teaser: ''
    },
    footer: {
      contact: 'Data-team — data@cono.nl',
      volgende: 'De volgende editie verschijnt over twee maanden.'
    }
  };
}

function nieuwSectie(type) {
  const id = uid();
  switch (type) {
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

function voorbeeldState() {
  const s = defaultState();
  s.meta = { titel: 'CONO Databericht', ondertitel: 'Samen slim met data — zonder moeilijke woorden', editie: 'Editie 1 — pilot', datum: todayNL() };
  s.voorwoord = {
    tekst: 'Welkom bij de allereerste editie van het Databericht! Data klinkt al snel als iets ingewikkelds, maar eigenlijk werk je er elke dag al mee — denk aan de melklijsten, de planning of de kwaliteitscontroles. In deze nieuwsbrief laten we op een luchtige manier zien wat goed datamanagement voor jou en je collega\'s kan betekenen.',
    auteur: 'Team Data & Informatie'
  };
  s.sections = [
    { id: uid(), type: 'wistjedat', titel: 'Wist je dat...', emoji: '🧀', bron: 'Bron: "Van boerenerf tot big data", vaktijdschrift Zuivelzicht',
      citaat: '"Eén verkeerd ingevoerd cijfer op de boerderij kan verderop in de keten wel twaalf keer worden overgetypt."',
      uitleg: 'Een klein foutje bij de bron plant zich dus overal voort. Precies daarom hebben we het deze editie over datakwaliteit: hoe zorgen we er samen voor dat een getal maar één keer goed hoeft te worden ingevoerd?' },
    { id: uid(), type: 'onderwerp', titel: 'Wat is datakwaliteit nou eigenlijk?', icoon: '✅',
      uitleg: 'Datakwaliteit betekent gewoon: kloppen de gegevens die we vastleggen, en zijn ze compleet en actueel? Denk aan een leverdatum die klopt, of een partijnummer dat maar één keer voorkomt.',
      waarom: 'Als de basisgegevens kloppen, hoeven collega\'s minder tijd te besteden aan uitzoeken en corrigeren — en kunnen we sneller de juiste beslissingen nemen.',
      actie: 'Zie je een gegeven dat niet klopt? Meld het bij je teamleider of het data-team.' },
    { id: uid(), type: 'cijfer', titel: 'Deze maand in cijfers', tiles: [
        { id: uid(), getal: '3.240', label: 'Records gecontroleerd', toelichting: 'Automatisch gecheckt op fouten' },
        { id: uid(), getal: '92%', label: 'Foutloos binnengekomen', toelichting: 'Een stijging van 6% t.o.v. vorige maand' },
        { id: uid(), getal: '15 min', label: 'Tijd bespaard per rapport', toelichting: 'Dankzij minder handmatig zoekwerk' }
      ] },
    { id: uid(), type: 'quote', naam: 'Marieke, Kwaliteitscontrole', functie: 'Afdeling Kwaliteit',
      quote: 'Sinds we scherper letten op invoer, hoef ik veel minder na te bellen om cijfers te checken. Dat scheelt mij zomaar een uur per week.' },
    { id: uid(), type: 'tekst', titel: 'Doe mee', tekst: 'Heb je een idee, vraag of voorbeeld dat in de volgende editie mag? Stuur het door naar het data-team — elke bijdrage is welkom!' }
  ];
  s.strip = { titel: 'Data-Daan en Boer Bert over datakwaliteit', teaser: 'Wat gebeurt er als één cijfertje verkeerd wordt getypt? Lees de strip en kom erachter!' };
  s.footer = { contact: 'Data-team — data@cono.nl', volgende: 'De volgende editie verschijnt over twee maanden.' };
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
  stripTitel: document.getElementById('f-strip-titel'),
  stripTeaser: document.getElementById('f-strip-teaser'),
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

/* --------------------------- Formulier -> state --------------------------- */
function fillStaticFields() {
  els.titel.value = state.meta.titel;
  els.ondertitel.value = state.meta.ondertitel;
  els.editie.value = state.meta.editie;
  els.datum.value = state.meta.datum;
  els.voorwoordTekst.value = state.voorwoord.tekst;
  els.voorwoordAuteur.value = state.voorwoord.auteur;
  els.stripTitel.value = state.strip.titel;
  els.stripTeaser.value = state.strip.teaser;
  els.contact.value = state.footer.contact;
  els.volgende.value = state.footer.volgende;
}

function bindStatic(el, getSet) {
  el.addEventListener('input', () => {
    getSet(el.value);
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
  bindStatic(els.stripTitel, v => state.strip.titel = v);
  bindStatic(els.stripTeaser, v => state.strip.teaser = v);
  bindStatic(els.contact, v => state.footer.contact = v);
  bindStatic(els.volgende, v => state.footer.volgende = v);
}

/* ------------------------------ Secties editor ---------------------------- */
function sectionFieldsHTML(sec) {
  switch (sec.type) {
    case 'wistjedat':
      return `
        <div class="field"><label>Titel</label><input data-field="titel" value="${escapeHtml(sec.titel)}"></div>
        <div class="field"><label>Emoji</label><input data-field="emoji" value="${escapeHtml(sec.emoji)}" maxlength="4" style="max-width:80px;"></div>
        <div class="field"><label>Bron (artikel / paper)</label><input data-field="bron" value="${escapeHtml(sec.bron)}"></div>
        <div class="field"><label>Citaat of opvallend feit</label><textarea data-field="citaat" rows="2">${escapeHtml(sec.citaat)}</textarea></div>
        <div class="field"><label>Speelse uitleg / koppeling naar onderwerp</label><textarea data-field="uitleg" rows="3">${escapeHtml(sec.uitleg)}</textarea></div>`;
    case 'onderwerp':
      return `
        <div class="field"><label>Titel van het onderwerp</label><input data-field="titel" value="${escapeHtml(sec.titel)}"></div>
        <div class="field"><label>Icoon (emoji)</label><input data-field="icoon" value="${escapeHtml(sec.icoon)}" maxlength="4" style="max-width:80px;"></div>
        <div class="field"><label>Uitleg in simpele taal</label><textarea data-field="uitleg" rows="3">${escapeHtml(sec.uitleg)}</textarea></div>
        <div class="field"><label>Waarom dit belangrijk is</label><textarea data-field="waarom" rows="2">${escapeHtml(sec.waarom)}</textarea></div>
        <div class="field"><label>Actiepunt (optioneel)</label><input data-field="actie" value="${escapeHtml(sec.actie)}"></div>`;
    case 'cijfer':
      return `
        <div class="field"><label>Titel van dit blok</label><input data-field="titel" value="${escapeHtml(sec.titel)}"></div>
        <div id="tiles-${sec.id}">${sec.tiles.map(t => tileFieldsHTML(sec.id, t)).join('')}</div>
        <button type="button" class="btn btn-icon" data-action="add-tile" data-section="${sec.id}">+ Cijfer toevoegen</button>`;
    case 'quote':
      return `
        <div class="field"><label>Naam</label><input data-field="naam" value="${escapeHtml(sec.naam)}"></div>
        <div class="field"><label>Functie / afdeling</label><input data-field="functie" value="${escapeHtml(sec.functie)}"></div>
        <div class="field"><label>Quote</label><textarea data-field="quote" rows="3">${escapeHtml(sec.quote)}</textarea></div>`;
    case 'tekst':
      return `
        <div class="field"><label>Titel</label><input data-field="titel" value="${escapeHtml(sec.titel)}"></div>
        <div class="field"><label>Tekst</label><textarea data-field="tekst" rows="4">${escapeHtml(sec.tekst)}</textarea></div>`;
    default:
      return '';
  }
}

function tileFieldsHTML(sectionId, tile) {
  return `
    <div class="section-card" style="background:#fff;" data-tile-row="${tile.id}">
      <div class="section-card-head">
        <span class="section-type-label" style="color:var(--cono-green-dark);">Cijfer</span>
        <button type="button" class="btn-danger" data-action="delete-tile" data-section="${sectionId}" data-tile="${tile.id}">✕</button>
      </div>
      <div class="field"><label>Getal</label><input data-tile-field="getal" data-section="${sectionId}" data-tile="${tile.id}" value="${escapeHtml(tile.getal)}"></div>
      <div class="field"><label>Label</label><input data-tile-field="label" data-section="${sectionId}" data-tile="${tile.id}" value="${escapeHtml(tile.label)}"></div>
      <div class="field"><label>Toelichting</label><input data-tile-field="toelichting" data-section="${sectionId}" data-tile="${tile.id}" value="${escapeHtml(tile.toelichting)}"></div>
    </div>`;
}

function renderSectionsEditor() {
  if (state.sections.length === 0) {
    els.sectionsList.innerHTML = `<p class="empty-state">Nog geen secties. Kies hierboven een type en klik op "Sectie toevoegen".</p>`;
    return;
  }
  els.sectionsList.innerHTML = state.sections.map((sec, i) => `
    <div class="section-card" data-section-row="${sec.id}">
      <div class="section-card-head">
        <span class="section-type-label">${SECTION_LABELS[sec.type] || sec.type}</span>
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
    persist();
    renderPreview();
  } else if (target.dataset.tileField) {
    const tile = sec.tiles.find(t => t.id === target.dataset.tile);
    if (tile) {
      tile[target.dataset.tileField] = target.value;
      persist();
      renderPreview();
    }
  }
});

els.sectionsList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const secId = btn.dataset.section;
  const idx = state.sections.findIndex(s => s.id === secId);
  if (idx === -1 && action !== 'add-tile') return;

  if (action === 'move-up' && idx > 0) {
    [state.sections[idx - 1], state.sections[idx]] = [state.sections[idx], state.sections[idx - 1]];
  } else if (action === 'move-down' && idx < state.sections.length - 1) {
    [state.sections[idx + 1], state.sections[idx]] = [state.sections[idx], state.sections[idx + 1]];
  } else if (action === 'delete-section') {
    if (confirm('Deze sectie verwijderen?')) state.sections.splice(idx, 1);
  } else if (action === 'add-tile') {
    const sec = findSection(secId);
    sec.tiles.push({ id: uid(), getal: '0', label: 'Nieuw cijfer', toelichting: '' });
  } else if (action === 'delete-tile') {
    const sec = findSection(secId);
    const tIdx = sec.tiles.findIndex(t => t.id === btn.dataset.tile);
    if (tIdx > -1) sec.tiles.splice(tIdx, 1);
  }
  persist();
  renderSectionsEditor();
  renderPreview();
});

document.getElementById('btn-add-section').addEventListener('click', () => {
  state.sections.push(nieuwSectie(els.newSectionType.value));
  persist();
  renderSectionsEditor();
  renderPreview();
});

/* --------------------------------- Preview -------------------------------- */
function sectionPreviewHTML(sec) {
  switch (sec.type) {
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

function renderPreview() {
  const m = state.meta, v = state.voorwoord, f = state.footer, st = state.strip;
  els.previewSheet.innerHTML = `
    <div class="nl-header">
      <span class="eyebrow">${escapeHtml(m.editie || 'CONO Nieuwsbrief')}</span>
      <h1>${escapeHtml(m.titel || 'CONO Databericht')}</h1>
      <div class="subtitle">${escapeHtml(m.ondertitel)}</div>
      <div class="meta-row">
        <span>📅 ${escapeHtml(m.datum)}</span>
      </div>
    </div>
    <div class="nl-body">
      ${v.tekst ? `
      <div class="nl-intro">
        ${textToParagraphs(v.tekst)}
        ${v.auteur ? `<div class="auteur">— ${escapeHtml(v.auteur)}</div>` : ''}
      </div>` : ''}

      ${state.sections.length ? state.sections.map(sectionPreviewHTML).join('') : `<p class="empty-state">Voeg links secties toe om de nieuwsbrief te vullen.</p>`}

      ${(st.titel || st.teaser) ? `
      <div class="nl-strip-teaser">
        <div class="txt">
          <strong>📖 ${escapeHtml(st.titel || 'Strip van deze editie')}</strong>
          ${escapeHtml(st.teaser)}
        </div>
        <span class="onderwerp-tag" style="background:#fff;color:var(--cono-green-dark);">zie strip.html</span>
      </div>` : ''}
    </div>
    <div class="nl-footer">
      <span>✉️ ${escapeHtml(f.contact)}</span>
      <span>${escapeHtml(f.volgende)}</span>
    </div>
  `;
}

/* --------------------------------- Toolbar -------------------------------- */
document.getElementById('btn-nieuw').addEventListener('click', () => {
  if (!confirm('Dit wist het huidige formulier en start een lege editie. Doorgaan?')) return;
  state = defaultState();
  fillStaticFields();
  renderSectionsEditor();
  renderPreview();
  persist();
});

document.getElementById('btn-voorbeeld').addEventListener('click', () => {
  if (!confirm('Dit vervangt de huidige inhoud door een voorbeeldeditie. Doorgaan?')) return;
  state = voorbeeldState();
  fillStaticFields();
  renderSectionsEditor();
  renderPreview();
  persist();
});

document.getElementById('btn-export').addEventListener('click', () => {
  const naam = (state.meta.editie || 'cono-nieuwsbrief').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  downloadJSON(`${naam}.json`, state);
});

document.getElementById('input-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readJSONFile(file, (data) => {
    state = Object.assign(defaultState(), data);
    fillStaticFields();
    renderSectionsEditor();
    renderPreview();
    persist();
  }, () => alert('Dit bestand kon niet worden gelezen. Is het een geldig JSON-exportbestand?'));
  e.target.value = '';
});

document.getElementById('btn-print').addEventListener('click', () => window.print());

/* ---------------------------------- Init ---------------------------------- */
fillStaticFields();
attachStaticBindings();
renderSectionsEditor();
renderPreview();
