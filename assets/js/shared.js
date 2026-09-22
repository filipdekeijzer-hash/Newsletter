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
