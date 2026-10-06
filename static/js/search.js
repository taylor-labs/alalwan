// Full-text site search backed by Pagefind (index built into /pagefind/ after eleventy).
(function () {
  var pagefind = null;
  var typeLabels = {
    fatwa:   { en: 'fatwa',   ar: 'فتوى' },
    scholar: { en: 'scholar', ar: 'عالم' },
    poem:    { en: 'poem',    ar: 'قصيدة' },
    book:    { en: 'book',    ar: 'كتاب' },
    poet:    { en: 'poet',    ar: 'شاعر' },
    page:    { en: 'page',    ar: 'صفحة' }
  };

  function isAr() {
    return document.documentElement.getAttribute('data-lang') === 'ar';
  }

  function loadPagefind() {
    if (!pagefind) {
      pagefind = import('/pagefind/pagefind.js').then(function (pf) {
        return pf.options({ excerptLength: 24 }).then(function () { return pf; });
      });
    }
    return pagefind;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function message(text) {
    return '<p class="search-result">' + escapeHTML(text) + '</p>';
  }

  function renderHit(d) {
    var ar = isAr();
    var title = ar && d.meta.title_ar ? d.meta.title_ar : d.meta.title;
    var type = typeLabels[d.meta.type];
    var badge = type ? '<span class="result-type">' + (ar ? type.ar : type.en) + '</span>' : '';
    // Pagefind excerpts are already HTML-escaped, with matches wrapped in <mark>.
    return '<a class="search-result" href="' + escapeHTML(d.url) + '">' +
      '<span class="search-result-title"' + (ar && d.meta.title_ar ? ' dir="rtl"' : '') + '>' + badge + escapeHTML(title) + '</span>' +
      '<span class="search-result-excerpt" dir="auto">' + d.excerpt + '</span>' +
      '</a>';
  }

  // Wire an <input> to a results container. Arrow keys move through results.
  function attach(input, results) {
    input.addEventListener('focus', loadPagefind, { once: true });

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }
      loadPagefind().then(function (pf) {
        return pf.debouncedSearch(q, {}, 200);
      }).then(function (search) {
        if (search === null) return; // superseded by a newer keystroke
        if (!search.results.length) {
          results.innerHTML = message(isAr() ? 'لا توجد نتائج.' : 'No results.');
          return;
        }
        return Promise.all(search.results.slice(0, 10).map(function (r) { return r.data(); }))
          .then(function (hits) {
            if (input.value.trim() !== q) return;
            results.innerHTML = hits.map(renderHit).join('');
          });
      }).catch(function () {
        results.innerHTML = message(isAr() ? 'البحث غير متاح حالياً.' : 'Search is unavailable right now.');
      });
    });

    function move(delta) {
      var links = Array.prototype.slice.call(results.querySelectorAll('a.search-result'));
      if (!links.length) return;
      var i = links.indexOf(document.activeElement);
      var next = i + delta;
      if (next < 0) { input.focus(); return; }
      links[Math.min(next, links.length - 1)].focus();
    }

    [input, results].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter' && el === input) {
          var first = results.querySelector('a.search-result');
          if (first) { e.preventDefault(); first.click(); }
        }
      });
    });
  }

  window.alwanSearch = { attach: attach };

  // Header search dialog
  var dialog = document.getElementById('search-dialog');
  var openBtn = document.getElementById('search-toggle');
  if (!dialog || !openBtn) return;
  var dialogInput = dialog.querySelector('.search-input');
  attach(dialogInput, dialog.querySelector('.search-results'));

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    dialogInput.focus();
    dialogInput.select();
  }

  openBtn.addEventListener('click', open);
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close(); // click on backdrop
  });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      open();
    }
  });
})();
