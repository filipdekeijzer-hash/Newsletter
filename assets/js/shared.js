/* Gedeelde hulpfuncties voor de nieuwsbrief- en stripbouwer. */

function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 10);
}

function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Zet platte tekst met enters om naar veilige <p>-blokken voor de preview.
function textToParagraphs(str) {
  if (!str) return '';
  return String(str)
    .split(/\n{2,}/)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Laat alleen echte web-links door, zodat een geïmporteerd bestand geen
// javascript:-link in de nieuwsbrief kan zetten.
function safeUrl(str) {
  if (!str) return '';
  const trimmed = String(str).trim();
  try {
    const parsed = new URL(trimmed, window.location.href);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '';
  } catch (e) {
    return '';
  }
}

function saveLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Opslaan mislukt:', e);
    return false;
  }
}

function loadLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Laden mislukt:', e);
    return null;
  }
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Een bestand opslaan. In een gewone browser (lokaal of op een webserver)
   kan dat rechtstreeks. In de gedeelde online versie draait de pagina
   afgeschermd en loopt opslaan via de host, die het de kijker eerst vraagt. */
function bewaarBestand(filename, data, json, knop) {
  const oorspronkelijk = knop.textContent;
  const melding = (tekst) => {
    knop.textContent = tekst;
    setTimeout(() => { knop.textContent = oorspronkelijk; }, 2500);
  };

  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then((downloads) => {
      if (!downloads) {
        melding('Opslaan kan hier niet — gebruik Kopiëren');
        return;
      }
      return downloads.save({ filename, data: json }).then(
        () => melding('✓ Opgeslagen'),
        (fout) => {
          if (fout && fout.code === 'declined') return;
          melding('Opslaan lukte niet — gebruik Kopiëren');
        }
      );
    });
    return;
  }

  downloadJSON(filename, data);
}

/* Exporteren via een dialoog met zowel "kopiëren" als "opslaan": kopiëren
   werkt overal, opslaan waar de omgeving dat toestaat. */
function exporteerJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);
  const vorigeFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'deel-overlay';
  overlay.innerHTML = `
    <div class="deel-kaart" role="dialog" aria-modal="true" aria-label="Exporteren">
      <h3>Deze editie bewaren of delen</h3>
      <p>Kopieer de tekst hieronder en bewaar 'm, of mail 'm naar een collega. Met <strong>Importeer JSON</strong> laadt diegene de editie precies zo weer in.</p>
      <textarea readonly rows="8" class="deel-tekst"></textarea>
      <div class="deel-knoppen">
        <button type="button" class="btn btn-primary" data-deel="kopieer">📋 Kopieer naar klembord</button>
        <button type="button" class="btn btn-ghost" data-deel="download">💾 Opslaan als bestand</button>
        <button type="button" class="btn btn-ghost" data-deel="sluit">Sluiten</button>
      </div>
    </div>`;

  const tekstvak = overlay.querySelector('.deel-tekst');
  tekstvak.value = json;

  function sluit() {
    overlay.remove();
    document.removeEventListener('keydown', opToets);
    if (vorigeFocus && vorigeFocus.focus) vorigeFocus.focus();
  }
  function opToets(e) { if (e.key === 'Escape') sluit(); }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { sluit(); return; }
    const knop = e.target.closest('button[data-deel]');
    if (!knop) return;

    if (knop.dataset.deel === 'sluit') {
      sluit();
    } else if (knop.dataset.deel === 'download') {
      bewaarBestand(filename, data, json, knop);
    } else {
      tekstvak.select();
      const klaar = () => { knop.textContent = '✓ Gekopieerd'; setTimeout(() => { knop.textContent = '📋 Kopieer naar klembord'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(klaar, () => { knop.textContent = 'Kopiëren lukte niet — selecteer de tekst en gebruik Ctrl+C'; });
      } else {
        knop.textContent = 'Selecteer de tekst en gebruik Ctrl+C';
      }
    }
  });

  document.addEventListener('keydown', opToets);
  document.body.appendChild(overlay);
  tekstvak.focus();
  tekstvak.select();
}

function readJSONFile(file, onLoaded, onError) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      onLoaded(data);
    } catch (e) {
      if (onError) onError(e);
      else console.warn('Kon bestand niet lezen:', e);
    }
  };
  reader.onerror = () => { if (onError) onError(reader.error); };
  reader.readAsText(file);
}

function showStatus(el, message, revertAfterMs) {
  if (!el) return;
  el.textContent = message;
  if (revertAfterMs) {
    setTimeout(() => { el.textContent = 'Automatisch opgeslagen in deze browser.'; }, revertAfterMs);
  }
}

function todayNL() {
  const d = new Date();
  const maanden = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  return `${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}
