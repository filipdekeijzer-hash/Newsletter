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
| `5-successen-en-jargonjudo.txt` | 🏆 CONO Successen + 🥋 JargonJudo + de strip |

Twee rubrieken hebben geen prompt, omdat ze niet per maand opnieuw bedacht
hoeven te worden: **Actie & Tips** en **Vraag van de maand**. Die schrijf je
zelf in één of twee zinnen — en de vraag van de maand komt sowieso van een
collega.

## De strip

Prompt 5 levert naast de JargonJudo-tekst ook een script voor de zes vakjes
van de strip, in dit formaat:

```
3. SPREKER: Bert | EMOTIE: fel | TEKST: Dan verbieden we het ijs! Vandaag nog!
```

Die regels gebruik je als draaiboek in de strip maker: je zet per vakje de
figuren neer, plaatst een ballon met die tekst en stelt houding en gezicht in
op de aangegeven emotie. Het decor bouw je er zelf bij.

## Een opmerking over gebruik

De LLM verzint desgevraagd moeiteloos resultaten, cijfers en citaten. De
prompts vragen daarom expliciet om niets toe te voegen, maar controleer de
successen, cijfers en bronvermeldingen altijd zelf voordat de nieuwsbrief de
deur uitgaat.
