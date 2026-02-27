# Astro Dash — 8-bit Space Endless Runner
**Date:** 2026-02-27
**Target audience:** Kids aged 7-10
**Platform:** Web browser (no install required)

---

## Overview

Astro Dash is an 8-bit space-themed endless runner playable in the browser. An astronaut runs across an infinite space platform while the player dodges obstacles, collects coins, survives boss encounters, and chases a personal high score.

---

## Core Game Loop

1. Player runs automatically; world scrolls faster over time
2. Player dodges obstacles using two controls:
   - **Spacebar / Up arrow** — jump over ground obstacles
   - **Down arrow / S key** — slide under aerial obstacles
3. Coins float in the air — collect them to unlock skins
4. Score = distance traveled (displayed in real-time, best saved in localStorage)
5. Every ~500m a boss zone triggers — survive 10 seconds of projectile patterns to advance
6. On death: see score, coins earned, personal best, then play again

---

## Obstacles

| Obstacle | How to dodge |
|----------|-------------|
| Rolling asteroid (ground) | Jump |
| Low-flying UFO (aerial) | Slide |
| Laser beam (mid-height) | Jump or slide depending on height |
| Boss projectiles | Jump + slide patterns |

---

## Zones

Three themed zones cycle with increasing speed on each loop:

| Zone | Setting | Visual Style | Unique Obstacle |
|------|---------|--------------|-----------------|
| 1 | Asteroid Belt | Dark space, rocky platforms | Rolling asteroids |
| 2 | Alien Planet | Purple sky, alien terrain | Alien turret laser beams |
| 3 | Black Hole | Warped space, glowing edges | Gravity pulls (forced jump/slide) |

**Difficulty curve:** Speed increases gradually within each zone. Each full cycle is faster than the last. Boss patterns grow more complex with each cycle.

---

## Boss Encounters

- Triggered at the end of each zone (~500m)
- Boss appears on screen and fires projectile patterns
- Player must dodge for 10 seconds to "defeat" the boss and advance to the next zone
- Dying during boss = normal game over

---

## Unlockable Skins

Purchased with coins collected during runs. Persisted in localStorage.

| Skin | Cost | Description |
|------|------|-------------|
| Default Astronaut | free | White spacesuit |
| Orange Astronaut | 50 coins | Orange NASA-style suit |
| Robot | 100 coins | Shiny metal robot |
| Alien | 150 coins | Green alien in a suit |
| Mini Rocket | 200 coins | Player becomes a tiny rocket |

---

## Screens & UI

- **Title screen** — pixel art logo, "Press Space to Start", personal best displayed
- **Character select** — grid of skins; locked ones show padlock + coin cost
- **HUD (in-game)** — score (top-left), coin count (top-right), zone indicator (center-top)
- **Game over screen** — final score, personal best, coins earned, "Play Again" button

---

## Audio

- 8-bit chiptune background music, looping, one track per zone
- Sound effects: jump, slide, coin collect, obstacle hit, boss defeated

---

## Technical Architecture

**Stack:**
- Phaser 3 (via CDN)
- Vanilla HTML / CSS / JS — no build tools, opens directly in browser
- localStorage — persists high score, coin wallet, unlocked skins
- Free/CC0 assets from OpenGameArt.org or itch.io

**Project structure:**
```
astro-dash/
  index.html
  game.js
  scenes/
    BootScene.js
    TitleScene.js
    SelectScene.js
    GameScene.js
    GameOverScene.js
  assets/
    sprites/
    audio/
  style.css
```

**No backend. No login. No data leaves the browser.** Safe for kids, works offline after first load.
