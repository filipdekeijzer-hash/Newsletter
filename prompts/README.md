# Prompts voor het CONO Databericht

Vijf vaste prompts, één per sectie van de nieuwsbrief. De prompt zelf blijft
elke maand hetzelfde; je vervangt alleen de variabelen bovenin het bestand.
Zo schrijft iedereen die de nieuwsbrief maakt in dezelfde toon, ook als het
elke maand iemand anders is.

## Werkwijze

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
| `2-iam-in-beeld.txt` | 🔑 IAM in beeld |
| `3-stamdata-spotlight.txt` | 🔦 Stamdata spotlight |
| `4-ai-en-analytics.txt` | 🤖 AI & Analytics (buiten CONO) |
| `5-successen-en-jargonjudo.txt` | 🏆 CONO Successen + 🥋 JargonJudo |
| `6-strip-uit-verhaal.txt` | De strip bij JargonJudo |

Twee rubrieken hebben geen prompt, omdat ze niet per maand opnieuw bedacht
hoeven te worden: **Actie & Tips** en **Vraag van de maand**. Die schrijf je
zelf in één of twee zinnen — en de vraag van de maand komt sowieso van een
collega.

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
