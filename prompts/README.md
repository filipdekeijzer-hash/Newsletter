# Prompts voor het CONO Databericht

Vijf vaste prompts, één per sectie van de nieuwsbrief. De prompt zelf blijft
elke maand hetzelfde; je vervangt alleen de variabelen bovenin het bestand.
Zo schrijft iedereen die de nieuwsbrief maakt in dezelfde toon, ook als het
elke maand iemand anders is.

## De snelste weg: laat de hele nieuwsbrief schrijven

In de nieuwsbrief-bouwer zit bovenaan het paneel **"Laat de nieuwsbrief
schrijven"**. Daar vul je een paar dingen in — waar het deze maand over gaat,
de maand, eventueel een moeilijk woord en de successen — en vink je aan welke
rubrieken je deze editie wilt. Eén klik zet de prompt klaar; het antwoord plak
je terug en de nieuwsbrief vult zichzelf, koppen en al.

Die prompt bouwt de bouwer zelf op uit dezelfde schrijfregels als de losse
bestanden hieronder. De losse prompts blijven handig als je één rubriek apart
wilt schrijven of herschrijven.

## Werkwijze per rubriek

1. Open het bestand van de sectie die je wilt maken.
2. Vul bovenin, onder `VARIABELEN`, de gegevens van deze maand in.
3. Kopieer alles onder de streep `KOPIEER VANAF HIER` naar je LLM — met de
   ingevulde waarden op de plek van de variabelen.
4. Plak het antwoord in de bijbehorende rubriek in `nieuwsbrief.html`.

Elke prompt vraagt het antwoord op te leveren met vaste labels (`KOP:`,
`UITLEG:`, `TIP:` en zo verder). Die labels komen overeen met de invulvelden
in de bouwer, zodat overnemen één op één gaat.

## Welke prompt hoort bij welke rubriek

| Bestand | Rubriek in de bouwer |
| --- | --- |
| `1-introductie-en-kop.txt` | 📰 Kop van de maand + het voorwoord |
| `2-veilig-inloggen.txt` | 🔑 Veilig inloggen |
| `3-uit-ons-systeem.txt` | 🔦 Uit ons systeem |
| `4-ai-in-het-echte-leven.txt` | 🤖 AI in het echte leven |
| `5-trots-en-jargonjudo.txt` | 🏆 Waar we trots op zijn + 🥋 JargonJudo |
| `6-strip-uit-verhaal.txt` | De strip bij JargonJudo |

Twee rubrieken hebben geen eigen bestand, omdat ze kort zijn en niet elke
maand opnieuw bedacht hoeven te worden: **Wat kun jij doen?** en **Vraag van
de maand**. Het paneel in de bouwer schrijft ze wel mee als je ze aanvinkt.

Niet elke rubriek hoeft elke maand mee te doen. "Veilig inloggen" en "AI in
het echte leven" staan daarom standaard uit in het paneel — vink ze aan
wanneer er die maand werkelijk iets over te melden is.

## De strip

Prompt 6 maakt de strip. Je vult je verhaal in, de LLM schrijft het draaiboek
als JSON, en de strip maker tekent het.

De makkelijkste weg is via de strip maker zelf: typ je verhaal in het vak
"Strip uit een verhaal" en klik op "Prompt kopiëren" — dan staat deze prompt
met jouw verhaal erin klaar. Het JSON-antwoord plak je terug en de strip
verschijnt. In de gedeelde online versie kan de pagina het ook rechtstreeks
aan Claude vragen.

De opbouw ligt vast op vier vakjes: situatie, complicatie, omslag, clou.
Wat erin gebeurt verschilt per verhaal, en twee keer dezelfde vraag stellen
levert twee verschillende strips op.

## Een opmerking over gebruik

De LLM verzint desgevraagd moeiteloos resultaten, cijfers en citaten. De
prompts vragen daarom expliciet om niets toe te voegen, maar controleer de
successen, cijfers en bronvermeldingen altijd zelf voordat de nieuwsbrief de
deur uitgaat.
