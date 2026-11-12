---
layout: page
id: memreport
title: 📊 Unreal Memreport Viewer
---

[**Repo** <i class="fab fa-github fa-lg icon"></i>](https://github.com/trungtle/memreport)

A viewer for Unreal Engine memory report (`.memreport`) files. Built with React, TypeScript, and Vite.

<p class="demo-actions">
  <a href="https://www.trungtuanle.com/memreport/" target="_blank" rel="noopener"><strong>Open in new window</strong> <i class="fas fa-external-link-alt fa-lg icon"></i></a>
</p>

{% assign shots = "summary:Summary,textures:Textures,static_meshes:Static Meshes,render_targets:Render Targets,rhi_resource:RHI Resource,statgroup:STATGROUP" | split: "," %}
<div class="carousel" id="memreport-carousel" role="region" aria-roledescription="carousel" aria-label="Unreal Memreport Viewer screenshots">
  <div class="carousel-track" tabindex="0">
    {% for shot in shots %}{% assign parts = shot | split: ":" %}
    <figure class="carousel-slide" aria-roledescription="slide" aria-label="{{ forloop.index }} of {{ forloop.length }}: {{ parts[1] }}">
      <img src="{% link /assets/images/memreport/memreport_{{ parts[0] }}.jpg %}" alt="Unreal Memreport Viewer, {{ parts[1] }} tab, showing a Third Person template memreport"{% unless forloop.first %} loading="lazy"{% endunless %}>
    </figure>
    {% endfor %}
  </div>
  <button type="button" class="carousel-btn carousel-prev" aria-label="Previous screenshot"><i class="fas fa-chevron-left"></i></button>
  <button type="button" class="carousel-btn carousel-next" aria-label="Next screenshot"><i class="fas fa-chevron-right"></i></button>
  <p class="carousel-caption"><span class="carousel-label">Summary</span> <span class="carousel-count">1 / {{ shots.size }}</span></p>
</div>

<script>
  // Scroll-snap carousel: swipe or scroll works on its own; the buttons and
  // arrow keys step one slide, and the caption follows the visible slide.
  (function () {
    var root = document.getElementById('memreport-carousel');
    var track = root.querySelector('.carousel-track');
    var slides = root.querySelectorAll('.carousel-slide');
    var label = root.querySelector('.carousel-label');
    var count = root.querySelector('.carousel-count');
    var index = 0;
    function show(i) {
      index = i;
      label.textContent = slides[i].getAttribute('aria-label').replace(/^.*?: /, '');
      count.textContent = (i + 1) + ' / ' + slides.length;
    }
    // While a button-driven scroll animates, the caption already shows the
    // target; the in-between scroll position must not overwrite it.
    var pending = false;
    function go(i) {
      i = (i + slides.length) % slides.length;
      show(i);
      pending = true;
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }
    function settle() {
      pending = false;
      show(Math.round(track.scrollLeft / track.clientWidth));
    }
    root.querySelector('.carousel-prev').addEventListener('click', function () { go(index - 1); });
    root.querySelector('.carousel-next').addEventListener('click', function () { go(index + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });
    // Sync the caption once any scroll (button, swipe, trackpad) has settled.
    if ('onscrollend' in window) {
      track.addEventListener('scrollend', settle);
    } else {
      var t;
      track.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(settle, pending ? 400 : 150);
      });
    }
  })();
</script>
