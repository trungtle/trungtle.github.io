---
layout: page
id: digital_art
title: 🖌️ Digital Art

images:
  - image: Candlekeep_Adventurers.png
  - image: Llama.PNG
  - image: Figure_Drawing.png
  - image: Kaiju_Cleanup.png
---

{% for item in page.images %}
<div class="lightbox" id="lightbox{{ forloop.index }}">
  <div class="table">
    <div class="table-cell">
	  <img src="/assets/images/digital_art/{{item.image}}" alt="{{item.image}}" style="float: left; margin: 0px 20px 20px 0px; width: 100%">
    </div>
  </div>
</div>
{% endfor %}

