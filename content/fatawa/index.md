---
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

<ul class="entry-list reversed" id="fatawa-list">
{% for s in collections.fatawa %}
  <li><a href="{{ s.url }}">
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
</script>
