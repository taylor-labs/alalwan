---
searchable: false
layout: layouts/base.njk
title: Fatawa
title_ar: "الفتاوى"
permalink: /fatawa/
nav: true
---

<h1><span data-lang-en>Fatawa</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">الفتاوى</span></h1>

<p class="page-sub"><span data-lang-en>Rulings and responses from Shaykh Sulayman al-Alwan</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">أحكام وأجوبة الشيخ سليمان بن ناصر العلوان</span></p>

<p><a href="/fatawa/sessions/"><span data-lang-en>Browse by session</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">تصفح حسب الجلسة</span></a></p>

<div class="sort-toggle" id="fatawa-sort">
  <button type="button" data-order="new" class="active"><span data-lang-en>Newest first</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">الأحدث أولاً</span></button>
  <button type="button" data-order="old"><span data-lang-en>Oldest first</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">الأقدم أولاً</span></button>
</div>

<div class="fatawa-filters" id="fatawa-filters">
  <div class="sort-toggle" role="group" aria-label="Filter by science">
    <button type="button" data-science="" class="active"><span data-lang-en>All</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">الكل</span></button>
    {%- for sci in collections.sciences %}
    <button type="button" data-science="{{ sci.data.science }}"><span data-lang-en>{{ sci.data.title }}</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">{{ sci.data.title_ar }}</span></button>
    {%- endfor %}
  </div>
  <select class="filter-select" id="session-filter" aria-label="Filter by session">
    <option value="" data-en="All sessions" data-ar="كل الجلسات">All sessions</option>
    {%- for s in sessions %}
    <option value="{{ s.number }}" data-en="{{ s.name }}" data-ar="{{ s.name_ar }}">{{ s.name }}</option>
    {%- endfor %}
  </select>
</div>

<p class="filter-count" id="filter-count" aria-live="polite"></p>

<ul class="entry-list reversed" id="fatawa-list">
{% for s in collections.fatawa %}
  <li data-sciences="{{ s.data.sciences | join: ' ' }}" data-session="{{ s.data.session }}"><a href="{{ s.url }}">
    {% if s.data.title_ar %}<span data-lang-en>{{ s.data.title }}</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">{{ s.data.title_ar }}</span>{% else %}{{ s.data.title }}{% endif %}
    {% if s.data.date_added %}<span class="entry-meta">{{ s.data.date_added | readableDate }}</span>{% endif %}
  </a></li>
{% endfor %}
</ul>

<script>
  (function() {
    var list = document.getElementById('fatawa-list');
    var buttons = document.querySelectorAll('#fatawa-sort button');
    var saved = localStorage.getItem('alwan_fatawa_order') || 'new';

    function applyOrder(order) {
      list.classList.toggle('reversed', order === 'new');
      buttons.forEach(function(b) {
        b.classList.toggle('active', b.dataset.order === order);
      });
    }

    buttons.forEach(function(b) {
      b.addEventListener('click', function() {
        localStorage.setItem('alwan_fatawa_order', b.dataset.order);
        applyOrder(b.dataset.order);
      });
    });

    applyOrder(saved);
  })();

  // Science / session filters, mirrored in the URL (?science=fiqh&session=17) so a filtered view can be shared
  (function() {
    var items = Array.prototype.slice.call(document.querySelectorAll('#fatawa-list li'));
    var sciButtons = document.querySelectorAll('#fatawa-filters button[data-science]');
    var sessionSelect = document.getElementById('session-filter');
    var countEl = document.getElementById('filter-count');
    var params = new URLSearchParams(location.search);
    var state = { science: params.get('science') || '', session: params.get('session') || '' };

    function isAr() { return document.documentElement.getAttribute('data-lang') === 'ar'; }

    function apply() {
      var shown = 0;
      items.forEach(function(li) {
        var ok = (!state.science || li.dataset.sciences.split(' ').indexOf(state.science) !== -1) &&
                 (!state.session || li.dataset.session === state.session);
        li.hidden = !ok;
        if (ok) shown++;
      });
      sciButtons.forEach(function(b) { b.classList.toggle('active', b.dataset.science === state.science); });
      sessionSelect.value = state.session;
      var filtered = state.science || state.session;
      if (!shown) countEl.textContent = isAr() ? 'لا توجد فتاوى مطابقة.' : 'No fatawa match these filters.';
      else if (filtered) countEl.textContent = isAr() ? ('عرض ' + shown + ' من ' + items.length) : ('Showing ' + shown + ' of ' + items.length);
      else countEl.textContent = '';

      var q = new URLSearchParams();
      if (state.science) q.set('science', state.science);
      if (state.session) q.set('session', state.session);
      var qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }

    function labelOptions() {
      var ar = isAr();
      Array.prototype.forEach.call(sessionSelect.options, function(o) { o.textContent = ar ? o.dataset.ar : o.dataset.en; });
      apply();
    }

    sciButtons.forEach(function(b) {
      b.addEventListener('click', function() { state.science = b.dataset.science; apply(); });
    });
    sessionSelect.addEventListener('change', function() { state.session = sessionSelect.value; apply(); });
    new MutationObserver(labelOptions).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
    labelOptions();
  })();
</script>
