/*
 * Bouwt één zelfstandige HTML-pagina uit de losse bestanden van dit project.
 *
 *   node build-artifact.js
 *
 * Het resultaat (dist/index.html) bevat de nieuwsbrief-bouwer en de strip
 * maker als twee tabbladen, met alle CSS en JavaScript erin gebakken. Dat is
 * het bestand dat gepubliceerd wordt als deelbare link: één bestand, geen
 * losse onderdelen die mee moeten verhuizen.
 *
 * De losse pagina's (index.html, nieuwsbrief.html, strip.html) blijven
 * gewoon werken; dit script leest ze alleen uit.
 */

const fs = require('fs');
const path = require('path');

const lees = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');

/* Haalt een blok uit de HTML, van de openingstag tot en met de sluittag. */
function knipBlok(html, start, eind, bestand) {
  const van = html.indexOf(start);
  const tot = html.indexOf(eind, van);
  if (van === -1 || tot === -1) throw new Error(`Blok "${start}" niet gevonden in ${bestand}`);
  return html.slice(van, tot + eind.length);
}

/* Links tussen de losse pagina's worden in de gebundelde versie tabbladen. */
function herschrijfLinks(html) {
  return html
    .replace(/href="strip\.html"/g, 'href="#strip" data-tab="strip"')
    .replace(/href="nieuwsbrief\.html"/g, 'href="#nieuwsbrief" data-tab="nieuwsbrief"');
}

const huisstijl = lees('assets/css/huisstijl.css');
const stijl = lees('assets/css/style.css');

/* De Google Fonts-regel moet als <link> in de pagina staan, niet als @import
   binnen een <style> — inline @import wordt in sommige omgevingen genegeerd. */
const fontMatch = huisstijl.match(/@import url\('([^']+)'\);/);
const fontHref = fontMatch ? fontMatch[1] : null;
const huisstijlZonderImport = huisstijl.replace(/@import url\('[^']+'\);\n?/, '');

const nieuwsbriefHtml = lees('nieuwsbrief.html');
const stripHtml = lees('strip.html');

const nieuwsbriefToolbar = knipBlok(nieuwsbriefHtml, '<div class="toolbar">', '</div>', 'nieuwsbrief.html');
const nieuwsbriefMain = herschrijfLinks(knipBlok(nieuwsbriefHtml, '<main class="layout">', '</main>', 'nieuwsbrief.html'));
const stripToolbar = knipBlok(stripHtml, '<div class="toolbar">', '</div>', 'strip.html');
const stripMain = herschrijfLinks(knipBlok(stripHtml, '<main class="layout">', '</main>', 'strip.html'));

const gedeeld = lees('assets/js/shared.js');
const nieuwsbriefJs = lees('assets/js/nieuwsbrief.js');
const stripJs = lees('assets/js/stripmaker.js');
const regisseurJs = lees('assets/js/regisseur.js');

/* Elke tool krijgt zijn eigen scope, zodat gelijknamige functies en
   variabelen in de twee bestanden elkaar niet overschrijven. */
const inScope = (...delen) => `(function () {\n${delen.join('\n')}\n})();`;

const shellCss = `
/* --- Tabbladen (alleen in de gebundelde versie) --- */
[hidden] { display: none !important; }
.tabbalk { display: flex; gap: .5em; flex-wrap: wrap; }
.tabknop {
  color: #fff;
  background: rgba(255,255,255,.12);
  border: none;
  padding: .5em .9em;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: .9rem;
  cursor: pointer;
}
.tabknop[aria-selected="true"] { background: var(--cono-gold); color: var(--cono-green-dark); }
.tabknop:focus-visible { outline: 3px solid var(--cono-gold-light); outline-offset: 2px; }
`;

/* De charset-regel hoort bij de eerste bytes van het bestand: zonder deze
   regel leest een browser de accenten en emoji verkeerd wanneer het bestand
   los wordt geopend of ergens anders wordt gehost. */
const pagina = `<meta charset="utf-8">
<title>CONO Databericht Bouwer</title>
${fontHref ? `<link rel="stylesheet" href="${fontHref}">` : ''}
<style>
${huisstijlZonderImport}
${stijl}
${shellCss}
</style>

<header class="topbar">
  <span class="brand">
    <span class="logo-badge">CK</span>
    <span class="brand-text">
      <span class="name">CONO Kaasmakers</span>
      <span class="tag">Databericht — nieuwsbrief &amp; strip</span>
    </span>
  </span>
  <nav class="tabbalk" role="tablist" aria-label="Onderdelen">
    <button type="button" class="tabknop" role="tab" data-tab="nieuwsbrief" aria-selected="true" aria-controls="paneel-nieuwsbrief" id="tab-nieuwsbrief">📰 Nieuwsbrief</button>
    <button type="button" class="tabknop" role="tab" data-tab="strip" aria-selected="false" aria-controls="paneel-strip" id="tab-strip">🥋 Strip maker</button>
  </nav>
</header>

<section id="paneel-nieuwsbrief" role="tabpanel" aria-labelledby="tab-nieuwsbrief">
${nieuwsbriefToolbar}
${nieuwsbriefMain}
</section>

<section id="paneel-strip" role="tabpanel" aria-labelledby="tab-strip" hidden>
${stripToolbar}
${stripMain}
</section>

<footer class="site-footer">Intern sjabloon voor het datamanagement-project bij CONO Kaasmakers. De kleuren zijn nog een voorlopige huisstijl.</footer>

<script>
${inScope(gedeeld, nieuwsbriefJs)}
${inScope(gedeeld, stripJs, regisseurJs)}

(function () {
  var TAB_KEY = 'cono_actief_tabblad';
  var panelen = {
    nieuwsbrief: document.getElementById('paneel-nieuwsbrief'),
    strip: document.getElementById('paneel-strip')
  };
  var knoppen = Array.prototype.slice.call(document.querySelectorAll('.tabknop'));

  function toon(naam) {
    if (!panelen[naam]) return;
    Object.keys(panelen).forEach(function (sleutel) {
      panelen[sleutel].hidden = (sleutel !== naam);
    });
    knoppen.forEach(function (knop) {
      knop.setAttribute('aria-selected', String(knop.dataset.tab === naam));
    });
    try { localStorage.setItem(TAB_KEY, naam); } catch (e) { /* geen opslag beschikbaar */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-tab]');
    if (!trigger) return;
    e.preventDefault();
    toon(trigger.dataset.tab);
  });

  try {
    var bewaard = localStorage.getItem(TAB_KEY);
    if (bewaard && panelen[bewaard]) toon(bewaard);
  } catch (e) { /* geen opslag beschikbaar */ }
})();
</script>
`;

const uit = path.join(__dirname, 'dist');
fs.mkdirSync(uit, { recursive: true });
fs.writeFileSync(path.join(uit, 'index.html'), pagina, 'utf8');
console.log('dist/index.html geschreven (' + Math.round(pagina.length / 1024) + ' KB)');
