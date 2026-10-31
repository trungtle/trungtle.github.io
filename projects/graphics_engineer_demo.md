---
layout: page
id: graphics_engineer_demo
title: 💡 Making Waves Academy's Career Fair Graphics Engineer Demo
---

## Light Lab

[**Repo** <i class="fab fa-github fa-lg icon"></i>](https://github.com/trungtle/graphics-engineer-demo)

A live demo of pathtracing that I created for [Making Waves Academy](https://makingwavesacademy.org/)'s Career Fair on Oct 27th, 2026. It is deigned to help students understand how light interacts and bounces around a 3D environment.

<p class="demo-actions">
  <a class="js-demo-toggle" href="#lightlab-embed"><strong>Play</strong> <i class="fas fa-play fa-lg icon"></i></a>
  <a class="js-demo-window" href="https://www.trungtuanle.com/graphics-engineer-demo/" target="_blank" rel="noopener"><strong>Open in new window</strong> <i class="fas fa-external-link-alt fa-lg icon"></i></a>
</p>
<div class="demo-container" id="lightlab-embed">
  <img class="demo-embed-thumb" src="{% link /assets/images/graphics_engineer_demo/light_lab_poster.jpg %}" alt="Light Lab: a path-traced Cornell box above the rendering equation and its controls">
  <button type="button" class="demo-embed-play"><i class="fas fa-play"></i> <span>Run live demo</span></button>
</div>

<script>
  // The demo starts as a poster and only runs (and uses the GPU) after a click.
  // "Open in new window" stops the embedded copy so the two never share the GPU;
  // if pop-ups are blocked the link opens a new tab instead.
  (function () {
    var SRC = 'https://www.trungtuanle.com/graphics-engineer-demo/';
    var box = document.getElementById('lightlab-embed');
    var poster = box.innerHTML;
    var toggle = document.querySelector('.js-demo-toggle');
    var playing = false;
    var win = null;
    var watch = 0;

    function showPoster(label) {
      box.innerHTML = poster;
      setPlaying(false);
      box.querySelector('.demo-embed-play span').textContent = label || 'Run live demo';
      box.querySelector('.demo-embed-play').addEventListener('click', play);
    }
    function play() {
      if (win && !win.closed) win.close();
      clearInterval(watch);
      box.innerHTML = '<iframe src="' + SRC + '" title="Light Lab: interactive path tracer" allow="fullscreen" allowfullscreen></iframe>';
      setPlaying(true);
    }
    function setPlaying(on) {
      playing = on;
      toggle.innerHTML = on
        ? '<strong>Stop</strong> <i class="fas fa-stop fa-lg icon"></i>'
        : '<strong>Play</strong> <i class="fas fa-play fa-lg icon"></i>';
    }

    showPoster();
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (playing) showPoster();
      else play();
    });
    document.querySelectorAll('.js-demo-window').forEach(function (link) {
      link.addEventListener('click', function (e) {
        win = window.open(link.href, 'light-lab',
          'popup,left=0,top=0,width=' + screen.availWidth + ',height=' + screen.availHeight);
        if (!win) return;
        e.preventDefault();
        win.focus();
        showPoster('Running in its own window: play here instead');
        clearInterval(watch);
        watch = setInterval(function () {
          if (win.closed) {
            clearInterval(watch);
            if (box.querySelector('.demo-embed-play')) showPoster();
          }
        }, 1000);
      });
    });
  })();
</script>

- **Light Lab**: a live path tracer with adjustable lights, materials, camera and triangle meshes. Select **"Be a Photon"** to follow the scene from the POV of a photon!
- **Mirrors**: a path-traced optical bench puzzle game.
- **MIS**: Veach's scene comparing BSDF sampling, light sampling and multiple importance sampling.
- **Water**: a 2D FLIP fluid simulation.

## Career Fair Handout

[**Download (PDF)** <i class="fas fa-download fa-lg icon"></i>]({% link /assets/doc/graphics_engineer_career_handout.pdf %})

<a href="{% link /assets/doc/graphics_engineer_career_handout.pdf %}">
<img src="{% link /assets/images/graphics_engineer_demo/career_handout.webp %}" alt="Breaking into games as a graphics engineer: career fair handout" loading="lazy">
</a>
