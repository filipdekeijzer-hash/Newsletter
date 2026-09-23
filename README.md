# CONO Nieuwsbrief &amp; Strip bouwer

Een sjabloon-website (Nederlandstalig) om een terugkerende CONO-nieuwsbrief over
datamanagement te bouwen, en een bijpassende strip te maken. Puur HTML/CSS/JS,
geen installatie of build-stap nodig — gewoon openen in de browser.

## Openen

Open `index.html` in een browser (dubbelklikken volstaat), of host de map als
statische site (GitHub Pages, Netlify, een interne webserver, etc.).

## Delen met collega's

Er zijn drie manieren, van makkelijk naar netst:

1. **Eén los bestand.** `dist/index.html` is de hele tool — nieuwsbrief én
   strip, als twee tabbladen — in één bestand, zonder losse onderdelen. Je
   kunt dat bestand mailen of op een gedeelde schijf zetten; dubbelklikken
   is genoeg. Dit bestand wordt gegenereerd, dus pas het niet met de hand
   aan; draai in plaats daarvan `node build-artifact.js` opnieuw nadat je
   iets in de bronbestanden hebt veranderd.
2. **Een online link.** Datzelfde bestand is gepubliceerd als deelbare
   pagina, zodat collega's alleen een link nodig hebben.
3. **GitHub Pages.** Zet in de repository-instellingen Pages aan op de
   branch die je wilt tonen; de site staat dan op
   `https://<gebruikersnaam>.github.io/Newsletter/` en werkt met de losse
   pagina's uit deze map. Elke push werkt de site meteen bij.

In een afgeschermde online omgeving mag een pagina zelf geen bestanden
wegschrijven. Daarom biedt **Exporteer JSON** altijd óók "Kopieer naar
klembord" aan: dat werkt overal, en de gekopieerde tekst kan de ontvanger
via **Importeer JSON** weer inladen.

## Onderdelen

- **`index.html`** — landingspagina met uitleg en links naar de twee tools.
- **`nieuwsbrief.html`** — de nieuwsbrief-bouwer. Links vul je secties in
  (voorwoord, "wist-je-dat" voorbeelden uit artikelen/papers, onderwerpen in
  simpele taal, cijfers, quotes, vrije tekst), rechts zie je direct de
  opgemaakte nieuwsbrief.
- **`strip.html`** — de strip maker. Je typt je verhaal in, een LLM schrijft
  het draaiboek en de pagina tekent de strip. Daarna kun je alles nog met de
  hand bijschuiven op de tekentafel.
- **`assets/css/huisstijl.css`** — alléén de kleuren en lettertypen. Dit is
  het enige bestand dat aangepast hoeft te worden voor de echte huisstijl
  (zie hieronder).
- **`assets/css/style.css`** — alle overige styling en de print-opmaak.
- **`assets/js/shared.js`** — gedeelde hulpfuncties (opslaan, JSON in-/export).
- **`assets/js/nieuwsbrief.js`** — logica van de nieuwsbrief-bouwer.
- **`assets/js/stripmaker.js`** — de tekentafel: tekenen, slepen, poseren.
- **`assets/js/regisseur.js`** — vertaalt het draaiboek van de LLM naar een
  complete strip (decors, plaatsing, houdingen, ballonnen).
- **`prompts/`** — de vaste prompts per sectie, inclusief die voor de strip.

## De vaste indeling

De knop **"Standaard indeling"** zet in één klik de acht rubrieken neer die
elke editie terugkeren. Per editie vul je ze opnieuw:

| Rubriek | Waarvoor |
| --- | --- |
| 📰 **Kop van de maand** | Wat moet je deze maand echt weten? Een herkenbaar voorbeeld van buiten het werk, met aan het eind de brug naar CONO. |
| 🔑 **Veilig inloggen** | Wachtwoorden en toegang, in gewone taal. |
| 🔦 **Uit ons systeem** | Eén term uit onze eigen systemen, als woordenboek-notitie, met de constatering erachter. |
| 🤖 **AI in het echte leven** | Wat er buiten de deur gebeurt, met bronvermelding en eventueel een link. |
| 🏆 **Waar we trots op zijn** | Lijstje van projecten en vragen waar we zelf mee bezig zijn. |
| 🥋 **JargonJudo** | Een moeilijk woord in twee stappen op de mat: eerst de kop die logisch klinkt maar niet klopt, dan hoe het écht zit. Hier hoort de strip bij. |
| ✅ **Wat kun jij doen?** | De oproep: wat kan de lezer deze maand zelf doen? |
| ❓ **Vraag van de maand** | Vraag insturen, inclusief de beloning. |

**De koppen liggen niet vast.** Boven elke rubriek staat in de bouwer een veld
"Kop van deze rubriek": daar zet je neer wat je wilt, in je eigen woorden. De
namen hierboven zijn alleen het vertrekpunt.

Niet elke rubriek hoeft elke maand gevuld te worden — verwijder gerust wat je
overslaat, of voeg 'm later weer toe. Daarnaast zijn er **vrije blokken**
(wist-je-dat, onderwerp uitgelegd, cijfers, quote, tekst) voor wat buiten de
vaste rubrieken valt.

De knop **"Voorbeeld invullen"** laadt een volledig ingevulde proefeditie:
de standaard indeling met de onderwerpen uit het eerste voorstel
(telefoon die meeluistert / Baader-Meinhof, 1Password, geitenkaas,
AI-artikel uit 2017, CONO-successen, causaal verband, rapporten-actie en
de gevulde koeken).

## Alles op één pagina

De nieuwsbrief is opgemaakt als één A4: twee kolommen, met de strip onderaan
over de volle breedte. Het vel in beeld heeft exact de maten van het bedrukte
vlak (194 × 281 mm bij 8 mm marge), dus wat je ziet is wat er uit de printer
komt.

Het paneel **"Op één pagina"** meet mee en zegt eerlijk hoe het ervoor staat:
hoeveel pagina's het nu is, en hoe groot de tekst wordt afgedrukt. De knop
**"Automatisch passend maken"** zoekt de grootste letter waarbij alles nog op
één pagina past.

Houd rekening met de ruimte die er werkelijk is. Met alle acht rubrieken én de
strip kom je uit rond de 7 pt — dat past, maar leest niet prettig. Een paar
rubrieken minder scheelt direct:

| Inhoud | Lettergrootte |
| --- | --- |
| 8 rubrieken + strip | ~6,9 pt (te klein) |
| 6 rubrieken + strip | ~7,4 pt |
| 4 rubrieken + strip | ~7,8 pt |

Vandaar het advies om een paar rubrieken vast te houden en de rest te laten
rouleren, of de teksten kort te houden — de prompts vragen daar ook om.

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

## De nieuwsbrief laten schrijven

Bovenaan de bouwer zit het paneel **"Laat de nieuwsbrief schrijven"**. Je vult
in waar het deze maand over ging (een paar zinnen volstaat), eventueel de
maand, een moeilijk woord en de successen, en je vinkt aan welke rubrieken
mee moeten. Daarna:

- **Prompt kopiëren** — plak hem in ChatGPT, Claude of Copilot en zet het
  antwoord terug in het plakvak. Werkt overal.
- **Laat Claude het schrijven** — alleen in de gedeelde online versie; dan
  gaat het in één klik.

De LLM schrijft de teksten én stelt per rubriek een kop in gewone taal voor.
De opmaak blijft van het sjabloon, en alles is daarna nog met de hand aan te
passen. `assets/js/redactie.js` bevat de prompt en de vertaling naar de
rubrieken.

## Prompts per sectie

In de map `prompts/` staan zes vaste prompts, één per sectie, met de
instructie als commentaar bovenaan en daaronder de variabelen die je elke
maand vervangt. `prompts/README.md` legt uit welke prompt bij welke rubriek
hoort. Prompt 6 is die van de strip: die levert het draaiboek waar de strip
maker de tekening van bouwt.

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
