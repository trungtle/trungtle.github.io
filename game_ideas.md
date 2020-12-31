---
layout: page
title: 🎲 Game Ideas
---

Here are a collection of game ideas that I tinker with over the years.

## Shires

A 2-person board game that blends between tradition chess and capture-the-flag. The objective of the game is to move your units through various portals and capture your opponent's zone.

<iframe width="560" height="315" src="https://www.youtube.com/embed/DY3OcfuWLh8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Board

There are five zones, or shires:

- **Red shire**: the starting shire for red player
- **Blue shire**: the starting shire for blue player
- **Neutral shires**:

    - Orange shire: this represents the Hill. Hill gives +1 Rook bonus.
    - Teal shire: this represents the River. River grants Lord the ability to attack.
    - Purple shire: this represents the Valley. Valley converts Lord's movement to a Knight.

At the center of each shire is the capture tile. In order to capture a shire, a Lord unit must land on this tile. Capturing netraul shires gives a player different bonuses, but capturing the opponent's shire is the final objective. Neutral shire can be recaptured and the bonus would transfer to the player who currently controls that shire. The board contains destructable rocks in grey. Destructable rocks can only be destroyed by a Rook. Once destroyed, destructable rocks will respawn after several turns. To travel from one shire to the other, the unit needs to enter a portal. The links between portals are indicated by the text on the portal. Unit can't immediately re-enter portals, meaning the have to make a move within the same shire before reentering the portal again.

### Units

- Lord: the lord is the ONLY unit that can capture a shire. Lord moves 2 tiles in straight line. The Lord cannot attack another unit.
- Knight: the Knight can hop to exactly 3 tiles away. Knight can attack another unit.
- Rook: the Rook moves in straight lines across the length of a shire. Rook can attack another unit can destroy rocks.

If a unit is attacked, it will respawn at the starting location after several turns.

### Objective

The objective of the game is to capture the opponent's shire. The game is over once a red Lord lands on blue's capture tile, or vice versa.

### Development

Shires was created in Unity3D using C#.

<hr/>
## Project Em

[**Repo** <i class="fab fa-github fa-lg icon"></i>](https://github.com/project-em/unreal-demo)

<img src="{% link /assets/images/project_em/gallery_full.jpg %}" alt="Project Em screenshot">

Project Em was a game project for a school competition that I worked on with some friends. It was placed 2nd at Penn Apps XIV in 2016. **Project Em** a voice-control 3D puzzle platform game that uses Amazon's [Alexa](http://alexa.amazon.com/spa/index.html) API to interact with an AI character in game, named _Em_. 

The game uses speech as the sole way of communication - by having the player speak directly into a mic - to the character named "Em". Player can inquire about her observation of the environment and request her to perform certain tasks such as opening door or navigate to a different room.

I focused on the original concept, design, and gameplay code.

<iframe width="560" height="315" src="https://www.youtube.com/embed/t-2w_q-RPyk" frameborder="0" allowfullscreen></iframe>

### Team members

- [Sach Best](https://www.linkedin.com/in/sachabest), Unreal & Alexa integration
- [Max Gilbert](http://maxlgilbert.com/), Unreal, Alexa
- [Akshay Shah](https://www.linkedin.com/in/akshaymshah), Alexa integration

