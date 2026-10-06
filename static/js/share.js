// Copy citation / share link for a fatwa, plus per-paragraph links (#p-3).
// Paragraphs are numbered in the English and Arabic texts separately; when both have
// the same number of blocks, #p-3 points at the same passage in either language.
(function () {
  var tools = document.getElementById('share-tools');
  var prose = document.querySelector('.prose');
  var toast = document.getElementById('toast');
  if (!tools || !prose) return;

  function isAr() {
    return document.documentElement.getAttribute('data-lang') === 'ar';
  }

  var toastTimer;
  function notify(en, ar) {
    toast.textContent = isAr() ? ar : en;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }

  function copyNotify(text, en, ar) {
    copy(text).then(
      function () { notify(en, ar); },
      function () { notify('Could not copy', 'تعذّر النسخ'); }
    );
  }

  // --- Paragraph anchors ---
  var enBlock = prose.querySelector(':scope > [data-lang-en]');
  var arText = prose.querySelector(':scope > [data-lang-ar] .arabic');
  var linkSVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6.5 9.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.24l-.7.7"/><path d="M9.5 6.5a3 3 0 0 0-4.24 0L3.14 8.62a3 3 0 0 0 4.24 4.24l.7-.7"/></svg>';

  function number(container) {
    if (!container) return;
    Array.prototype.forEach.call(container.children, function (el, i) {
      el.setAttribute('data-para', i + 1);
      if (el.tagName !== 'P') return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'para-link';
      b.setAttribute('aria-label', 'Copy link to this paragraph');
      b.innerHTML = linkSVG;
      el.appendChild(b);
    });
  }

  number(enBlock);
  // Arabic numbering only means the same passage when the two texts line up
  if (enBlock && arText && enBlock.children.length === arText.children.length) number(arText);

  function paraUrl(n) {
    return tools.dataset.url + '#p-' + n;
  }

  // Delegated, so it also works on the clones in the side-by-side view
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.para-link');
    if (!b) return;
    var n = b.closest('[data-para]').getAttribute('data-para');
    history.replaceState(null, '', '#p-' + n);
    copyNotify(paraUrl(n), 'Link to paragraph copied', 'تم نسخ رابط الفقرة');
  });

  function goToHash() {
    var m = /^#p-(\d+)$/.exec(location.hash);
    if (!m) return;
    var targets = prose.querySelectorAll('[data-para="' + m[1] + '"]');
    var visible = Array.prototype.filter.call(targets, function (el) { return el.offsetParent !== null; });
    var el = visible[0];
    if (!el) return;
    var row = el.closest('.parallel-row');
    if (row) el = row;
    el.scrollIntoView({ block: 'center' });
    el.classList.remove('para-flash');
    void el.offsetWidth;
    el.classList.add('para-flash');
  }

  window.addEventListener('hashchange', goToHash);
  // Wait for layout (and the side-by-side view, built by a later script) before scrolling
  window.addEventListener('load', goToHash);

  // --- Toolbar buttons ---
  tools.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-action]');
    if (!b) return;
    if (b.dataset.action === 'cite') {
      copyNotify(isAr() ? tools.dataset.citationAr : tools.dataset.citationEn, 'Citation copied', 'تم نسخ التوثيق');
    } else if (navigator.share && matchMedia('(hover: none)').matches) {
      navigator.share({ title: document.title, url: tools.dataset.url }).catch(function () {});
    } else {
      copyNotify(tools.dataset.url, 'Link copied', 'تم نسخ الرابط');
    }
  });
})();
