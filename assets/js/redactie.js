/* CONO Nieuwsbrief — de redactie.
 *
 * Je vult een paar dingen in (waar ging het deze maand over, welke rubrieken
 * je wilt), een LLM schrijft de stukken, en deze code zet ze in de bouwer.
 * De LLM bepaalt alleen de tekst en de koppen; de opmaak blijft van het
 * sjabloon. Alles wat eruit komt kun je daarna gewoon bijschaven.
 */

/* Welke velden een rubriek heeft. Alleen deze worden overgenomen uit het
   antwoord van de LLM, zodat een verzonnen extra veld niets kan breken. */
const RUBRIEK_VELDEN = {
  kopvandemaand:   ['kop', 'term', 'uitleg', 'brug'],
  iam:             ['titel', 'uitleg', 'tip'],
  stamdata:        ['term', 'definitie', 'constatering'],
  aianalytics:     ['titel', 'bron', 'uitleg'],
  successen:       [],
  jargonjudo:      ['term', 'prikkel', 'observatie', 'ontknoping', 'striplink'],
  actietips:       ['tekst', 'actie'],
  vraagvandemaand: ['vraag', 'waar', 'beloning']
};

/* Wat elke rubriek van de schrijver vraagt, in gewone taal. */
const RUBRIEK_OPDRACHT = {
  kopvandemaand:
`  - soort "kopvandemaand": de opening. Velden:
      kop     = een prikkelende vraag van hoogstens 12 woorden
      term    = het begrip erachter in twee of drie woorden (mag leeg)
      uitleg  = 4 tot 6 zinnen, maximaal 90 woorden. Begin met een voorbeeld
                dat iedereen van buiten het werk herkent.
      brug    = één zin die het doortrekt naar CONO, als vraag aan de lezer`,
  iam:
`  - soort "iam": over inloggen, wachtwoorden en toegang. Velden:
      titel   = de vraag die collega's hier echt over hebben
      uitleg  = precies drie zinnen, maximaal 60 woorden, met één simpele
                vergelijking (een slot, een sleutelbos, een portier). Woorden
                als encryptie of authenticatie mag je niet gebruiken.
      tip     = één zin met de eerste stap`,
  stamdata:
`  - soort "stamdata": één term uit onze eigen systemen. Velden:
      term         = de term zelf
      definitie    = één korte zin, zoals in een woordenboek
      constatering = 3 zinnen, maximaal 55 woorden: eerst de verrassing (wat
                     staat er níét vastgelegd), dan een praktische tip`,
  aianalytics:
`  - soort "aianalytics": wat er buiten CONO gebeurt met AI. Velden:
      titel   = hoogstens 12 woorden
      bron    = de bronvermelding in één regel (mag leeg)
      uitleg  = 4 tot 5 zinnen, maximaal 75 woorden, over wat mensen ervan
                merken in het dagelijks leven — niet over de techniek`,
  successen:
`  - soort "successen": waar we zelf mee bezig zijn. Veld:
      items   = een lijst van 3 of 4 regels, elk hoogstens 12 woorden,
                geschreven als resultaat of als de vraag die beantwoord werd.
                Verzin er niets bij.`,
  jargonjudo:
`  - soort "jargonjudo": een moeilijk woord uitgelegd met een grap. Velden:
      term       = het woord zelf
      prikkel    = een krantenkop van hoogstens 10 woorden die een logische
                   maar foute conclusie hardop uitspreekt
      observatie = 2 zinnen over wat je in de cijfers ziet (dat klopt gewoon)
      ontknoping = 2 tot 3 zinnen waarom die kop toch onzin is
      striplink  = "Zie de strip onderaan deze pagina."`,
  actietips:
`  - soort "actietips": wat de lezer zelf kan doen. Velden:
      tekst   = 2 zinnen, maximaal 45 woorden
      actie   = de concrete actie in één zin`,
  vraagvandemaand:
`  - soort "vraagvandemaand": de oproep om vragen te sturen. Velden:
      vraag    = de oproep in één zin
      waar     = waar de vraag heen kan
      beloning = wat de beste vraag oplevert (mag leeg)`
};

/* ---------------------------------------------------------------------- */

function redactiePrompt(invoer) {
  const gekozen = (invoer.rubrieken || []).filter(r => RUBRIEK_OPDRACHT[r]);
  const opdrachten = gekozen.map(r => RUBRIEK_OPDRACHT[r]).join('\n\n');
  const successen = String(invoer.successen || '').trim();
  const woord = String(invoer.moeilijkWoord || '').trim();

  return `Je schrijft de interne nieuwsbrief van CONO Kaasmakers, een
zuivelcoöperatie. De lezers zijn collega's van alle afdelingen: van de
productievloer tot kantoor. De meesten zijn geen data-experts en willen dat
ook niet worden.

WAAR HET DEZE MAAND OVER GAAT
${String(invoer.waarover || '').trim() || '(niets opgegeven — kies zelf iets passends bij een zuivelcoöperatie)'}

MAAND: ${String(invoer.maand || '').trim() || '(niet opgegeven)'}
${successen ? 'SUCCESSEN VAN DEZE MAAND (gebruik deze, verzin er niets bij):\n' + successen : 'SUCCESSEN: niet opgegeven — laat de rubriek weg of houd hem algemeen.'}
${woord ? 'MOEILIJK WOORD OM UIT TE LEGGEN: ' + woord : ''}

SCHRIJFREGELS — deze zijn belangrijker dan volledigheid
- Nederlands, spreektaal, alsof je een collega aanspreekt bij de
  koffieautomaat. Vrolijk en uitnodigend, niet belerend.
- Geen vakjargon. Gebruik je toch een moeilijk woord, leg het dan in dezelfde
  zin uit. Woorden als "datakwaliteit", "governance", "stakeholder" en
  "implementatie" komen er niet in.
- Ook de koppen in gewone taal: een kop die een collega hardop zou zeggen.
- Houd je aan de woordaantallen. Alles moet samen op één A4 passen; te lang
  is erger dan te kort.
- Verzin geen cijfers, resultaten of citaten. Weet je iets niet, houd het dan
  algemeen.

WAT JE OPLEVERT
Alleen JSON, zonder uitleg eromheen, met precies deze vorm:

{
  "titel": "CONO Databericht",
  "ondertitel": "één zin over deze editie",
  "editie": "bijv. Editie 4 — ${String(invoer.maand || 'maand').trim()}",
  "voorwoord": "één alinea van hoogstens 60 woorden die de editie aankondigt",
  "rubrieken": [
    { "soort": "...", "rubriekkop": "...", "rubrieksubtitel": "...", ...de velden hieronder }
  ]
}

"rubriekkop" is de naam van de rubriek zoals die in de gekleurde balk komt te
staan, en "rubrieksubtitel" het regeltje ernaast (mag leeg). Verzin daar een
korte naam in gewone taal voor — iets wat een collega zou zeggen. Let op: dat
is iets anders dan de velden van de rubriek zelf. Bij "kopvandemaand" is
"rubriekkop" dus bijvoorbeeld "Kop van de maand" en is "kop" de prikkelende
vraag; herhaal ze niet.

Lever de rubrieken in deze volgorde, en alleen deze:

${opdrachten}`;
}

/* ---------------------------------------------------------------------- */

/* Zet het antwoord van de LLM om in secties voor de bouwer. */
function sectiesUitRedactie(script) {
  if (!script || typeof script !== 'object') throw new Error('Geen leesbaar antwoord gevonden.');
  const lijst = Array.isArray(script.rubrieken) ? script.rubrieken : [];
  if (!lijst.length) throw new Error('Het antwoord bevat geen "rubrieken".');

  const secties = [];
  lijst.forEach(bron => {
    if (!bron || typeof bron !== 'object') return;
    const soort = String(bron.soort || '').trim();
    if (!RUBRIEK_VELDEN[soort]) return;

    const sec = nieuwSectie(soort);
    if (bron.rubriekkop) sec.label = String(bron.rubriekkop);
    sec.subtitel = bron.rubrieksubtitel ? String(bron.rubrieksubtitel) : '';

    if (soort === 'successen') {
      const items = Array.isArray(bron.items) ? bron.items : [];
      sec.items = items.filter(Boolean).slice(0, 6).map(it => ({
        id: uid(),
        tekst: String(typeof it === 'string' ? it : (it.tekst || '')),
        toelichting: String((it && it.toelichting) || '')
      }));
      if (!sec.items.length) return;
    } else {
      RUBRIEK_VELDEN[soort].forEach(veld => {
        if (bron[veld] !== undefined && bron[veld] !== null) sec[veld] = String(bron[veld]);
      });
    }
    secties.push(sec);
  });

  if (!secties.length) throw new Error('Geen bruikbare rubrieken in het antwoord.');
  return {
    titel: script.titel ? String(script.titel) : '',
    ondertitel: script.ondertitel ? String(script.ondertitel) : '',
    editie: script.editie ? String(script.editie) : '',
    voorwoord: script.voorwoord ? String(script.voorwoord) : '',
    secties: secties
  };
}
