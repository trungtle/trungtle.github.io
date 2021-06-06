---
layout: page
title: 🖌️ Digital Art

images:
  - image: Candlekeep_Adventurers.png
  - image: Spheres.png
  - image: Blink_Final.jpg
  - image: Kaiju_Cleanup.png
  - image: Llama.PNG
  - image: Fish.png
  - image: Figure_Drawing.png
---

I doodle sometimes. Follow me on [<i class="fab fa-instagram fa-med"></i> @trung_sketchbook](https://www.instagram.com/trung_sketchbook/?hl=en).


{% for item in page.images %}
<div class="lightbox" id="lightbox{{ forloop.index }}">
  <div class="table">
    <div class="table-cell">
	  <img src="/assets/images/digital_art/{{item.image}}" alt="{{item.image}}" style="float: left; margin: 0px 20px 20px 0px; width: 100%">
    </div>
  </div>
</div>
{% endfor %}

<!-- <img width=1024x src="{% link /assets/images/digital_art/Kaiju_Cleanup.png %}" alt="Kaiju_Cleanup" style="float: left; margin: 0px 15px 0px 0px;"> -->

