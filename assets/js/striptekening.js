/* CONO Strip — het tekenwerk.
 *
 * Alleen tekenen: geen knoppen, geen opslag, geen selectie. Zowel de strip
 * maker als de nieuwsbrief gebruiken deze functies, zodat de strip er op het
 * vel van de nieuwsbrief precies zo uitziet als op de tekentafel.
 */

const INKT = '#1d1710';
const PANEEL_HOOGTE = 300;
const EENHEID = 200;          /* paneelbreedte = gewicht × deze eenheid */

const HAARSTIJLEN = {
  kort: 'Kort',
  scheiding: 'Scheiding',
  stekels: 'Stekels',
  krullen: 'Krullen',
  staart: 'Staart',
  kaal: 'Kaal',
  pet: 'Pet',
  muts: 'Kaasmakersmuts'
};

const DECORVORMEN = {
  huis: 'Huis',
  schuur: 'Schuur',
  boom: 'Boom',
  struik: 'Struik',
  heuvel: 'Heuvel',
  hek: 'Hek',
  koe: 'Koe',
  kaaswiel: 'Kaaswiel',
  melkbus: 'Melkbus',
  vat: 'Kaasvat',
  tafel: 'Tafel',
  stoel: 'Stoel',
  bureau: 'Bureau',
  laptop: 'Laptop',
  beeldscherm: 'Beeldscherm',
  whiteboard: 'Whiteboard',
  plant: 'Plant',
  doos: 'Doos',
  zon: 'Zon',
  wolk: 'Wolk'
};

const BALLONSOORTEN = { spreek: 'Spreken', denk: 'Denken', roep: 'Roepen' };

function nieuwFiguur(x, y) {
  return {
    id: uid(), type: 'figuur',
    x: x, y: y, schaal: 1, spiegel: false,
    huid: '#f0c69c', shirt: '#3a7bbf', broek: '#3f4a57', haarKleur: '#4a3426',
    haar: 'kort', bril: false, snor: false, baard: false, blos: false,
    pose: { hoofd: 0, benen: 0, schouderL: 12, elleboogL: 18, schouderR: 12, elleboogR: 18 },
    gezicht: { brauwHoek: 0, brauwHoogte: 0, oogOpen: 1, pupilX: 0, pupilY: 0, mondBreedte: 11, mondKrom: 0.4, mondOpen: 0 }
  };
}

function nieuwDecor(vorm, x, y) {
  return { id: uid(), type: 'decor', vorm: vorm, x: x, y: y, schaal: 1, spiegel: false, kleur1: '', kleur2: '' };
}

function nieuwBallon(x, y) {
  return { id: uid(), type: 'ballon', x: x, y: y, soort: 'spreek', breedte: 130, grootte: 13, tekst: 'Typ hier de tekst.', staartDx: 0, staartDy: 70 };
}

function nieuwTekst(x, y) {
  return { id: uid(), type: 'tekst', x: x, y: y, breedte: 160, grootte: 12, tekst: 'Later die dag...', kleur: '#f7e3ad' };
}

function nieuwPaneel(gewicht) {
  return {
    id: uid(), gewicht: gewicht || 1.5,
    lucht: '#cfe6f5', grond: '#dfcb99', horizon: 62, raster: false,
    objecten: []
  };
}

function paneelBreedte(p) {
  return Math.round(p.gewicht * EENHEID);
}

/* ========================================================================
   TEKENEN — FIGUUR
   ===================================================================== */

/* Richting vanuit een hoek in graden, gemeten vanaf recht naar beneden.
   0 = omlaag, 90 = horizontaal naar buiten, 180 = omhoog. */
function richting(graden, kant) {
  const r = graden * Math.PI / 180;
  return { x: Math.sin(r) * kant, y: Math.cos(r) };
}

function armPad(schouderX, schouderY, hoek, bocht, kant) {
  const bovenLengte = 21, onderLengte = 19;
  const d1 = richting(hoek, kant);
  const elleboog = { x: schouderX + d1.x * bovenLengte, y: schouderY + d1.y * bovenLengte };
  const d2 = richting(hoek + bocht, kant);
  const hand = { x: elleboog.x + d2.x * onderLengte, y: elleboog.y + d2.y * onderLengte };
  return {
    d: `M ${schouderX} ${schouderY} L ${elleboog.x.toFixed(1)} ${elleboog.y.toFixed(1)} L ${hand.x.toFixed(1)} ${hand.y.toFixed(1)}`,
    hand: hand
  };
}

function mondPad(breedte, kromming, opening) {
  const h = breedte / 2;
  const c = kromming * 9;
  if (opening < 1) return { d: `M ${-h} 0 Q 0 ${c.toFixed(1)} ${h} 0`, gevuld: false };
  return { d: `M ${-h} 0 Q 0 ${c.toFixed(1)} ${h} 0 Q 0 ${(c + opening).toFixed(1)} ${-h} 0 Z`, gevuld: true };
}

function haarPad(stijl, kleur, inkt) {
  switch (stijl) {
    case 'kort':
      return `<path d="M -17 -6 q 1 -16 17 -16 q 16 0 17 16 q -7 -7 -17 -7 q -10 0 -17 7 z" fill="${kleur}" ${inkt}/>`;
    case 'scheiding':
      return `<path d="M -17 -5 q 0 -17 17 -17 q 17 0 17 15 q -9 -9 -20 -6 q -8 2 -14 8 z" fill="${kleur}" ${inkt}/>`;
    case 'stekels':
      return `<path d="M -17 -4 l 3 -10 l 4 7 l 3 -12 l 4 9 l 3 -13 l 4 10 l 4 -9 l 3 12 l 4 -7 l 3 9 q -8 -7 -18 -7 q -10 0 -17 7 z" fill="${kleur}" ${inkt}/>`;
    case 'krullen':
      return `<g fill="${kleur}" ${inkt}>
          <circle cx="-13" cy="-11" r="7"/><circle cx="-4" cy="-16" r="8"/>
          <circle cx="6" cy="-16" r="8"/><circle cx="14" cy="-10" r="7"/>
        </g>`;
    case 'staart':
      return `<path d="M -17 -6 q 1 -16 17 -16 q 16 0 17 16 q -7 -7 -17 -7 q -10 0 -17 7 z" fill="${kleur}" ${inkt}/>
        <circle cx="-20" cy="-2" r="8" fill="${kleur}" ${inkt}/>`;
    case 'pet':
      return `<path d="M -18 -8 q 2 -15 18 -15 q 16 0 18 15 z" fill="${kleur}" ${inkt}/>
        <path d="M -18 -8 q -12 1 -14 6 q 16 2 32 -6 z" fill="${kleur}" ${inkt}/>`;
    case 'muts':
      return `<path d="M -18 -8 q 1 -18 18 -18 q 17 0 18 18 q -9 -6 -18 -6 q -9 0 -18 6 z" fill="#fdfdfd" ${inkt}/>
        <path d="M -19 -8 q 19 -7 38 0 q -19 7 -38 0 z" fill="#ece7db" ${inkt}/>`;
    default:
      return '';
  }
}

function tekenFiguur(o) {
  const inkt = `stroke="${INKT}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const p = o.pose, g = o.gezicht;

  /* Benen */
  const spreiding = p.benen;
  const been = (kant) => {
    const voetX = kant * (7 + spreiding);
    return `
      <path d="M ${kant * 6} -58 L ${voetX} -4" fill="none" stroke="${INKT}" stroke-width="15" stroke-linecap="round"/>
      <path d="M ${kant * 6} -58 L ${voetX} -4" fill="none" stroke="${o.broek}" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="${voetX + kant * 3}" cy="-3" rx="9" ry="5" fill="${INKT}"/>`;
  };

  /* Armen */
  const armL = armPad(-15, -98, p.schouderL, p.elleboogL, -1);
  const armR = armPad(15, -98, p.schouderR, p.elleboogR, 1);
  const arm = (a) => `
    <path d="${a.d}" fill="none" stroke="${INKT}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${a.d}" fill="none" stroke="${o.shirt}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${a.hand.x.toFixed(1)}" cy="${a.hand.y.toFixed(1)}" r="6.5" fill="${o.huid}" ${inkt}/>`;

  /* Gezicht (rond hoofdmiddelpunt 0,0) */
  const oogRy = Math.max(0.6, 3.4 * g.oogOpen);
  const brauwY = -11 - g.brauwHoogte;
  const brauw = (kant) => {
    const dy = (g.brauwHoek / 30) * 4 * kant;
    return `<path d="M ${kant * 6.5 - 5} ${(brauwY + dy).toFixed(1)} L ${kant * 6.5 + 5} ${(brauwY - dy).toFixed(1)}" fill="none" stroke="${INKT}" stroke-width="2.6" stroke-linecap="round"/>`;
  };
  const oog = (kant) => `
    <ellipse cx="${kant * 6.5}" cy="-3" rx="3.4" ry="${oogRy.toFixed(1)}" fill="#fff" stroke="${INKT}" stroke-width="1.6"/>
    <circle cx="${(kant * 6.5 + g.pupilX).toFixed(1)}" cy="${(-3 + g.pupilY * Math.min(1, g.oogOpen)).toFixed(1)}" r="${Math.min(1.9, oogRy).toFixed(1)}" fill="${INKT}"/>`;
  const mond = mondPad(g.mondBreedte, g.mondKrom, g.mondOpen);

  const gezicht = `
    ${oog(-1)}${oog(1)}
    ${brauw(-1)}${brauw(1)}
    <path d="M 0 0 q -2.5 3 0 4" fill="none" stroke="${INKT}" stroke-width="1.8" stroke-linecap="round"/>
    <g transform="translate(0,9)">
      <path d="${mond.d}" fill="${mond.gevuld ? '#9d3f3f' : 'none'}" stroke="${INKT}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    </g>
    ${o.blos ? '<circle cx="-11" cy="4" r="4" fill="#e08f84" opacity=".5"/><circle cx="11" cy="4" r="4" fill="#e08f84" opacity=".5"/>' : ''}
    ${o.snor ? `<path d="M -11 6 q 6 -5 11 -2 q 5 -3 11 2 q -6 5 -11 3 q -5 2 -11 -3 z" fill="${o.haarKleur}" ${inkt}/>` : ''}
    ${o.baard ? `<path d="M -16 0 q 2 22 16 22 q 14 0 16 -22 q -7 10 -16 10 q -9 0 -16 -10 z" fill="${o.haarKleur}" ${inkt}/>` : ''}
    ${o.bril ? `<g fill="none" stroke="${INKT}" stroke-width="2"><circle cx="-6.5" cy="-3" r="5.6"/><circle cx="6.5" cy="-3" r="5.6"/><path d="M -0.9 -3 h 1.8 M -12.1 -4 h -4 M 12.1 -4 h 4"/></g>` : ''}`;

  return `
    ${been(-1)}${been(1)}
    ${arm(armL)}
    <path d="M -17 -54 L -16 -94 Q -15 -103 0 -105 Q 15 -103 16 -94 L 17 -54 Z" fill="${o.shirt}" ${inkt}/>
    ${arm(armR)}
    <g transform="translate(0,-106) rotate(${p.hoofd}) translate(0,-18)">
      <rect x="-5" y="-4" width="10" height="12" fill="${o.huid}" ${inkt}/>
      <ellipse cx="0" cy="0" rx="17" ry="19" fill="${o.huid}" ${inkt}/>
      <ellipse cx="-17" cy="0" rx="3.4" ry="4.6" fill="${o.huid}" ${inkt}/>
      <ellipse cx="17" cy="0" rx="3.4" ry="4.6" fill="${o.huid}" ${inkt}/>
      ${haarPad(o.haar, o.haarKleur, inkt)}
      ${gezicht}
    </g>`;
}

/* ========================================================================
   TEKENEN — DECOR
   ===================================================================== */

function tekenDecor(o) {
  const inkt = `stroke="${INKT}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const k1 = o.kleur1 || '';
  const k2 = o.kleur2 || '';
  const A = (standaard) => k1 || standaard;
  const B = (standaard) => k2 || standaard;

  switch (o.vorm) {
    case 'huis':
      return `<rect x="-44" y="-72" width="88" height="72" fill="${A('#e5d8bf')}" ${inkt}/>
        <polygon points="-54,-72 0,-114 54,-72" fill="${B('#a8433c')}" ${inkt}/>
        <rect x="-14" y="-40" width="28" height="40" fill="#8a6a45" ${inkt}/>
        <circle cx="7" cy="-20" r="2.4" fill="${INKT}"/>
        <rect x="-36" y="-60" width="18" height="18" fill="#bcd9e8" ${inkt}/>
        <rect x="18" y="-60" width="18" height="18" fill="#bcd9e8" ${inkt}/>`;
    case 'schuur':
      return `<rect x="-50" y="-66" width="100" height="66" fill="${A('#a8433c')}" ${inkt}/>
        <path d="M -56 -66 L -30 -100 L 30 -100 L 56 -66 Z" fill="${B('#8d3530')}" ${inkt}/>
        <path d="M -24 0 v -50 h 48 v 50" fill="#e8ddc6" ${inkt}/>
        <path d="M -24 -50 L 24 0 M 24 -50 L -24 0" stroke="${A('#a8433c')}" stroke-width="4" fill="none"/>`;
    case 'boom':
      return `<rect x="-7" y="-46" width="14" height="46" fill="${B('#8a6a45')}" ${inkt}/>
        <circle cx="0" cy="-74" r="30" fill="${A('#5f9048')}" ${inkt}/>
        <circle cx="-22" cy="-58" r="20" fill="${A('#5f9048')}" ${inkt}/>
        <circle cx="22" cy="-58" r="20" fill="${A('#5f9048')}" ${inkt}/>`;
    case 'struik':
      return `<circle cx="-13" cy="-12" r="14" fill="${A('#6a9c50')}" ${inkt}/>
        <circle cx="12" cy="-12" r="13" fill="${A('#6a9c50')}" ${inkt}/>
        <circle cx="0" cy="-22" r="16" fill="${A('#6a9c50')}" ${inkt}/>`;
    case 'heuvel':
      return `<path d="M -120 0 q 120 -76 240 0 z" fill="${A('#7fae5c')}" ${inkt}/>`;
    case 'hek':
      return `<g ${inkt} fill="${A('#9a7d52')}">
          <rect x="-60" y="-40" width="9" height="40"/><rect x="-6" y="-40" width="9" height="40"/><rect x="48" y="-40" width="9" height="40"/>
          <rect x="-66" y="-34" width="130" height="7"/><rect x="-66" y="-18" width="130" height="7"/>
        </g>`;
    case 'koe':
      return `<ellipse cx="0" cy="-34" rx="46" ry="27" fill="${A('#fdfdfd')}" ${inkt}/>
        <ellipse cx="-20" cy="-40" rx="14" ry="10" fill="${B('#2b2118')}"/>
        <ellipse cx="14" cy="-26" rx="10" ry="8" fill="${B('#2b2118')}"/>
        <g ${inkt} stroke-width="7" stroke="${INKT}"><path d="M -26 -10 v 10 M -8 -10 v 10 M 10 -10 v 10 M 28 -10 v 10"/></g>
        <circle cx="44" cy="-52" r="17" fill="${A('#fdfdfd')}" ${inkt}/>
        <ellipse cx="52" cy="-45" rx="9" ry="7" fill="#eab3b3" ${inkt}/>
        <circle cx="40" cy="-58" r="2.6" fill="${INKT}"/>
        <path d="M 32 -66 q -4 -8 3 -9" fill="none" stroke="${INKT}" stroke-width="3"/>`;
    case 'kaaswiel':
      return `<ellipse cx="0" cy="-22" rx="38" ry="14" fill="${A('#e0a730')}" ${inkt}/>
        <path d="M -38 -22 v 12 a 38 14 0 0 0 76 0 v -12" fill="${B('#c68a1f')}" ${inkt}/>
        <circle cx="-12" cy="-24" r="4" fill="${B('#c68a1f')}"/>
        <circle cx="11" cy="-19" r="3" fill="${B('#c68a1f')}"/>`;
    case 'melkbus':
      return `<path d="M -16 0 L -19 -44 L -11 -54 L 11 -54 L 19 -44 L 16 0 Z" fill="${A('#b8bcc0')}" ${inkt}/>
        <rect x="-13" y="-62" width="26" height="9" rx="3" fill="${B('#9aa0a4')}" ${inkt}/>
        <path d="M -19 -30 h 38" stroke="${INKT}" stroke-width="2.4"/>`;
    case 'vat':
      return `<path d="M -26 0 q -6 -30 0 -60 h 52 q 6 30 0 60 z" fill="${A('#9a7d52')}" ${inkt}/>
        <path d="M -27 -44 h 54 M -27 -18 h 54" stroke="${B('#6f5636')}" stroke-width="5" fill="none"/>`;
    case 'tafel':
      return `<rect x="-58" y="-42" width="116" height="10" rx="3" fill="${A('#c49a62')}" ${inkt}/>
        <rect x="-48" y="-32" width="9" height="32" fill="${B('#8a6a45')}" ${inkt}/>
        <rect x="39" y="-32" width="9" height="32" fill="${B('#8a6a45')}" ${inkt}/>`;
    case 'stoel':
      return `<rect x="-20" y="-58" width="9" height="40" fill="${B('#8a6a45')}" ${inkt}/>
        <rect x="-22" y="-26" width="44" height="9" rx="3" fill="${A('#c49a62')}" ${inkt}/>
        <rect x="-20" y="-17" width="7" height="17" fill="${B('#8a6a45')}" ${inkt}/>
        <rect x="14" y="-17" width="7" height="17" fill="${B('#8a6a45')}" ${inkt}/>`;
    case 'bureau':
      return `<rect x="-60" y="-44" width="120" height="10" rx="3" fill="${A('#a8825a')}" ${inkt}/>
        <rect x="-56" y="-34" width="42" height="34" fill="${B('#8a6a45')}" ${inkt}/>
        <rect x="-48" y="-26" width="26" height="4" rx="2" fill="#e8ddc6"/>
        <rect x="46" y="-34" width="9" height="34" fill="${B('#8a6a45')}" ${inkt}/>`;
    case 'laptop':
      return `<path d="M -34 -2 L -28 -38 L 28 -38 L 34 -2 Z" fill="${B('#b8bcc0')}" ${inkt}/>
        <rect x="-30" y="-74" width="60" height="38" rx="3" fill="${A('#3a4550')}" ${inkt}/>
        <rect x="-25" y="-70" width="50" height="30" fill="#dce9f2"/>
        <polyline points="-18,-48 -6,-60 3,-54 16,-66" fill="none" stroke="#c8262a" stroke-width="3"/>`;
    case 'beeldscherm':
      return `<rect x="-8" y="-22" width="16" height="22" fill="${B('#6b7278')}" ${inkt}/>
        <rect x="-26" y="-12" width="52" height="8" rx="3" fill="${B('#6b7278')}" ${inkt}/>
        <rect x="-52" y="-84" width="104" height="64" rx="5" fill="${A('#3a4550')}" ${inkt}/>
        <rect x="-45" y="-77" width="90" height="50" fill="#e8f1f7"/>
        <polyline points="-34,-38 -14,-58 2,-46 22,-70 36,-52" fill="none" stroke="#c8262a" stroke-width="3.4" stroke-linecap="round"/>`;
    case 'whiteboard':
      return `<rect x="-62" y="-96" width="124" height="74" rx="4" fill="${A('#fdfbf4')}" ${inkt}/>
        <polyline points="-46,-42 -22,-70 -2,-54 22,-80 46,-56" fill="none" stroke="${B('#c8262a')}" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M -40 -22 L -50 0 M 40 -22 L 50 0" stroke="${INKT}" stroke-width="5" fill="none"/>`;
    case 'plant':
      return `<path d="M -16 0 L -12 -26 L 12 -26 L 16 0 Z" fill="${B('#b4794a')}" ${inkt}/>
        <path d="M 0 -26 q -26 -14 -16 -40 q 20 8 16 40 z" fill="${A('#5c8f4f')}" ${inkt}/>
        <path d="M 0 -26 q 26 -12 18 -38 q -22 8 -18 38 z" fill="${A('#5c8f4f')}" ${inkt}/>
        <path d="M 0 -26 q -4 -26 2 -38 q 8 16 -2 38 z" fill="${A('#5c8f4f')}" ${inkt}/>`;
    case 'doos':
      return `<rect x="-28" y="-40" width="56" height="40" fill="${A('#c89a62')}" ${inkt}/>
        <path d="M -28 -26 h 56" stroke="${B('#a07a48')}" stroke-width="4" fill="none"/>
        <path d="M -4 -40 v 40" stroke="${B('#a07a48')}" stroke-width="4" fill="none"/>`;
    case 'zon':
      return `<circle cx="0" cy="0" r="24" fill="${A('#f6d98f')}" ${inkt}/>
        <g stroke="${A('#f6d98f')}" stroke-width="5" stroke-linecap="round">
          <path d="M 0 -34 v -10 M 0 34 v 10 M -34 0 h -10 M 34 0 h 10 M -25 -25 l -7 -7 M 25 25 l 7 7 M 25 -25 l 7 -7 M -25 25 l -7 7"/>
        </g>`;
    case 'wolk':
      return `<g fill="${A('#fdfdfd')}" ${inkt}>
          <ellipse cx="-20" cy="4" rx="22" ry="15"/><ellipse cx="6" cy="-6" rx="26" ry="20"/><ellipse cx="28" cy="4" rx="20" ry="14"/>
        </g>`;
    default:
      return '';
  }
}

/* ========================================================================
   TEKENEN — BALLON EN TEKST
   ===================================================================== */

function breekTekst(tekst, breedte, grootte) {
  const maxTekens = Math.max(6, Math.floor((breedte - 20) / (grootte * 0.52)));
  const woorden = String(tekst || '').split(/\s+/).filter(Boolean);
  const regels = [];
  let regel = '';
  woorden.forEach(w => {
    const test = regel ? regel + ' ' + w : w;
    if (test.length > maxTekens && regel) { regels.push(regel); regel = w; }
    else regel = test;
  });
  if (regel) regels.push(regel);
  return regels.length ? regels : [' '];
}

function tekstRegels(regels, x, y, hoogte, grootte, kleur) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-strip-letter), sans-serif" font-size="${grootte}" font-weight="700" fill="${kleur || INKT}">
    ${regels.map((r, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : hoogte}">${escapeHtml(r)}</tspan>`).join('')}
  </text>`;
}

function ballonMaten(o) {
  const regels = breekTekst(o.tekst, o.breedte, o.grootte);
  const regelHoogte = o.grootte * 1.28;
  const hoogte = regels.length * regelHoogte + 16;
  return { regels: regels, regelHoogte: regelHoogte, hoogte: hoogte };
}

function tekenBallon(o) {
  const m = ballonMaten(o);
  const w = o.breedte, h = m.hoogte;
  const hw = w / 2, hh = h / 2;
  const tipX = o.staartDx, tipY = o.staartDy;
  const tekst = tekstRegels(m.regels, 0, -hh + 12 + o.grootte * 0.55, m.regelHoogte, o.grootte);
  const lijn = `fill="#fff" stroke="${INKT}" stroke-width="2.8" stroke-linejoin="round"`;

  if (o.soort === 'denk') {
    const bollen = [];
    const stappen = 10;
    for (let i = 0; i < stappen; i++) {
      const hoek = (i / stappen) * Math.PI * 2;
      bollen.push({ x: Math.cos(hoek) * (hw - 8), y: Math.sin(hoek) * (hh - 2), r: Math.max(11, hh * 0.52) });
    }
    const vormen = (attr) =>
      bollen.map(b => `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" ${attr}/>`).join('') +
      `<rect x="${-hw + 6}" y="${-hh + 2}" width="${w - 12}" height="${h - 4}" rx="14" ${attr}/>`;
    const richtingX = tipX < 0 ? -1 : 1;
    return `${vormen(lijn)}${vormen('fill="#fff"')}
      <circle cx="${(tipX * 0.45).toFixed(1)}" cy="${(tipY * 0.55).toFixed(1)}" r="7" ${lijn}/>
      <circle cx="${(tipX * 0.78 + richtingX * 2).toFixed(1)}" cy="${(tipY * 0.82).toFixed(1)}" r="4.4" ${lijn}/>
      ${tekst}`;
  }

  if (o.soort === 'roep') {
    const punten = 20;
    const d = [];
    for (let i = 0; i < punten; i++) {
      const hoek = (i / punten) * Math.PI * 2 - Math.PI / 2;
      const f = i % 2 === 0 ? 1 : 0.82;
      d.push(`${(Math.cos(hoek) * (hw + 6) * f).toFixed(1)},${(Math.sin(hoek) * (hh + 6) * f).toFixed(1)}`);
    }
    const basis = Math.max(-hw + 16, Math.min(hw - 16, tipX));
    return `<path d="M ${d.join(' L ')} Z" ${lijn}/>
      <path d="M ${basis - 11} ${hh - 2} L ${tipX} ${tipY} L ${basis + 11} ${hh - 4} Z" ${lijn}/>
      ${tekst}`;
  }

  const r = 14;
  const basis = Math.max(-hw + r + 14, Math.min(hw - r - 14, tipX));
  const pad = `M ${-hw + r} ${-hh}
    H ${hw - r} A ${r} ${r} 0 0 1 ${hw} ${-hh + r}
    V ${hh - r} A ${r} ${r} 0 0 1 ${hw - r} ${hh}
    H ${basis + 11} L ${tipX} ${tipY} L ${basis - 11} ${hh}
    H ${-hw + r} A ${r} ${r} 0 0 1 ${-hw} ${hh - r}
    V ${-hh + r} A ${r} ${r} 0 0 1 ${-hw + r} ${-hh} Z`;
  return `<path d="${pad}" ${lijn}/>${tekst}`;
}

function tekenTekstblok(o) {
  const regels = breekTekst(o.tekst, o.breedte, o.grootte);
  const regelHoogte = o.grootte * 1.3;
  const h = regels.length * regelHoogte + 12;
  return `<rect x="${-o.breedte / 2}" y="${-h / 2}" width="${o.breedte}" height="${h}" rx="3"
      fill="${o.kleur}" stroke="${INKT}" stroke-width="2.6"/>
    ${tekstRegels(regels, 0, -h / 2 + 10 + o.grootte * 0.55, regelHoogte, o.grootte)}`;
}

/* ========================================================================
   TEKENEN — VAKJE EN VEL
   ===================================================================== */

function tekenObject(o) {
  switch (o.type) {
    case 'figuur': return tekenFiguur(o);
    case 'decor': return tekenDecor(o);
    case 'ballon': return tekenBallon(o);
    case 'tekst': return tekenTekstblok(o);
    default: return '';
  }
}

/* Eén vakje. Zonder `keuze` levert dit een kale tekening op, zoals hij op
   het vel van de nieuwsbrief hoort; mét `keuze` komen de aanklikbare
   onderdelen en het handvat van de ballonstaart erbij. */
function tekenPaneel(p, nummer, keuze) {
  const B = paneelBreedte(p);
  const horizonY = PANEEL_HOOGTE * (p.horizon / 100);
  const selectie = keuze && keuze.selectie ? keuze.selectie : null;
  const isActief = !!(selectie && selectie.paneelId === p.id);

  const objecten = p.objecten.map(o => {
    const schaal = o.schaal === undefined ? 1 : o.schaal;
    const sx = (o.spiegel ? -schaal : schaal);
    const gekozen = !!(selectie && selectie.objId === o.id);
    const haken = keuze
      ? ` data-obj="${o.id}" data-paneel="${p.id}" class="strip-object${gekozen ? ' is-gekozen' : ''}"`
      : '';
    return `<g${haken} transform="translate(${o.x},${o.y}) scale(${sx},${schaal})">${tekenObject(o)}</g>`;
  }).join('');

  const gekozenBallon = selectie && selectie.objId
    ? p.objecten.find(o => o.id === selectie.objId && o.type === 'ballon')
    : null;
  const staartGreep = gekozenBallon
    ? `<circle class="staart-greep" data-greep="staart" data-obj="${gekozenBallon.id}" data-paneel="${p.id}"
         cx="${gekozenBallon.x + gekozenBallon.staartDx}" cy="${gekozenBallon.y + gekozenBallon.staartDy}" r="7"/>`
    : '';

  return `<div class="strip-vak${isActief ? ' is-actief' : ''}" style="flex:${p.gewicht}"${keuze ? ` data-vak="${p.id}"` : ''}>
    <svg viewBox="0 0 ${B} ${PANEEL_HOOGTE}" preserveAspectRatio="xMidYMid slice"${keuze ? ` data-paneel-svg="${p.id}"` : ''}>
      <defs>
        <pattern id="raster-${p.id}" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="${INKT}" opacity=".16"/>
        </pattern>
      </defs>
      <rect width="${B}" height="${horizonY}" fill="${p.lucht}"/>
      <rect y="${horizonY}" width="${B}" height="${PANEEL_HOOGTE - horizonY}" fill="${p.grond}"/>
      ${p.raster ? `<rect width="${B}" height="${horizonY}" fill="url(#raster-${p.id})"/>` : ''}
      <line x1="0" y1="${horizonY}" x2="${B}" y2="${horizonY}" stroke="${INKT}" stroke-width="2.4"/>
      ${objecten}
      ${staartGreep}
    </svg>
    ${keuze ? `<span class="vak-nummer">${nummer}</span>` : ''}
  </div>`;
}

/* Het hele stripvel als HTML. De strip maker geeft `interactief` mee om
   onderdelen aanklikbaar en versleepbaar te maken; de nieuwsbrief niet. */
function tekenStripHTML(strip, opties) {
  const keuze = (opties && opties.interactief) ? opties : null;
  let nummer = 0;
  const rijen = (strip.rijen || []).map(rij => {
    const totaal = rij.panelen.reduce((s, p) => s + p.gewicht, 0) || 1;
    const vakken = rij.panelen.map(p => tekenPaneel(p, ++nummer, keuze)).join('');
    return `<div class="strip-rij" style="aspect-ratio:${(totaal * EENHEID).toFixed(0)} / ${PANEEL_HOOGTE}">${vakken}</div>`;
  }).join('');

  return `
    <div class="strip-kop">
      <h1>${escapeHtml(strip.titel || 'CONO Strip')}</h1>
      ${strip.ondertitel ? `<span class="strip-ondertitel">${escapeHtml(strip.ondertitel)}</span>` : ''}
      ${strip.auteur ? `<span class="strip-auteur">${escapeHtml(strip.auteur)}</span>` : ''}
    </div>
    <div class="strip-rijen">${rijen}</div>`;
}

/* De strip zoals die in de strip maker is achtergelaten. */
function leesOpgeslagenStrip() {
  const strip = loadLocal('cono_strip_tekentafel_v1');
  return (strip && Array.isArray(strip.rijen) && strip.rijen.length) ? strip : null;
}
