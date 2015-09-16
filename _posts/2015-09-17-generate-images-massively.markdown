---
layout: post
title: Generate images massively
---

Recently I developed a fully automated and very fast tool to generate images massively.

It uses the Firefox rendering capabilities, captures the result with
[web-renderer-java](https://github.com/arnodb/web-renderer/tree/master/web-renderer-java) (thanks to
[Selenium](http://www.seleniumhq.org/)) and cuts the big image into smaller pieces (thanks to
[ImageMagick](http://www.imagemagick.org/)).

Everything can be found in
[web-renderer](https://github.com/arnodb/web-renderer).

Simple example:

![Arno.db]({{ site.url }}/assets/web-renderer/card-arnodb.png)

