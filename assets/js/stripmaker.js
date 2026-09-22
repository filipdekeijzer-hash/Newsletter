/* CONO Strip maker — een tekentafel voor krantenstrips.
 *
 * Er zijn geen vaste sjablonen: een vakje is een leeg kader waarin je zelf
 * figuren, decorstukken, ballonnen en tekstblokken neerzet en versleept.
 * Figuren zijn poppetjes met scharnieren — schouders, ellebogen, hoofd — en
 * een gezicht dat uit losse waarden wordt opgebouwd (wenkbrauwhoek,
 * ooghoogte, mondkromming). Daardoor is elke figuur en elke strip anders.
 */

const STORAGE_KEY = 'cono_strip_tekentafel_v1';

/* ========================================================================
   MODEL
   ===================================================================== */

function defaultState() {
  return {
    titel: 'CONO Strip',
    ondertitel: '',
    auteur: 'Data-team CONO',
    rijen: [{ id: uid(), panelen: [nieuwPaneel(), nieuwPaneel(), nieuwPaneel()] }]
  };
}

function voorbeeldState() {
  const s = { titel: 'JargonJudo', ondertitel: 'causaal verband', auteur: 'Data-team CONO', rijen: [] };

  const daan = (x, y, pose, gezicht) => Object.assign(nieuwFiguur(x, y), {
    huid: '#f0c69c', shirt: '#3a7bbf', broek: '#3f4a57', haarKleur: '#4a3426', haar: 'kort', bril: true,
    pose: Object.assign({ hoofd: 0, benen: 6, schouderL: 12, elleboogL: 20, schouderR: 12, elleboogR: 20 }, pose),
    gezicht: Object.assign({ brauwHoek: 0, brauwHoogte: 0, oogOpen: 1, pupilX: 0, pupilY: 0, mondBreedte: 11, mondKrom: 0.3, mondOpen: 0 }, gezicht)
  });
  const bert = (x, y, pose, gezicht) => Object.assign(nieuwFiguur(x, y), {
    huid: '#eec096', shirt: '#f2efe4', broek: '#4d6b3c', haarKleur: '#8a6236', haar: 'muts', snor: true, blos: true, spiegel: true,
    pose: Object.assign({ hoofd: 0, benen: 8, schouderL: 14, elleboogL: 18, schouderR: 14, elleboogR: 18 }, pose),
    gezicht: Object.assign({ brauwHoek: 0, brauwHoogte: 0, oogOpen: 1, pupilX: 0, pupilY: 0, mondBreedte: 10, mondKrom: 0.2, mondOpen: 0 }, gezicht)
  });

  const p1 = nieuwPaneel(1.5);
  p1.lucht = '#e8eef2'; p1.grond = '#c9b9a8'; p1.horizon = 70;
  p1.objecten = [
    Object.assign(nieuwDecor('beeldscherm', 96, 232), { schaal: 1.1 }),
    daan(196, 292, { schouderR: 108, elleboogR: -34, schouderL: 16 }, { brauwHoogte: -3, oogOpen: 1, mondOpen: 7, mondKrom: 0.2, mondBreedte: 13 }),
    Object.assign(nieuwBallon(196, 60), { breedte: 176, tekst: 'Meer ijsverkoop, meer verdrinkingen. Kijk dan!', staartDx: -8, staartDy: 62 })
  ];

  const p2 = nieuwPaneel(1.5);
  p2.lucht = '#e8eef2'; p2.grond = '#c9b9a8'; p2.horizon = 70;
  p2.objecten = [
    Object.assign(nieuwDecor('bureau', 78, 268), { schaal: .9 }),
    bert(236, 292, { schouderR: 140, elleboogR: -50, schouderL: 24 }, { brauwHoek: 22, mondOpen: 9, mondKrom: -0.3, mondBreedte: 13 }),
    Object.assign(nieuwBallon(176, 62), { soort: 'roep', breedte: 156, tekst: 'Dan verbieden we het ijs!', staartDx: 46, staartDy: 64 })
  ];

  const p3 = nieuwPaneel(1.5);
  p3.lucht = '#bfe0f2'; p3.grond = '#ecd9a4'; p3.horizon = 58;
  p3.objecten = [
    Object.assign(nieuwDecor('zon', 52, 52), { schaal: .8 }),
    daan(112, 292, { schouderR: 92, elleboogR: -28, schouderL: 14 }, { mondKrom: 0.8, mondOpen: 5, mondBreedte: 12 }),
    bert(238, 292, { schouderL: 30, schouderR: 26 }, { brauwHoogte: -4, oogOpen: 1, mondKrom: -0.2, mondOpen: 4 }),
    Object.assign(nieuwBallon(172, 56), { breedte: 190, tekst: 'Het is gewoon warm. Twee gevolgen, geen oorzaak.', staartDx: -52, staartDy: 62 })
  ];

  s.rijen = [{ id: uid(), panelen: [p1, p2, p3] }];
  return s;
}

let state = loadLocal(STORAGE_KEY) || voorbeeldState();
let selectie = null;          /* {paneelId, objId} of {paneelId} */
let geschiedenis = [];

/* ========================================================================
   HULP
   ===================================================================== */

function allePanelen() {
  return state.rijen.reduce((lijst, rij) => lijst.concat(rij.panelen), []);
}

function vindPaneel(id) {
  return allePanelen().find(p => p.id === id) || null;
}

function actiefPaneel() {
  const p = selectie && vindPaneel(selectie.paneelId);
  return p || allePanelen()[0] || null;
}

function geselecteerdObject() {
  if (!selectie || !selectie.objId) return null;
  const p = vindPaneel(selectie.paneelId);
  return p ? p.objecten.find(o => o.id === selectie.objId) || null : null;
}

function leesPad(obj, pad) {
  return pad.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function schrijfPad(obj, pad, waarde) {
  const delen = pad.split('.');
  const laatste = delen.pop();
  const doel = delen.reduce((o, k) => o[k], obj);
  doel[laatste] = waarde;
}

function bewaarStap() {
  geschiedenis.push(JSON.stringify(state));
  if (geschiedenis.length > 40) geschiedenis.shift();
}

function stapTerug() {
  const vorige = geschiedenis.pop();
  if (!vorige) return;
  state = JSON.parse(vorige);
  if (selectie && !vindPaneel(selectie.paneelId)) selectie = null;
  tekenAlles();
  bewaar();
}

const bewaar = debounce(() => {
  saveLocal(STORAGE_KEY, state);
  showStatus(document.getElementById('st-status'), 'Opgeslagen ✓', 1500);
}, 300);

/* ========================================================================
   HET VEL
   ===================================================================== */

function tekenVel() {
  document.getElementById('st-sheet').innerHTML =
    tekenStripHTML(state, { interactief: true, selectie: selectie });
  markeerSelectie();
}

/* Kader om het gekozen object, op basis van zijn werkelijke afmetingen. */
function markeerSelectie() {
  const obj = geselecteerdObject();
  if (!obj) return;
  const g = document.querySelector(`[data-obj="${obj.id}"]`);
  if (!g) return;
  let vak;
  try { vak = g.getBBox(); } catch (e) { return; }
  const ns = 'http://www.w3.org/2000/svg';
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', vak.x - 4);
  rect.setAttribute('y', vak.y - 4);
  rect.setAttribute('width', vak.width + 8);
  rect.setAttribute('height', vak.height + 8);
  rect.setAttribute('class', 'selectie-kader');
  g.appendChild(rect);
}

/* ========================================================================
   ZIJBALK — EIGENSCHAPPEN
   ===================================================================== */

function schuif(label, pad, waarde, min, max, stap) {
  return `<div class="regelaar">
    <label>${label}<output>${Number(waarde).toFixed(stap < 1 ? 1 : 0)}</output></label>
    <input type="range" data-prop="${pad}" min="${min}" max="${max}" step="${stap}" value="${waarde}">
  </div>`;
}

function kleurVeld(label, pad, waarde) {
  return `<div class="kleur-regel">
    <label>${label}</label>
    <input type="color" data-prop="${pad}" value="${waarde}">
  </div>`;
}

function keuzeVeld(label, pad, opties, waarde) {
  return `<div class="field">
    <label>${label}</label>
    <select data-prop="${pad}">${Object.entries(opties).map(([k, v]) =>
      `<option value="${k}"${k === waarde ? ' selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select>
  </div>`;
}

function schakelaar(label, pad, aan) {
  return `<label class="schakel"><input type="checkbox" data-prop="${pad}"${aan ? ' checked' : ''}> ${label}</label>`;
}

function objectKnoppen() {
  return `<div class="knoppenrij" style="margin-top:.8em;">
    <button class="btn btn-icon" data-actie="naar-voren">Naar voren</button>
    <button class="btn btn-icon" data-actie="naar-achter">Naar achter</button>
    <button class="btn btn-icon" data-actie="dupliceer">Dupliceren</button>
    <button class="btn-danger" data-actie="verwijder">Verwijderen</button>
  </div>`;
}

function renderEigenschappen() {
  const doel = document.getElementById('st-eigenschappen');
  const obj = geselecteerdObject();
  const paneel = actiefPaneel();

  if (!obj) {
    if (!paneel) { doel.innerHTML = '<p class="empty-state">Voeg een vakje toe om te beginnen.</p>'; return; }
    doel.innerHTML = `
      <p class="keuze-uitleg">Vakje geselecteerd. Klik op een figuur, ballon of decorstuk om die aan te passen.</p>
      ${kleurVeld('Lucht / muur', 'lucht', paneel.lucht)}
      ${kleurVeld('Grond / vloer', 'grond', paneel.grond)}
      ${schuif('Horizon', 'horizon', paneel.horizon, 10, 95, 1)}
      ${schakelaar('Rasterpuntjes in de lucht', 'raster', paneel.raster)}
      ${schuif('Breedte van dit vakje', 'gewicht', paneel.gewicht, 0.5, 4, 0.25)}
      <div class="knoppenrij" style="margin-top:.8em;">
        <button class="btn-danger" data-actie="verwijder-vak">Vakje verwijderen</button>
      </div>`;
    return;
  }

  if (obj.type === 'figuur') {
    const p = obj.pose, g = obj.gezicht;
    doel.innerHTML = `
      <p class="keuze-uitleg">Figuur — versleep hem in het vakje, stel hier houding en gezicht in.</p>
      ${schuif('Grootte', 'schaal', obj.schaal, 0.3, 2.5, 0.05)}
      ${schakelaar('Spiegelen (kijkt de andere kant op)', 'spiegel', obj.spiegel)}

      <h4 class="groepkop">Uiterlijk</h4>
      ${kleurVeld('Huid', 'huid', obj.huid)}
      ${kleurVeld('Shirt', 'shirt', obj.shirt)}
      ${kleurVeld('Broek', 'broek', obj.broek)}
      ${kleurVeld('Haar / muts', 'haarKleur', obj.haarKleur)}
      ${keuzeVeld('Kapsel', 'haar', HAARSTIJLEN, obj.haar)}
      <div class="schakelrij">
        ${schakelaar('Bril', 'bril', obj.bril)}
        ${schakelaar('Snor', 'snor', obj.snor)}
        ${schakelaar('Baard', 'baard', obj.baard)}
        ${schakelaar('Blosjes', 'blos', obj.blos)}
      </div>

      <h4 class="groepkop">Houding</h4>
      ${schuif('Hoofd kantelen', 'pose.hoofd', p.hoofd, -25, 25, 1)}
      ${schuif('Benen spreiden', 'pose.benen', p.benen, 0, 22, 1)}
      ${schuif('Linkerarm — schouder', 'pose.schouderL', p.schouderL, -40, 190, 1)}
      ${schuif('Linkerarm — elleboog', 'pose.elleboogL', p.elleboogL, -140, 140, 1)}
      ${schuif('Rechterarm — schouder', 'pose.schouderR', p.schouderR, -40, 190, 1)}
      ${schuif('Rechterarm — elleboog', 'pose.elleboogR', p.elleboogR, -140, 140, 1)}

      <h4 class="groepkop">Gezicht</h4>
      ${schuif('Wenkbrauwen hoek', 'gezicht.brauwHoek', g.brauwHoek, -30, 30, 1)}
      ${schuif('Wenkbrauwen hoogte', 'gezicht.brauwHoogte', g.brauwHoogte, -6, 8, 0.5)}
      ${schuif('Ogen open', 'gezicht.oogOpen', g.oogOpen, 0, 1.6, 0.05)}
      ${schuif('Kijkrichting ←→', 'gezicht.pupilX', g.pupilX, -3, 3, 0.1)}
      ${schuif('Kijkrichting ↑↓', 'gezicht.pupilY', g.pupilY, -3, 3, 0.1)}
      ${schuif('Mond breedte', 'gezicht.mondBreedte', g.mondBreedte, 4, 24, 0.5)}
      ${schuif('Mond kromming', 'gezicht.mondKrom', g.mondKrom, -1, 1, 0.05)}
      ${schuif('Mond open', 'gezicht.mondOpen', g.mondOpen, 0, 16, 0.5)}
      ${objectKnoppen()}`;
    return;
  }

  if (obj.type === 'ballon') {
    doel.innerHTML = `
      <p class="keuze-uitleg">Ballon — versleep de ballon, en het bolletje aan de staart wijst naar wie er praat.</p>
      <div class="field">
        <label>Tekst</label>
        <textarea data-prop="tekst" rows="3">${escapeHtml(obj.tekst)}</textarea>
      </div>
      ${keuzeVeld('Soort', 'soort', BALLONSOORTEN, obj.soort)}
      ${schuif('Breedte', 'breedte', obj.breedte, 60, 340, 2)}
      ${schuif('Tekstgrootte', 'grootte', obj.grootte, 8, 22, 0.5)}
      ${objectKnoppen()}`;
    return;
  }

  if (obj.type === 'tekst') {
    doel.innerHTML = `
      <p class="keuze-uitleg">Tekstblok — voor "later die dag", een plaatsaanduiding of het slotzinnetje.</p>
      <div class="field">
        <label>Tekst</label>
        <textarea data-prop="tekst" rows="2">${escapeHtml(obj.tekst)}</textarea>
      </div>
      ${kleurVeld('Achtergrond', 'kleur', obj.kleur)}
      ${schuif('Breedte', 'breedte', obj.breedte, 60, 360, 2)}
      ${schuif('Tekstgrootte', 'grootte', obj.grootte, 8, 22, 0.5)}
      ${objectKnoppen()}`;
    return;
  }

  doel.innerHTML = `
    <p class="keuze-uitleg">Decorstuk — versleep het, schaal het, of geef het eigen kleuren.</p>
    ${keuzeVeld('Vorm', 'vorm', DECORVORMEN, obj.vorm)}
    ${schuif('Grootte', 'schaal', obj.schaal, 0.2, 3, 0.05)}
    ${schakelaar('Spiegelen', 'spiegel', obj.spiegel)}
    ${kleurVeld('Hoofdkleur', 'kleur1', obj.kleur1 || '#c8b28a')}
    ${kleurVeld('Tweede kleur', 'kleur2', obj.kleur2 || '#8a6a45')}
    ${objectKnoppen()}`;
}

function renderIndeling() {
  const doel = document.getElementById('st-indeling');
  let nummer = 0;
  doel.innerHTML = state.rijen.map((rij, ri) => {
    const vakken = rij.panelen.map((p) => {
      nummer++;
      return `<div class="indeling-vak${selectie && selectie.paneelId === p.id ? ' is-actief' : ''}" data-kies-vak="${p.id}">
        <span>${nummer}</span>
        <button class="btn-icon" data-breedte="-" data-vak-id="${p.id}" title="Smaller">−</button>
        <button class="btn-icon" data-breedte="+" data-vak-id="${p.id}" title="Breder">+</button>
      </div>`;
    }).join('');
    return `<div class="indeling-rij">
      <div class="indeling-vakken">${vakken}</div>
      <div class="knoppenrij">
        <button class="btn btn-icon" data-vak-toevoegen="${ri}">+ Vakje</button>
        <button class="btn-danger" data-rij-verwijderen="${ri}">Rij weg</button>
      </div>
    </div>`;
  }).join('');
}

function renderZijbalk() {
  document.getElementById('st-titel').value = state.titel;
  document.getElementById('st-onderwerp').value = state.ondertitel;
  document.getElementById('st-auteur').value = state.auteur;
  const p = actiefPaneel();
  const nr = allePanelen().indexOf(p) + 1;
  document.getElementById('st-actief-vakje').textContent = nr > 0 ? nr : '–';
  renderEigenschappen();
  renderIndeling();
}

function tekenAlles() {
  tekenVel();
  renderZijbalk();
}

/* ========================================================================
   INTERACTIE
   ===================================================================== */

function svgPunt(svg, evt) {
  const r = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const schaal = Math.max(r.width / vb.width, r.height / vb.height);
  if (!isFinite(schaal) || schaal <= 0) return null;
  return {
    x: (evt.clientX - r.left - (r.width - vb.width * schaal) / 2) / schaal,
    y: (evt.clientY - r.top - (r.height - vb.height * schaal) / 2) / schaal
  };
}

let sleep = null;

document.getElementById('st-sheet').addEventListener('pointerdown', (e) => {
  const greep = e.target.closest('[data-greep]');
  const groep = e.target.closest('[data-obj]');
  const vak = e.target.closest('[data-vak]');
  if (!vak) return;
  const svg = vak.querySelector('svg');
  const punt = svgPunt(svg, e);

  if (!punt) return;

  if (greep) {
    const paneel = vindPaneel(greep.dataset.paneel);
    const obj = paneel.objecten.find(o => o.id === greep.dataset.obj);
    bewaarStap();
    sleep = { soort: 'staart', obj: obj, svg: svg, el: greep };
    return;
  }

  if (groep) {
    const paneel = vindPaneel(groep.dataset.paneel);
    const obj = paneel.objecten.find(o => o.id === groep.dataset.obj);
    if (!obj) return;
    selectie = { paneelId: paneel.id, objId: obj.id };
    bewaarStap();
    sleep = { soort: 'object', obj: obj, dx: punt.x - obj.x, dy: punt.y - obj.y };
    tekenAlles();
    /* Het hertekenen vervangt de elementen, dus vak én figuur opnieuw oppakken. */
    sleep.svg = document.querySelector(`[data-paneel-svg="${paneel.id}"]`);
    sleep.el = document.querySelector(`[data-obj="${obj.id}"]`);
    return;
  }

  selectie = { paneelId: vak.dataset.vak };
  tekenAlles();
});

window.addEventListener('pointermove', (e) => {
  if (!sleep || !sleep.svg) return;
  const punt = svgPunt(sleep.svg, e);
  if (!punt) return;
  if (sleep.soort === 'staart') {
    sleep.obj.staartDx = Math.round(punt.x - sleep.obj.x);
    sleep.obj.staartDy = Math.round(punt.y - sleep.obj.y);
    if (sleep.el) {
      sleep.el.setAttribute('cx', sleep.obj.x + sleep.obj.staartDx);
      sleep.el.setAttribute('cy', sleep.obj.y + sleep.obj.staartDy);
    }
    const g = document.querySelector(`[data-obj="${sleep.obj.id}"]`);
    if (g) g.innerHTML = tekenBallon(sleep.obj);
  } else {
    sleep.obj.x = Math.round(punt.x - sleep.dx);
    sleep.obj.y = Math.round(punt.y - sleep.dy);
    if (sleep.el) {
      const s = sleep.obj.schaal === undefined ? 1 : sleep.obj.schaal;
      sleep.el.setAttribute('transform', `translate(${sleep.obj.x},${sleep.obj.y}) scale(${sleep.obj.spiegel ? -s : s},${s})`);
    }
  }
});

window.addEventListener('pointerup', () => {
  if (!sleep) return;
  sleep = null;
  tekenAlles();
  bewaar();
});

/* Eigenschappen aanpassen */
document.getElementById('st-eigenschappen').addEventListener('input', (e) => {
  const veld = e.target.closest('[data-prop]');
  if (!veld) return;
  const doel = geselecteerdObject() || actiefPaneel();
  if (!doel) return;
  let waarde;
  if (veld.type === 'checkbox') waarde = veld.checked;
  else if (veld.type === 'range') waarde = parseFloat(veld.value);
  else waarde = veld.value;
  schrijfPad(doel, veld.dataset.prop, waarde);

  const uitvoer = veld.parentElement.querySelector('output');
  if (uitvoer) uitvoer.textContent = Number(waarde).toFixed(veld.step < 1 ? 1 : 0);

  tekenVel();
  bewaar();
});

document.getElementById('st-eigenschappen').addEventListener('change', (e) => {
  if (e.target.closest('[data-prop]')) { bewaarStap(); renderIndeling(); }
});

document.getElementById('st-eigenschappen').addEventListener('click', (e) => {
  const knop = e.target.closest('[data-actie]');
  if (!knop) return;
  const paneel = actiefPaneel();
  const obj = geselecteerdObject();
  bewaarStap();

  if (knop.dataset.actie === 'verwijder-vak') {
    state.rijen.forEach(rij => {
      const i = rij.panelen.findIndex(p => p.id === paneel.id);
      if (i > -1) rij.panelen.splice(i, 1);
    });
    state.rijen = state.rijen.filter(r => r.panelen.length);
    selectie = null;
  } else if (obj) {
    const lijst = paneel.objecten;
    const i = lijst.indexOf(obj);
    if (knop.dataset.actie === 'verwijder') { lijst.splice(i, 1); selectie = { paneelId: paneel.id }; }
    if (knop.dataset.actie === 'naar-voren' && i < lijst.length - 1) { lijst.splice(i, 1); lijst.push(obj); }
    if (knop.dataset.actie === 'naar-achter' && i > 0) { lijst.splice(i, 1); lijst.unshift(obj); }
    if (knop.dataset.actie === 'dupliceer') {
      const kopie = JSON.parse(JSON.stringify(obj));
      kopie.id = uid();
      kopie.x += 24; kopie.y += 8;
      lijst.push(kopie);
      selectie = { paneelId: paneel.id, objId: kopie.id };
    }
  }
  tekenAlles();
  bewaar();
});

/* Toevoegen */
document.querySelectorAll('[data-voeg-toe]').forEach(knop => {
  knop.addEventListener('click', () => {
    const paneel = actiefPaneel();
    if (!paneel) return;
    const B = paneelBreedte(paneel);
    const grondY = PANEEL_HOOGTE * (paneel.horizon / 100);
    bewaarStap();
    let obj;
    switch (knop.dataset.voegToe) {
      case 'figuur': obj = nieuwFiguur(Math.round(B / 2), Math.round(grondY + (PANEEL_HOOGTE - grondY) * 0.75)); break;
      case 'ballon': obj = nieuwBallon(Math.round(B / 2), 52); break;
      case 'tekst': obj = nieuwTekst(Math.round(B / 2), 34); break;
      default: obj = nieuwDecor(document.getElementById('st-decor-keuze').value, Math.round(B / 2), Math.round(grondY + 20));
    }
    paneel.objecten.push(obj);
    selectie = { paneelId: paneel.id, objId: obj.id };
    tekenAlles();
    bewaar();
  });
});

/* Indeling */
document.getElementById('st-indeling').addEventListener('click', (e) => {
  const kies = e.target.closest('[data-kies-vak]');
  const breedte = e.target.closest('[data-breedte]');
  const voegToe = e.target.closest('[data-vak-toevoegen]');
  const rijWeg = e.target.closest('[data-rij-verwijderen]');

  if (breedte) {
    const p = vindPaneel(breedte.dataset.vakId);
    bewaarStap();
    p.gewicht = Math.min(4, Math.max(0.5, p.gewicht + (breedte.dataset.breedte === '+' ? 0.25 : -0.25)));
  } else if (voegToe) {
    bewaarStap();
    state.rijen[parseInt(voegToe.dataset.vakToevoegen, 10)].panelen.push(nieuwPaneel());
  } else if (rijWeg) {
    bewaarStap();
    state.rijen.splice(parseInt(rijWeg.dataset.rijVerwijderen, 10), 1);
    selectie = null;
  } else if (kies) {
    selectie = { paneelId: kies.dataset.kiesVak };
  } else return;

  tekenAlles();
  bewaar();
});

document.getElementById('st-rij-toevoegen').addEventListener('click', () => {
  bewaarStap();
  state.rijen.push({ id: uid(), panelen: [nieuwPaneel(), nieuwPaneel(), nieuwPaneel()] });
  tekenAlles();
  bewaar();
});

/* Kopregels */
[['st-titel', 'titel'], ['st-onderwerp', 'ondertitel'], ['st-auteur', 'auteur']].forEach(([id, sleutel]) => {
  document.getElementById(id).addEventListener('input', (e) => {
    state[sleutel] = e.target.value;
    tekenVel();
    bewaar();
  });
});

/* Toetsenbord: verwijderen, verschuiven, ongedaan maken */
window.addEventListener('keydown', (e) => {
  const inVeld = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); stapTerug(); return; }
  if (inVeld) return;
  const obj = geselecteerdObject();
  if (!obj) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    bewaarStap();
    const paneel = actiefPaneel();
    paneel.objecten.splice(paneel.objecten.indexOf(obj), 1);
    selectie = { paneelId: paneel.id };
    tekenAlles(); bewaar();
  }
  const stap = e.shiftKey ? 10 : 2;
  const verplaats = { ArrowLeft: [-stap, 0], ArrowRight: [stap, 0], ArrowUp: [0, -stap], ArrowDown: [0, stap] }[e.key];
  if (verplaats) {
    e.preventDefault();
    obj.x += verplaats[0];
    obj.y += verplaats[1];
    tekenVel(); bewaar();
  }
});

/* ========================================================================
   WERKBALK
   ===================================================================== */

document.getElementById('st-btn-nieuw').addEventListener('click', () => {
  if (!confirm('Dit wist de huidige strip. Doorgaan?')) return;
  bewaarStap();
  state = defaultState();
  selectie = null;
  tekenAlles(); bewaar();
});

document.getElementById('st-btn-voorbeeld').addEventListener('click', () => {
  if (!confirm('Dit vervangt de huidige strip door het voorbeeld. Doorgaan?')) return;
  bewaarStap();
  state = voorbeeldState();
  selectie = null;
  tekenAlles(); bewaar();
});

document.getElementById('st-btn-undo').addEventListener('click', stapTerug);

document.getElementById('st-btn-export').addEventListener('click', () => {
  const naam = (state.titel || 'cono-strip').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  exporteerJSON(`${naam}.json`, state);
});

document.getElementById('st-input-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readJSONFile(file, (data) => {
    if (!data || !Array.isArray(data.rijen)) { alert('Dit lijkt geen strip-bestand te zijn.'); return; }
    bewaarStap();
    state = data;
    selectie = null;
    tekenAlles(); bewaar();
  }, () => alert('Dit bestand kon niet worden gelezen.'));
  e.target.value = '';
});

document.getElementById('st-btn-print').addEventListener('click', () => {
  selectie = null;
  tekenAlles();
  window.print();
});

/* ========================================================================
   REGIE — strip uit een verhaal
   ===================================================================== */

function melding(tekst, soort) {
  const el = document.getElementById('st-melding');
  el.textContent = tekst || '';
  el.className = 'regie-melding' + (soort ? ' is-' + soort : '');
}

/* LLM's zetten hun antwoord vaak tussen ```-hekjes of met een zin ervoor. */
function pluisJSON(tekst) {
  const schoon = String(tekst || '').replace(/```[a-z]*\s*/gi, '').trim();
  const van = schoon.indexOf('{');
  const tot = schoon.lastIndexOf('}');
  if (van === -1 || tot <= van) throw new Error('Geen JSON gevonden in dit antwoord.');
  return JSON.parse(schoon.slice(van, tot + 1));
}

function toonUitScript(script) {
  const nieuw = bouwUitScript(script);
  bewaarStap();
  state = nieuw;
  selectie = { paneelId: allePanelen()[0].id };
  tekenAlles();
  bewaar();
}

document.getElementById('st-btn-prompt').addEventListener('click', () => {
  const verhaal = document.getElementById('st-verhaal').value;
  if (!verhaal.trim()) { melding('Schrijf eerst je verhaal hierboven.', 'fout'); return; }
  const prompt = stripPrompt(verhaal);
  const klaar = () => {
    melding('Prompt gekopieerd. Plak hem in ChatGPT, Claude of Copilot en zet het antwoord hieronder terug.', 'goed');
    document.getElementById('st-plak-blok').open = true;
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(klaar, () => {
      document.getElementById('st-script').value = prompt;
      document.getElementById('st-plak-blok').open = true;
      melding('Kopiëren mocht niet. De prompt staat nu in het plakvak — knip hem daaruit.', 'fout');
    });
  } else {
    document.getElementById('st-script').value = prompt;
    document.getElementById('st-plak-blok').open = true;
    melding('Kopiëren kan hier niet. De prompt staat in het plakvak.', 'fout');
  }
});

document.getElementById('st-btn-bouw').addEventListener('click', () => {
  const ruw = document.getElementById('st-script').value;
  if (!ruw.trim()) { melding('Plak eerst het antwoord van de LLM.', 'fout'); return; }
  try {
    toonUitScript(pluisJSON(ruw));
    melding('Strip gebouwd. Je kunt alles nu met de hand bijschuiven.', 'goed');
  } catch (fout) {
    melding('Dit lukte niet: ' + fout.message, 'fout');
  }
});

/* In de gedeelde online versie kan de pagina Claude zelf om het draaiboek
   vragen. Elders blijft alleen de kopieer-en-plak route over. */
const claudeKnop = document.getElementById('st-btn-claude');
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('sample').then((sample) => {
    if (!sample) return;
    claudeKnop.hidden = false;
    claudeKnop.addEventListener('click', () => {
      const verhaal = document.getElementById('st-verhaal').value;
      if (!verhaal.trim()) { melding('Schrijf eerst je verhaal hierboven.', 'fout'); return; }
      claudeKnop.disabled = true;
      melding('Claude schrijft het draaiboek...');
      sample.json(stripPrompt(verhaal), { modelTier: 'default' }).then((script) => {
        try {
          toonUitScript(script);
          melding('Klaar. Niet tevreden? Klik nog eens — elke keer is anders.', 'goed');
        } catch (fout) {
          melding('Het draaiboek klopte niet: ' + fout.message, 'fout');
        }
      }, (fout) => {
        melding(fout && fout.code === 'declined' ? 'Geannuleerd.' : 'Het lukte niet om het draaiboek op te halen.', 'fout');
      }).then(() => { claudeKnop.disabled = false; });
    });
  });
}

/* ========================================================================
   START
   ===================================================================== */

document.getElementById('st-decor-keuze').innerHTML =
  Object.entries(DECORVORMEN).map(([k, v]) => `<option value="${k}">${escapeHtml(v)}</option>`).join('');

if (allePanelen().length) selectie = { paneelId: allePanelen()[0].id };
tekenAlles();
/* Meteen vastleggen, zodat de nieuwsbrief de strip kan ophalen zonder dat
   er eerst iets gewijzigd hoeft te worden. */
saveLocal(STORAGE_KEY, state);
