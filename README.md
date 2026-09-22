# CONO Nieuwsbrief &amp; Strip bouwer

Een sjabloon-website (Nederlandstalig) om een terugkerende CONO-nieuwsbrief over
datamanagement te bouwen, en een bijpassende strip te maken. Puur HTML/CSS/JS,
geen installatie of build-stap nodig — gewoon openen in de browser.

## Openen

Open `index.html` in een browser (dubbelklikken volstaat), of host de map als
statische site (GitHub Pages, Netlify, een interne webserver, etc.).

## Onderdelen

- **`index.html`** — landingspagina met uitleg en links naar de twee tools.
- **`nieuwsbrief.html`** — de nieuwsbrief-bouwer. Links vul je secties in
  (voorwoord, "wist-je-dat" voorbeelden uit artikelen/papers, onderwerpen in
  simpele taal, cijfers, quotes, vrije tekst), rechts zie je direct de
  opgemaakte nieuwsbrief.
- **`strip.html`** — de stripmaker. Vaste opmaak van 6 vakjes met twee
  vaste personages (Data-Daan en Boer Bert); per editie vul je alleen in wie
  wat zegt, in welk decor. Zo blijft de vormgeving herkenbaar, maar is elke
  strip inhoudelijk anders.
- **`assets/css/style.css`** — alle styling, inclusief de CONO-kleurenset
  (zie hieronder) en de print-opmaak.
- **`assets/js/shared.js`** — gedeelde hulpfuncties (opslaan, JSON in-/export).
- **`assets/js/nieuwsbrief.js`**, **`assets/js/strip.js`** — logica van
  de twee bouwers.

## Werking

- Alles wat je invult wordt automatisch opgeslagen in de browser
  (`localStorage`), dus tussentijds verlies je niets.
- **Exporteer JSON** downloadt de huidige editie als bestand — handig om te
  delen met een collega of te bewaren als archief van oudere edities.
- **Importeer JSON** laadt zo'n bestand weer in om verder te werken.
- **Print / Opslaan als PDF** gebruikt de reguliere afdrukfunctie van de
  browser; de bewerkbalk en formuliervelden worden dan verborgen zodat je een
  nette, afdrukbare pagina overhoudt.
- **Voorbeeld invullen** zet in beide tools een volledig ingevulde
  voorbeeldeditie neer, zodat je meteen ziet hoe het eruit hoort te zien.

## Belangrijk: huisstijl is een placeholder

Er was bij het maken van dit sjabloon geen officiële CONO-huisstijlgids of
logo-bestand beschikbaar. De huidige kleuren (kaas-goud, warm rood,
weiland-groen, romig crème) en het "CK"-badge-logo zijn een sfeer-benadering,
geen officiële huisstijl. Zodra de echte kleuren, het logo en eventuele
lettertypen bekend zijn:

1. Open `assets/css/style.css`.
2. Pas de variabelen bovenaan onder `:root` aan (`--cono-red`, `--cono-gold`,
   `--cono-green`, `--cono-cream`, `--font-heading`, `--font-body`, ...).
3. Vervang het `.logo-badge`-element (in elke HTML-pagina) door het echte
   logo, bijvoorbeeld als `<img>`.

Omdat alle pagina's uit dezelfde CSS-variabelen putten, is dit een
centrale wijziging.

## De strip: personages en decors

De strip gebruikt twee vaste, eenvoudig getekende personages zodat elke
editie herkenbaar blijft:

- **Data-Daan** — het datateam, herkenbaar aan het blauwe shirt en het
  tablet/grafiekje.
- **Boer Bert** — de praktijk op de vloer/boerderij, herkenbaar aan de
  groene overall en het kaaswiel.

Daarnaast is er een **Verteller** (tekstbalk bovenaan, voor tijdsprongen of
context) en de optie **Geen spreker** (alleen beeld, eventueel met een kort
bijschrift). Per vakje kies je ook een decor (kaasfabriek, kantoor,
vergaderzaal, buiten/wei, laptop-close-up, feestje) — dit zijn simpele
vector-tekeningen (SVG) die met de brand-kleuren meekleuren.

Dit is bewust een lichte, vectorstijl (geen foto's/AI-plaatjes) zodat het
zelf aan te passen en uit te breiden is (nieuwe decors of personages
toevoegen kan direct in `assets/js/strip.js`, bij `sceneSVG()` en de
avatar-functies).
