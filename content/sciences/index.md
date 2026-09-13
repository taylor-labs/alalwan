---
layout: layouts/base.njk
title: Sciences
title_ar: "العلوم"
permalink: /sciences/
---

<p><span data-lang-en>Browse by science:</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">تصفح حسب العلم:</span></p>

<ul class="entry-list">
{% for s in collections.sciences %}
  <li><a href="{{ s.url }}">
    {% if s.data.title_ar %}<span data-lang-en>{{ s.data.title }}</span><span data-lang-ar lang="ar" dir="rtl" class="ar-label">{{ s.data.title_ar }}</span>{% else %}{{ s.data.title }}{% endif %}
  </a></li>
{% endfor %}
</ul>
