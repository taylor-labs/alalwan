// Reading view for bilingual (ar-en) works: English only, Arabic only, or side by side.
// English/Arabic reuse the site-wide language toggle; "both" builds a two-column view,
// pairing paragraphs row by row when the two texts have the same number of blocks.
(function () {
  var toolbar = document.getElementById('reading-view');
  var prose = document.querySelector('.prose');
  if (!toolbar || !prose) return;
  var enBlock = prose.querySelector(':scope > [data-lang-en]');
  var arText = prose.querySelector(':scope > [data-lang-ar] .arabic');
  if (!enBlock || !arText) return;

  var KEY = 'alwan_reading_view';
  var parallel = null;

  function cell(node, lang) {
    var c = document.createElement('div');
    c.className = lang === 'ar' ? 'parallel-ar arabic' : 'parallel-en';
    c.lang = lang;
    c.dir = lang === 'ar' ? 'rtl' : 'ltr';
    node.forEach(function (n) { c.appendChild(n.cloneNode(true)); });
    return c;
  }

  function row(en, ar) {
    var r = document.createElement('div');
    r.className = 'parallel-row';
    r.appendChild(cell(en, 'en'));
    r.appendChild(cell(ar, 'ar'));
    return r;
  }

  function build() {
    var en = Array.prototype.slice.call(enBlock.children);
    var ar = Array.prototype.slice.call(arText.children);
    parallel = document.createElement('div');
    parallel.className = 'parallel';
    parallel.dir = 'ltr'; // keep English left / Arabic right in both site languages
    if (en.length === ar.length) {
      en.forEach(function (p, i) { parallel.appendChild(row([p], [ar[i]])); });
    } else {
      parallel.classList.add('parallel-unaligned');
      parallel.appendChild(row(en, ar));
    }
    var arBlock = arText.closest('[data-lang-ar]');
    arBlock.parentNode.insertBefore(parallel, arBlock.nextSibling);
  }

  function isAr() {
    return document.documentElement.getAttribute('data-lang') === 'ar';
  }

  function readSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function setBoth(on) {
    if (on && !parallel) build();
    prose.classList.toggle('is-parallel', on);
    try { localStorage.setItem(KEY, on ? 'both' : 'single'); } catch (e) {}
    sync();
  }

  function sync() {
    var view = prose.classList.contains('is-parallel') ? 'both' : (isAr() ? 'ar' : 'en');
    toolbar.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === view);
      b.setAttribute('aria-pressed', b.dataset.view === view);
    });
  }

  toolbar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-view]');
    if (!b) return;
    if (b.dataset.view === 'both') { setBoth(true); return; }
    setBoth(false);
    if ((b.dataset.view === 'ar') !== isAr()) document.getElementById('lang-toggle').click();
  });

  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  toolbar.hidden = false;
  setBoth(readSaved() === 'both');
})();
