---
layout: page
title: Tags
permalink: /tags/
image: /assets/images/author_cover.jpg
sitemap: false
---
{% for tag in site.tags %}
▶ [{{ tag.name }}]({{ site.baseurl }}/tags/{{ tag.name }})
{% endfor %}
