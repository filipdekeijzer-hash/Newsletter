# CONO Nieuwsbrief &amp; Strip bouwer

Een sjabloon-website (Nederlandstalig) om een terugkerende CONO-nieuwsbrief over
datamanagement te bouwen, en een bijpassende strip te maken. Puur HTML/CSS/JS,
geen installatie of build-stap nodig — gewoon openen in de browser.

## Openen

Open `index.html` in een browser (dubbelklikken volstaat), of host de map als
statische site (GitHub Pages, Netlify, een interne webserver, etc.).

## De website

De site staat online via GitHub Pages en is voor iedereen te openen — geen
account, geen inloggen:

**https://filipdekeijzer-hash.github.io/Newsletter/**

Staat die link nog niet aan, zet hem dan eenmalig aan in de repository:
**Settings → Pages → Source: "Deploy from a branch" → Branch:
`claude/cono-newsletter-template-pjh2ho` / `(root)` → Save.** Na een minuut of
twee staat de site er. Vanaf dan werkt elke push de site automatisch bij.

De map bevat `.nojekyll`, zodat GitHub de bestanden ongemoeid doorgeeft.

### Twee andere manieren om te delen

1. **Eén los bestand.** `dist/index.html` is de hele tool — nieuwsbrief én
   strip, als twee tabbladen — in één bestand. Mailen of op een gedeelde
   schijf zetten kan gewoon; dubbelklikken is genoeg. Het bestand wordt
   gegenereerd, dus pas het niet met de hand aan: draai
   `node build-artifact.js` opnieuw na een wijziging.
2. **Een editie doorgeven.** "Exporteer JSON" geeft de huidige editie als
   tekst; de ontvanger laadt die met "Importeer JSON" weer in.

### Let op bij een publieke webpagina

De knop **"Schrijf de nieuwsbrief"**, die het in één klik doet, werkt alleen
binnen claude.ai. Op de gewone website is de route: **Prompt kopiëren** →
plakken in ChatGPT, Claude of Copilot → het antwoord terugplakken. Dat werkt
met elke AI-assistent en zonder sleutels of accounts in de pagina. Om die
reden staat "Prompt kopiëren" daar als hoofdknop.

## Onderdelen

- **`index.html`** — landingspagina met uitleg en links naar de twee tools.
- **`nieuwsbrief.html`** — de nieuwsbrief-bouwer. Je typt in waar het deze
  maand over ging, een LLM schrijft de blokken en de strip, en rechts staat
  meteen de opgemaakte pagina.
- **`strip.html`** — de strip maker. Je typt je verhaal in, een LLM schrijft
  het draaiboek en de pagina tekent de strip. Daarna kun je alles nog met de
  hand bijschuiven op de tekentafel.
- **`assets/css/huisstijl.css`** — alléén de kleuren en lettertypen. Dit is
  het enige bestand dat aangepast hoeft te worden voor de echte huisstijl
  (zie hieronder).
- **`assets/css/style.css`** — alle overige styling en de print-opmaak.
- **`assets/js/shared.js`** — gedeelde hulpfuncties (opslaan, JSON in-/export).
- **`assets/js/nieuwsbrief.js`** — logica van de nieuwsbrief-bouwer.
- **`assets/js/redactie.js`** — de prompt die de hele nieuwsbrief laat
  schrijven, en de vertaling van het antwoord naar blokken.
- **`assets/js/stripmaker.js`** — de tekentafel: tekenen, slepen, poseren.
- **`assets/js/regisseur.js`** — vertaalt het draaiboek van de LLM naar een
  complete strip (decors, plaatsing, houdingen, ballonnen).
- **`prompts/`** — de twee prompts die de app gebruikt, gegenereerd uit de
  app zelf.

## Zo maak je een editie

1. Typ bovenaan in waar het deze maand over ging. Een paar zinnen volstaat.
2. Klik op **Schrijf de nieuwsbrief** (gedeelde online versie) of op
   **Prompt kopiëren**, plak de prompt in ChatGPT of Claude en zet het
   antwoord terug in het plakvak.
3. Klaar. De nieuwsbrief staat er, met de strip, passend gemaakt op één A4.

Meer is het niet. Er valt niets aan te vinken en niets uit te zoeken: de
schrijver bepaalt zelf welke blokken erin komen, hoeveel het er zijn, welke
kop ze krijgen en in welke vorm ze staan.

## Vrije blokken

Een nieuwsbrief bestaat uit blokken, en een blok is vrij. Er zijn geen vaste
rubrieken meer met vaste velden. Elk blok heeft:

- een **kop** en **ondertitel** die je zelf bepaalt;
- een **icoon** en een **kleur** (rood, groen, goud of blauw);
- een **vorm**, die alleen bepaalt hoe het eruitziet:

| Vorm | Waarvoor |
| --- | --- |
| **Tekst** | Gewone alinea's, met een afsluitende regel die eruit springt. |
| **Lijst** | Opsomming, bijvoorbeeld waar je trots op bent. |
| **Citaat** | Iemand aan het woord. |
| **Cijfers** | Losse getallen als tegels. |
| **Woordenboek** | Eén term met zijn definitie, en de constatering erachter. |
| **Stappen** | Iets in twee of drie stappen uitleggen — een kop die logisch klinkt maar niet klopt, en dan hoe het zit. |
| **Oproep** | Een vraag aan de lezer, met wat het oplevert. |

Je kunt elk blok overschrijven, van kop tot kleur, of er zelf een toevoegen
met **+ Blok toevoegen**. Edities van vóór deze versie worden bij het openen
automatisch omgezet naar vrije blokken, dus oud werk blijft bruikbaar.

## Alles op één pagina

De nieuwsbrief is opgemaakt als één A4: twee kolommen, met de strip onderaan
over de volle breedte. Het vel in beeld heeft exact de maten van het bedrukte
vlak (194 × 281 mm bij 8 mm marge), dus wat je ziet is wat er uit de printer
komt.

Het paneel **"Op één pagina"** meet mee en zegt eerlijk hoe het ervoor staat:
hoeveel pagina's het nu is, en hoe groot de tekst wordt afgedrukt. De knop
**"Automatisch passend maken"** zoekt de grootste letter waarbij alles nog op
één pagina past.

Na het schrijven maakt de bouwer het **automatisch passend**, dus daar hoef je
niets voor te doen. Met vijf of zes blokken plus de strip kom je uit rond de
9 pt: gewoon leesbaar. Schrijf je zelf veel langere stukken, dan zakt dat —
de meter zegt het eerlijk en waarschuwt onder de 8 pt.

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
geen officiële huisstijl.

Daarom staat álle kleur- en lettertype-informatie in één apart bestand:
**`assets/css/huisstijl.css`**. Dat bestand kan zo doorgegeven worden aan
Interne Communicatie of een vormgever:

1. Pas in `assets/css/huisstijl.css` de variabelen onder `:root` aan
   (`--cono-red`, `--cono-gold`, `--cono-green`, `--cono-blue`,
   `--cono-cream`, `--font-heading`, `--font-body`, ...).
2. Vervang het `.logo-badge`-element (in elke HTML-pagina) door het echte
   logo, bijvoorbeeld als `<img src="assets/img/cono-logo.svg" alt="CONO">`.

Verder hoeft er geen HTML of JavaScript aangeraakt te worden: de hele
website — inclusief de figuurtjes en decors in de strip — leest zijn kleuren
uit die variabelen.

## De prompts

In de map `prompts/` staan de twee prompts die de app gebruikt:
`nieuwsbrief.txt` voor een hele editie en `strip.txt` voor alleen een strip.
Ze worden uit de app zelf gegenereerd, zodat ze nooit uit elkaar lopen met wat
de knoppen doen. Je hebt ze normaal niet nodig — de knoppen zetten de prompt
met jouw invulling voor je klaar.

## De strip maker: van verhaal naar strip

De snelste route loopt via het paneel **"Strip uit een verhaal"**. Je typt in
een paar zinnen wat er moet gebeuren; een LLM schrijft daar het draaiboek bij
en deze pagina tekent er de strip van.

De LLM tekent dus niets. Hij levert alleen JSON: per vakje wie er in beeld
staat, wie er praat, met welke uitdrukking en welk gebaar, in welk decor. De
regisseur in `assets/js/regisseur.js` zet daar vervolgens de figuren neer,
draait de armen in de juiste houding, hangt de ballon boven de spreker met de
staart naar zijn hoofd, en bouwt het decor op. Daardoor is elke strip anders,
terwijl de vormgeving en de opbouw (situatie → complicatie → omslag → clou)
elke keer hetzelfde zijn.

Twee manieren:

1. **Kopiëren en plakken** (werkt overal): klik op "Prompt kopiëren", plak de
   prompt in ChatGPT, Claude of Copilot, en plak het JSON-antwoord terug onder
   "Antwoord van de LLM plakken". Dezelfde prompt staat in
   `prompts/6-strip-uit-verhaal.txt`.
2. **Rechtstreeks** (alleen in de gedeelde online versie): de knop "Laat
   Claude de strip tekenen" vraagt het draaiboek meteen op. Bevalt het
   resultaat niet, klik dan nog eens — elke keer komt er iets anders uit.

Namen die je gebruikt krijgen automatisch een vast uiterlijk, zodat dezelfde
persoon er in elk vakje hetzelfde uitziet. Wil je een personage precies
vastleggen (bijvoorbeeld Bert met kaasmakersmuts en snor), dan kan dat in het
`personages`-deel van het draaiboek.

Na het bouwen kun je alles nog met de hand bijschuiven — dat is de tekentafel
hieronder.

## De tekentafel: alles met de hand

Wil je zelf tekenen, of het resultaat van de regisseur bijschaven, dan werkt
de pagina als een tekentafel. Een vakje is een leeg kader; alles wat erin
staat zet je er zelf neer en versleep je met de muis.

**Wat je kunt plaatsen**

- **Figuren.** Een poppetje met scharnieren. Je stelt per arm de schouder- en
  elleboogstand in, kantelt het hoofd en spreidt de benen. Het gezicht wordt
  opgebouwd uit losse waarden: wenkbrauwhoek en -hoogte, hoever de ogen open
  staan, waar de pupillen naartoe kijken, en de breedte, kromming en opening
  van de mond. Daarnaast kies je vrij de kleur van huid, shirt, broek en haar,
  een kapsel of hoofddeksel, en bril, snor, baard of blosjes. Er zijn dus geen
  vaste personages: je maakt ze zelf, en je kunt er zoveel in een vakje zetten
  als je wilt.
- **Decorstukken.** Twintig vormen (huis, schuur, boom, hek, koe, kaaswiel,
  melkbus, kaasvat, tafel, bureau, laptop, beeldscherm, whiteboard, plant,
  zon, wolk en meer), elk met eigen kleuren, grootte en spiegeling.
- **Ballonnen.** Spreken, denken of roepen. De staart heeft een eigen
  handvat: sleep het bolletje naar degene die praat.
- **Tekstblokken** voor "later die dag..." of het slotzinnetje.

**De indeling** bepaal je zelf: rijen toevoegen, vakjes toevoegen of
weghalen, en per vakje de breedte instellen. Een klassieke krantenstrip is
één rij van drie of vier vakjes, maar een zondagse pagina met meerdere rijen
kan net zo goed. Per vakje stel je de kleur van lucht en grond in, de hoogte
van de horizon, en of er rasterpuntjes in de lucht komen.

**Handig tijdens het tekenen**

- Klik een vakje aan om het actief te maken; nieuwe onderdelen komen daarin.
- Pijltjestoetsen verschuiven het geselecteerde onderdeel (met Shift grotere
  stappen), Delete verwijdert het, Ctrl+Z draait de laatste stap terug.
- Met "Naar voren" en "Naar achter" bepaal je wat voor of achter wat staat.
- "Dupliceren" maakt een kopie — handig om dezelfde figuur in het volgende
  vakje opnieuw te gebruiken met een andere houding.

De tekeningen zijn SVG met een doorlopende inktlijn, dus ze blijven scherp op
papier en kleuren mee met de huisstijl.
