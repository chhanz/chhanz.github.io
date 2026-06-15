---
layout: page
title: Authors
permalink: /authors/
sitemap: false
---
{% for author in site.authors %}
* [{{ author.name }}]({{ site.baseurl }}/authors/{{ author.name }}/)
{% endfor %}
