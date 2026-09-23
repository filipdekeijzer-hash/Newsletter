/* CONO Strip maker — de regisseur.
 *
 * Een LLM schrijft alleen het draaiboek: wie staat er in beeld, wat zegt
 * diegene, met welk gezicht en in welk decor. Alles daarna — de figuren
 * neerzetten, de armen in de juiste houding draaien, de ballon boven de
 * spreker hangen en de staart naar zijn hoofd wijzen, het decor opbouwen —
 * gebeurt hier. Daardoor levert elk verhaal een andere strip op, terwijl de
 * vormgeving elke keer dezelfde is.
 */

/* Woorden uit het draaiboek vertaald naar gezichtswaarden. */
const EMOTIE_KAART = {
  neutraal:    { brauwHoek: 0, brauwHoogte: 0, oogOpen: 1, pupilX: 0, pupilY: 0, mondBreedte: 11, mondKrom: 0.3, mondOpen: 0 },
  blij:        { brauwHoek: -6, brauwHoogte: 2, oogOpen: 0.7, pupilX: 0, pupilY: 0, mondBreedte: 14, mondKrom: 0.9, mondOpen: 6 },
  verbaasd:    { brauwHoek: -10, brauwHoogte: 5, oogOpen: 1.5, pupilX: 0, pupilY: 0, mondBreedte: 9, mondKrom: 0.1, mondOpen: 9 },
  verward:     { brauwHoek: 14, brauwHoogte: 2, oogOpen: 1.1, pupilX: 1.2, pupilY: 0, mondBreedte: 9, mondKrom: -0.2, mondOpen: 2 },
  denkend:     { brauwHoek: 8, brauwHoogte: 1, oogOpen: 0.85, pupilX: 1.6, pupilY: -1.6, mondBreedte: 8, mondKrom: -0.1, mondOpen: 0 },
  fel:         { brauwHoek: 24, brauwHoogte: -3, oogOpen: 1.1, pupilX: 0, pupilY: 0, mondBreedte: 13, mondKrom: -0.5, mondOpen: 5 },
  geschrokken: { brauwHoek: -16, brauwHoogte: 6, oogOpen: 1.6, pupilX: 0, pupilY: 0, mondBreedte: 10, mondKrom: -0.2, mondOpen: 12 },
  verdrietig:  { brauwHoek: -18, brauwHoogte: 1, oogOpen: 0.8, pupilX: 0, pupilY: 1, mondBreedte: 10, mondKrom: -0.8, mondOpen: 0 },
  trots:       { brauwHoek: -4, brauwHoogte: 1, oogOpen: 0.7, pupilX: 0, pupilY: -0.8, mondBreedte: 12, mondKrom: 0.7, mondOpen: 0 },
  moe:         { brauwHoek: -10, brauwHoogte: -2, oogOpen: 0.35, pupilX: 0, pupilY: 0.6, mondBreedte: 9, mondKrom: -0.3, mondOpen: 0 }
};

/* Woorden uit het draaiboek vertaald naar armstanden. */
const GEBAAR_KAART = {
  'neutraal':          { schouderL: 12, elleboogL: 18, schouderR: 12, elleboogR: 18, benen: 6 },
  'wijst':             { schouderL: 14, elleboogL: 18, schouderR: 106, elleboogR: -30, benen: 8 },
  'armen-omhoog':      { schouderL: 158, elleboogL: 14, schouderR: 158, elleboogR: 14, benen: 8 },
  'hand-op-kin':       { schouderL: 16, elleboogL: 20, schouderR: 34, elleboogR: -116, benen: 4 },
  'armen-over-elkaar': { schouderL: 54, elleboogL: -94, schouderR: 54, elleboogR: -94, benen: 6 },
  'zwaait':            { schouderL: 12, elleboogL: 18, schouderR: 148, elleboogR: -30, benen: 8 },
  'handen-spreiden':   { schouderL: 84, elleboogL: 28, schouderR: 84, elleboogR: 28, benen: 10 },
  'wijst-omhoog':      { schouderL: 14, elleboogL: 18, schouderR: 166, elleboogR: -18, benen: 6 }
};

/* Decors: achtergrondkleuren plus een paar decorstukken op vaste plekken.
   x en y zijn breuken van de vakjebreedte en -hoogte. */
const DECOR_KAART = {
  kantoor: { lucht: '#e9eef1', grond: '#c9b9a8', horizon: 68, stukken: [
    { vorm: 'bureau', x: .1, y: .97, schaal: .8 },
    { vorm: 'beeldscherm', x: .1, y: .79, schaal: .42 },
    { vorm: 'plant', x: .93, y: .99, schaal: .75 }
  ] },
  vergaderzaal: { lucht: '#f1ead9', grond: '#d3bf97', horizon: 68, stukken: [
    { vorm: 'whiteboard', x: .62, y: .71, schaal: .62 },
    { vorm: 'stoel', x: .07, y: .97, schaal: .7 },
    { vorm: 'tafel', x: .94, y: 1.04, schaal: 1 }
  ] },
  kaasfabriek: { lucht: '#f4e6c6', grond: '#d9c496', horizon: 66, stukken: [
    { vorm: 'vat', x: .07, y: .98, schaal: .85 },
    { vorm: 'kaaswiel', x: .18, y: 1.01, schaal: .7 },
    { vorm: 'melkbus', x: .93, y: .97, schaal: .75 }
  ] },
  wei: { lucht: '#bfe0f2', grond: '#88b864', horizon: 55, stukken: [
    { vorm: 'boom', x: .1, y: .6, schaal: .8 },
    { vorm: 'hek', x: .3, y: .68, schaal: .7 },
    { vorm: 'koe', x: .87, y: .92, schaal: .62 }
  ] },
  boerderij: { lucht: '#bfe0f2', grond: '#9dbd72', horizon: 58, stukken: [
    { vorm: 'huis', x: .2, y: .66, schaal: .62 },
    { vorm: 'schuur', x: .79, y: .68, schaal: .55 },
    { vorm: 'hek', x: .09, y: .97, schaal: .8 }
  ] },
  strand: { lucht: '#bfe0f2', grond: '#ecd9a4', horizon: 58, stukken: [
    { vorm: 'zon', x: .87, y: .16, schaal: .75 },
    { vorm: 'wolk', x: .22, y: .2, schaal: .6 }
  ] },
  thuis: { lucht: '#ecdfd0', grond: '#c3a27c', horizon: 70, stukken: [
    { vorm: 'plant', x: .04, y: .98, schaal: .7 },
    { vorm: 'stoel', x: .14, y: .97, schaal: .8 },
    { vorm: 'tafel', x: .92, y: 1, schaal: .85 }
  ] },
  buiten: { lucht: '#c6e3f4', grond: '#9dbd72', horizon: 60, stukken: [
    { vorm: 'wolk', x: .28, y: .17, schaal: .55 },
    { vorm: 'boom', x: .88, y: .66, schaal: .75 },
    { vorm: 'struik', x: .08, y: .97, schaal: .8 }
  ] },
  feest: { lucht: '#f6e3b4', grond: '#dcc38b', horizon: 64, stukken: [
    { vorm: 'plant', x: .05, y: .98, schaal: .65 },
    { vorm: 'tafel', x: .91, y: 1.02, schaal: 1 },
    { vorm: 'kaaswiel', x: .91, y: .86, schaal: .55 }
  ] }
};

const SHIRT_PALET = ['#3a7bbf', '#c8262a', '#4d6b3c', '#d9a441', '#6f5aa8', '#2f8f8a', '#c2704a', '#55606b'];
const HUID_PALET = ['#f5d6b4', '#f0c69c', '#e0ab7d', '#c98d5f', '#a4653d', '#7d4b2a'];
const HAAR_PALET = ['#2b2118', '#4a3426', '#8a6236', '#c08a3a', '#8d8d8d', '#5a3a2a'];
const BROEK_PALET = ['#3f4a57', '#4d6b3c', '#5a4636', '#2f3b48', '#6b5545'];

function getalUitNaam(naam) {
  let som = 0;
  for (let i = 0; i < naam.length; i++) som = (som * 31 + naam.charCodeAt(i)) % 100000;
  return som;
}

/* Een naam zonder opgegeven uiterlijk krijgt altijd hetzelfde uiterlijk,
   zodat dezelfde persoon er in elk vakje hetzelfde uitziet. */
function figuurUitNaam(naam, opgegeven) {
  const n = getalUitNaam(String(naam || 'figuur').toLowerCase());
  const basis = nieuwFiguur(0, 0);
  const gegeven = opgegeven || {};
  basis.huid = gegeven.huid || HUID_PALET[n % HUID_PALET.length];
  basis.shirt = gegeven.shirt || SHIRT_PALET[(n >> 2) % SHIRT_PALET.length];
  basis.broek = gegeven.broek || BROEK_PALET[(n >> 4) % BROEK_PALET.length];
  basis.haarKleur = gegeven.haarKleur || HAAR_PALET[(n >> 6) % HAAR_PALET.length];
  basis.haar = HAARSTIJLEN[gegeven.haar] ? gegeven.haar : Object.keys(HAARSTIJLEN)[n % 6];
  basis.bril = !!gegeven.bril;
  basis.snor = !!gegeven.snor;
  basis.baard = !!gegeven.baard;
  basis.blos = !!gegeven.blos;
  return basis;
}

function normaliseer(woord) {
  return String(woord || '').toLowerCase().trim().replace(/\s+/g, '-');
}

/* ---------------------------------------------------------------------- */

function bouwUitScript(script) {
  if (!script || typeof script !== 'object') throw new Error('Geen leesbaar draaiboek gevonden.');
  const vakjes = Array.isArray(script.vakjes) ? script.vakjes.filter(v => v && typeof v === 'object') : [];
  if (!vakjes.length) throw new Error('Het draaiboek bevat geen "vakjes".');
  if (vakjes.length > 6) vakjes.length = 6;

  const cast = {};
  (Array.isArray(script.personages) ? script.personages : []).forEach(p => {
    if (p && p.naam) cast[normaliseer(p.naam)] = p;
  });

  /* Indeling: vier vakjes worden twee rijen van twee, zes worden twee rijen
     van drie. Dat leest als een krantenstrip en past op een nieuwsbriefpagina. */
  /* Eén rij leest als een krantenstrip en kost de minste hoogte op de
     nieuwsbriefpagina; pas vanaf vijf vakjes gaat het over twee rijen. */
  const verdeling = { 1: [1], 2: [2], 3: [3], 4: [4], 5: [3, 2], 6: [3, 3] }[vakjes.length] || [vakjes.length];
  const gewicht = { 1: 3, 2: 2.2, 3: 1.5, 4: 1.15 };

  const rijen = [];
  let index = 0;
  verdeling.forEach(aantal => {
    const panelen = [];
    for (let i = 0; i < aantal; i++) panelen.push(bouwPaneel(vakjes[index++], cast, gewicht[aantal] || 1.5));
    rijen.push({ id: uid(), panelen: panelen });
  });

  return {
    titel: script.titel || 'CONO Strip',
    ondertitel: script.ondertitel || '',
    auteur: script.auteur || 'Data-team CONO',
    rijen: rijen
  };
}

function bouwPaneel(vakje, cast, gewicht) {
  const paneel = nieuwPaneel(gewicht);
  const B = paneelBreedte(paneel);
  const decor = DECOR_KAART[normaliseer(vakje.decor)] || DECOR_KAART.kantoor;

  paneel.lucht = decor.lucht;
  paneel.grond = decor.grond;
  paneel.horizon = decor.horizon;

  decor.stukken.forEach(stuk => {
    const obj = nieuwDecor(stuk.vorm, Math.round(stuk.x * B), Math.round(stuk.y * PANEEL_HOOGTE));
    obj.schaal = stuk.schaal;
    paneel.objecten.push(obj);
  });

  /* Figuren: één in het midden, twee tegenover elkaar, drie naast elkaar. */
  const namen = (Array.isArray(vakje.wie) ? vakje.wie : []).filter(Boolean).slice(0, 3);
  const plekken = { 1: [0.5], 2: [0.29, 0.71], 3: [0.17, 0.5, 0.83] }[namen.length] || [];
  const figuurSchaal = namen.length >= 3 ? 0.74 : (namen.length === 2 ? 0.9 : 1);
  const spreker = normaliseer(vakje.spreker);
  let sprekerX = B / 2;
  let sprekerSchaal = figuurSchaal;

  namen.forEach((naam, i) => {
    const sleutel = normaliseer(naam);
    const fig = figuurUitNaam(naam, cast[sleutel]);
    fig.x = Math.round(plekken[i] * B);
    fig.y = 294;
    fig.schaal = figuurSchaal;
    /* De laatste figuur kijkt naar binnen, zodat ze elkaar aankijken. */
    fig.spiegel = namen.length > 1 && i === namen.length - 1;

    const isSpreker = sleutel === spreker;
    const gebaar = GEBAAR_KAART[normaliseer(isSpreker ? vakje.gebaar : 'neutraal')] || GEBAAR_KAART.neutraal;
    const emotie = EMOTIE_KAART[normaliseer(isSpreker ? vakje.emotie : vakje.emotieBijrol)] ||
                   (isSpreker ? EMOTIE_KAART.neutraal : EMOTIE_KAART.neutraal);
    fig.pose = Object.assign({ hoofd: 0 }, fig.pose, gebaar);
    fig.gezicht = Object.assign({}, fig.gezicht, emotie);

    if (isSpreker) { sprekerX = fig.x; sprekerSchaal = fig.schaal; }
    paneel.objecten.push(fig);
  });

  const heeftBijschrift = !!(vakje.bijschrift && String(vakje.bijschrift).trim());
  if (heeftBijschrift) {
    const blok = nieuwTekst(Math.round(B / 2), 24);
    blok.tekst = String(vakje.bijschrift).trim();
    blok.breedte = B - 22;
    blok.grootte = 11;
    paneel.objecten.push(blok);
  }

  const tekst = String(vakje.tekst || '').trim();
  if (tekst) {
    const ballon = nieuwBallon(0, 0);
    ballon.tekst = tekst;
    ballon.soort = BALLONSOORTEN[normaliseer(vakje.ballon)] ? normaliseer(vakje.ballon) : 'spreek';
    ballon.grootte = tekst.length > 90 ? 11 : 12.5;
    ballon.breedte = Math.max(110, Math.min(B - 24, tekst.length * 3.6 + 46));

    const hoogte = ballonMaten(ballon).hoogte;
    const hoofdTop = 294 - 143 * sprekerSchaal;
    const boven = (heeftBijschrift ? 52 : 12) + hoogte / 2;
    const onder = hoofdTop - 16 - hoogte / 2;
    ballon.x = Math.round(Math.max(ballon.breedte / 2 + 8, Math.min(B - ballon.breedte / 2 - 8, sprekerX)));
    ballon.y = Math.round(onder > boven ? onder : boven);
    ballon.staartDx = Math.round(sprekerX - ballon.x);
    ballon.staartDy = Math.round(hoofdTop - 4 - ballon.y);
    paneel.objecten.push(ballon);
  }

  return paneel;
}

/* ---------------------------------------------------------------------- */

/* De prompt die het draaiboek laat schrijven. Dezelfde tekst staat in
   prompts/6-strip-uit-verhaal.txt, om met de hand te gebruiken. */
function stripPrompt(verhaal) {
  return `Je schrijft het draaiboek voor een strip in de interne nieuwsbrief van
CONO Kaasmakers, een zuivelcoöperatie. De strip hoort bij de rubriek
JargonJudo: een moeilijk begrip wordt uitgelegd met een grap. De lezers zijn
collega's van alle afdelingen en zijn geen data-experts.

HET VERHAAL VAN DEZE EDITIE:
${verhaal.trim() || '(vul hier het verhaal in)'}

Je tekent niets. Je levert alleen een draaiboek als JSON, dat door een
tekenprogramma wordt omgezet in de strip. Houd je exact aan onderstaand
formaat en verzin geen extra velden.

VASTE STRUCTUUR — altijd precies 4 vakjes, in deze opbouw:
  1. de situatie: wat is er aan de hand
  2. de complicatie: iemand trekt een logische maar foute conclusie
  3. de omslag: iemand anders zet er een vraag of observatie tegenover
  4. de clou: de korte zin die de lezer onthoudt

REGELS
- Nederlands, spreektaal, geen jargon zonder uitleg.
- Per vakje maximaal 14 woorden tekst. Ze moeten in een ballon passen.
- Niemand wordt voor gek gezet: wie het mis heeft, heeft een begrijpelijk punt.
- Gebruik dezelfde personages in meerdere vakjes, zodat het één verhaal is.
- Antwoord met UITSLUITEND de JSON, zonder uitleg eromheen.

TOEGESTANE WAARDEN
  decor:   kantoor, vergaderzaal, kaasfabriek, wei, boerderij, strand, thuis, buiten, feest
  emotie:  neutraal, blij, verbaasd, verward, denkend, fel, geschrokken, verdrietig, trots, moe
  gebaar:  neutraal, wijst, armen-omhoog, hand-op-kin, armen-over-elkaar, zwaait, handen-spreiden, wijst-omhoog
  ballon:  spreek, denk, roep
  haar:    kort, scheiding, stekels, krullen, staart, kaal, pet, muts

FORMAAT
{
  "titel": "JargonJudo",
  "ondertitel": "het begrip dat wordt uitgelegd",
  "auteur": "Data-team CONO",
  "personages": [
    { "naam": "Daan", "haar": "kort", "bril": true, "shirt": "#3a7bbf" },
    { "naam": "Bert", "haar": "muts", "snor": true, "shirt": "#f2efe4" }
  ],
  "vakjes": [
    {
      "decor": "kantoor",
      "wie": ["Daan", "Bert"],
      "spreker": "Daan",
      "emotie": "verbaasd",
      "gebaar": "wijst",
      "ballon": "spreek",
      "tekst": "Wat er gezegd wordt, maximaal 14 woorden.",
      "bijschrift": ""
    }
  ]
}

Toelichting bij de velden:
- "wie": één tot drie namen die in dat vakje in beeld staan.
- "spreker": wie van hen praat. Laat weg als niemand praat.
- "emotie" en "gebaar" gelden voor de spreker.
- "bijschrift": alleen invullen voor een tijdsprong ("Twee weken later..."),
  anders een lege tekst.
- "personages": kleuren en kenmerken zijn optioneel; laat je ze weg, dan
  krijgt de naam automatisch een vast uiterlijk.`;
}
