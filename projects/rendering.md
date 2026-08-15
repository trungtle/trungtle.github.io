---
layout: page
id: rendering
title: 🌖 Rendering
---

## Personal Vulkan Rasterizer — Smoke Engine

A real-time 3D rendering engine I built in C++ and Vulkan as a personal project to explore modern graphics techniques.
It loads glTF 2.0 scenes and renders them through physically based, image-based-lit
pipelines with filmic tone mapping.

<ul class="tech-tags">
  <li>Vulkan</li>
  <li>C++</li>
  <li>glTF 2.0</li>
  <li>PBR (metallic-roughness)</li>
  <li>Image-based lighting</li>
  <li>Forward + deferred</li>
  <li>Bindless textures</li>
</ul>

**Rendering highlights**

- **Physically based rendering** with a metallic-roughness workflow and normal mapping.
- **Image-based lighting** — HDR environment maps converted to irradiance and radiance
  cubemaps in a compute pass for ambient diffuse and specular.
- **Forward and deferred pipelines**, with a bindless texture array indexing all
  materials in the forward pass.

<div class="gallery gallery-lead">
  <figure>
    <img src="/assets/images/vulkan_rasterizer/sponza_pbr.png" alt="Sponza rendered with PBR materials, image-based ambient lighting, and filmic tone mapping in Smoke Engine">
    <figcaption>Sponza — PBR materials, image-based ambient lighting, and filmic tone mapping.</figcaption>
  </figure>
  <figure>
    <img src="/assets/images/vulkan_rasterizer/bistro_1.png" alt="Amazon Lumberyard Bistro exterior scene rendered in Smoke Engine">
    <figcaption>Bistro — exterior street scene with PBR materials and image-based lighting.</figcaption>
  </figure>
  <figure>
    <img src="/assets/images/vulkan_rasterizer/helmet_papermill.png" alt="Sci-fi helmet lit by a sunlit ruins HDR environment">
    <figcaption>Helmet under an outdoor HDR environment — image-based specular and sun bloom.</figcaption>
  </figure>
  <figure>
    <img src="/assets/images/vulkan_rasterizer/helmet_turntable.gif" alt="Battle-damaged sci-fi helmet turntable showing emissive HUD and PBR metal">
    <figcaption>Damaged helmet turntable — emissive HUD detail and metallic-roughness surfaces.</figcaption>
  </figure>
</div>

<p class="credits">
<strong>Model credits.</strong>
<em>Sponza</em> — original model by Marko Dabrovic (2002), improved version by Frank Meinl / Crytek, with a PBR texture pack via <a href="https://www.alexandre-pestana.com/pbr-textures-sponza/">alexandre-pestana.com</a>.
<em>Battle Damaged Sci-fi Helmet — PBR</em> by <a href="https://sketchfab.com/theblueturtle_">theblueturtle_</a> (<a href="https://sketchfab.com/models/b81008d513954189a063ff901f7abfe4">Sketchfab</a>), published under a Creative Commons Attribution-NonCommercial license.
Both distributed via the <a href="https://github.com/KhronosGroup/glTF-Sample-Models">Khronos glTF Sample Models</a> collection.
<em>Amazon Lumberyard Bistro</em> — courtesy of Amazon Lumberyard, via the <a href="https://developer.nvidia.com/orca/amazon-lumberyard-bistro">NVIDIA Open Research Content Archive (ORCA)</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
</p>


<hr/>

## Personal Pathtracer

[**Repo** <i class="fab fa-github fa-lg icon"></i>](https://github.com/trungtle/Ray-tracer)

A personal ray tracer implementation mainly for studying path tracing techniques on my own. Implementation is based on [@Peter_shirley](https://twitter.com/Peter_shirley)'s [Ray Tracing in One Weekend](https://raytracing.github.io/) (a very fun series, I highly recommend!) and [PBRT](https://pbrt.org/).

<img src="https://github.com/trungtle/Ray-tracer/raw/master/images/checker_texture.png" alt="Ray traced spheres">

<img src="https://raw.githubusercontent.com/trungtle/Ray-tracer/master/images/cornellbox_800.png" alt ="Assorted ray traced objects">

<hr/>


## WebGL deferred renderer

[**Repo** <i class="fab fa-github fa-lg icon"></i>](https://github.com/trungtle/Project5-WebGL-Deferred-Shading-with-glTF)

A WebGL renderer built in my graduate study.

[Open in a new tab <i class="fas fa-external-link-alt fa-sm icon"></i>](http://www.trungtuanle.com/Project5-WebGL-Deferred-Shading-with-glTF/)

<div class="demo-embed" id="webgl-demo-embed">
  <img class="demo-embed-thumb" src="https://github.com/trungtle/Project5-WebGL-Deferred-Shading-with-glTF/raw/master/img/100_lights.gif" alt="WebGL renderer preview">
  <button type="button" class="demo-embed-play" onclick="
    var box = document.getElementById('webgl-demo-embed');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.trungtuanle.com/Project5-WebGL-Deferred-Shading-with-glTF/';
    iframe.title = 'WebGL deferred renderer — live demo';
    iframe.loading = 'lazy';
    iframe.allow = 'fullscreen';
    box.innerHTML = '';
    box.appendChild(iframe);
  ">
    <i class="fas fa-play"></i> Run live demo
  </button>
</div>
<p class="demo-embed-note">Runs the live WebGL build in place — requires a browser with WebGL support. Best on desktop; may be slow on mobile devices.</p>