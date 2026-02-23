---
layout: page
title: Tags
permalink: /tags/
image: /assets/images/author_cover.jpg
sitemap:
  priority: 0.7
---
{% for tag in site.tags %}
▶ [{{ tag.name }}]({{ site.baseurl }}/tags/{{ tag.name }})
{% endfor %}
