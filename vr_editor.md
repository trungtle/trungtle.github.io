---
layout: page
title: 🏔️ Unreal VR Editor
---

The folllowing are my work during an internship with Epic Games under the supervision of [Mike Fricker](https://twitter.com/mike_fricker)

## [Foliage Painting (Unreal 4.13 release)](https://docs.unrealengine.com/latest/INT/Support/Builds/ReleaseNotes/2016/4_13/index.html)

I implemented foliage painting in VR mode by enabling the VR controllers to interact with the UI panels and project the foliage placing onto the virtual world. The "Foliage" painting mode can now be summoned from the UI panel. This feature is included in Unreal 4.13 release.

<img src="https://docs.unrealengine.com/Images/WhatsNew/Builds/ReleaseNotes/2016/4_13/image_27.gif" alt="foliage painting">

## [Landscape Editing (Unreal 4.14 release)](https://docs.unrealengine.com/en-US/WhatsNew/Builds/ReleaseNotes/2016/4_14/index.html)

In this project, I migrated several sets of landscape editing tools and enabled it in VR mode. User can now summon the "Landscape" mode from the UI panel and select which brush they want to use for painting. It is quite trickier than the foliage painting mode, since there are a lot more tools to consider for reasonable controlling scheme. We had to drop tools that require hit proxies selection, such as ramp tool etc. This feature is included in Unreal 4.14 release.

<img src="https://docs.unrealengine.com/Images/WhatsNew/Builds/ReleaseNotes/2016/4_14/image_49.gif" alt="Landscape editing">

## VR Keyboard

I prototyped several VR typing schemes in the Unreal Engine.

<iframe width="560" height="315" src="https://www.youtube.com/embed/_h1euVvZpvg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Time**:

- [0:00] Monocle mode (raycast from eye through a point hovering above hand)
- [1:13] Single-pronged drum
- [2:25] Dual-pronged drum
- [3:35] Flat projection (orthogonal raycasting from hand to keyboard surface)
- [4:46] Laser
- [5:57] Monocle (2nd time)

#### Laser

This mode uses ray casting from the hand's position and forward vector to intersect with the keyboard screen. It is the most commonly used in VR applications right now, but presents certain limitation introduces by error from hand's movement.

#### Monocle

Similar to the laser mode, but instead of casting a ray from the hand's position, it casts a ray from the user's camera position toward the hand's position.

#### Single-pronged drum

As it sounds like! This mode allows user to type as if playing on a drumset. This idea is inspired by [Google Daydream Drum Keys](https://youtu.be/QYwzSEAyn2M).

#### Dual-pronged drum
    
An extension of single-pronged drum mode. The reasoning for this is that a typist can learn to perfect typing with for than a single stick per hand by practicing on wrist rotation.


#### Flat projection

Instead of casting a ray at the screen, I implemented a world aligned projection from the user's hands to the keyboard screen parallel to the ground. The advantage of this mode is that it completely eliminates errors introduced by orientation (from shaking wrists).
