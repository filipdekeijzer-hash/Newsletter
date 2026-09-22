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
- **`strip.html`** — de stripmaker. Vaste opmaak van 6 vakjes met twee
  vaste personages (Data-Daan en Boer Bert); per editie vul je alleen in wie
  wat zegt, in welk decor. Zo blijft de vormgeving herkenbaar, maar is elke
  strip inhoudelijk anders.
- **`assets/css/huisstijl.css`** — alléén de kleuren en lettertypen. Dit is
  het enige bestand dat aangepast hoeft te worden voor de echte huisstijl
  (zie hieronder).
- **`assets/css/style.css`** — alle overige styling en de print-opmaak.
- **`assets/js/shared.js`** — gedeelde hulpfuncties (opslaan, JSON in-/export).
- **`assets/js/nieuwsbrief.js`**, **`assets/js/strip.js`** — logica van
  de twee bouwers.

## De vaste indeling

De knop **"Standaard indeling"** zet in één klik de acht rubrieken neer die
elke editie terugkeren. Per editie vul je ze opnieuw:

| Rubriek | Waarvoor |
| --- | --- |
| 📰 **Kop van de maand** | Wat moet je deze maand echt weten? Een herkenbaar voorbeeld van buiten het werk, met aan het eind de brug naar CONO. |
| 🔑 **IAM in beeld** | Toegang en wachtwoorden, in gewone taal. |
| 🔦 **Stamdata spotlight** | Eén term uit ons systeem, als woordenboek-notitie, met de constatering erachter. |
| 🤖 **AI & Analytics (buiten CONO)** | Wat er buiten de deur gebeurt, met bronvermelding en eventueel een link. |
| 🏆 **CONO Successen** | Lijstje van projecten en vragen waar we zelf mee bezig zijn. |
| 🥋 **JargonJudo** | Een moeilijk woord in twee stappen op de mat: eerst de kop die logisch klinkt maar niet klopt, dan hoe het écht zit. Hier hoort de strip bij. |
| ✅ **Actie & Tips** | De oproep: wat kan de lezer deze maand zelf doen? |
| ❓ **Vraag van de maand** | Vraag insturen, inclusief de beloning. |

Niet elke rubriek hoeft elke maand gevuld te worden — verwijder gerust wat je
overslaat, of voeg 'm later weer toe. Daarnaast zijn er **vrije blokken**
(wist-je-dat, onderwerp uitgelegd, cijfers, quote, tekst) voor wat buiten de
vaste rubrieken valt.

De knop **"Voorbeeld invullen"** laadt een volledig ingevulde proefeditie:
de standaard indeling met de onderwerpen uit het eerste voorstel
(telefoon die meeluistert / Baader-Meinhof, 1Password, geitenkaas,
AI-artikel uit 2017, CONO-successen, causaal verband, rapporten-actie en
de gevulde koeken).

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

## Prompts per sectie

In de map `prompts/` staan vijf vaste prompts, één per sectie, met de
instructie als commentaar bovenaan en daaronder de variabelen die je elke
maand vervangt. `prompts/README.md` legt uit welke prompt bij welke rubriek
hoort. Prompt 5 levert naast de tekst ook een script voor de zes vakjes van
de strip.

## De strip: personages en decors

De strip gebruikt twee vaste, eenvoudig getekende personages zodat elke
editie herkenbaar blijft:

- **Data-Daan** — het datateam, herkenbaar aan het blauwe shirt en het
  tablet/grafiekje.
- **Boer Bert** — de praktijk op de vloer/boerderij, herkenbaar aan de
  groene overall en het kaaswiel.

Daarnaast is er een **Verteller** (tekstbalk bovenaan, voor tijdsprongen of
context) en de optie **Geen spreker** (alleen beeld, eventueel met een kort
bijschrift).

Per vakje stel je in:

- **In beeld** — alleen Daan, alleen Bert, allebei (dan staan ze tegenover
  elkaar) of niemand.
- **Wie praat** — en dus waar de ballon naartoe wijst.
- **Uitdrukking** — neutraal, blij, verbaasd, denkend, fel of geschrokken.
  Dit verandert de ogen, de wenkbrauwen, de mond én de houding van de armen.
- **Ballon** — spreekballon, denkballon (wolk) of roepballon (kartelrand).
- **Decor** — kaasfabriek, kantoor, vergaderzaal, wei, strand, scherm met
  grafiek of feestje.
- **Voorwerp** — ijsje, kaaswiel, grafiekje, vraagteken, sleutel of ordner,
  dat het sprekende personage vasthoudt.

Alles is met de hand getekende SVG met een doorlopende inktlijn, zodat
personages, decors en ballonnen dezelfde beeldtaal delen en alles meekleurt
met de huisstijl.

De voorbeeldstrip hoort bij de rubriek JargonJudo: Boer Bert wil het ijs
verbieden omdat meer ijsverkoop samenvalt met meer verdrinkingen — tot
Data-Daan uitlegt dat het gewoon warm weer is.

Dit is bewust vectorwerk (geen foto's of gegenereerde plaatjes) zodat het
zelf aan te passen en uit te breiden is. Een nieuw decor voeg je toe in
`sceneSVG()`, een nieuw voorwerp in `propSVG()`, een nieuwe uitdrukking in
`gezichtSVG()` plus `ARMEN` — allemaal in `assets/js/strip.js`.
