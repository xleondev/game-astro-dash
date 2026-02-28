# 🚀 Astro Dash

An 8-bit endless runner built with [Phaser 3](https://phaser.io/). Jump, slide, and dodge obstacles across three increasingly dangerous space zones — and survive long enough to face the boss.

## Play

Open `index.html` in a browser (use a local server for ES module support):

```bash
npx serve .
# then open http://localhost:3000
```

Or host the folder on any static file server (GitHub Pages, Netlify, etc.).

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Jump | `Space` / `↑` | Swipe up |
| Slide | `↓` | Swipe down |

## Zones

| Zone | Name | Vibe |
|------|------|------|
| 1 | Asteroid Belt | Bright, fast — dodge tumbling rocks |
| 2 | Alien Planet | Eerie purple world — alien obstacles |
| 3 | Black Hole | Escape the singularity — get pulled back on death |

Each zone ends with a **boss fight** — dodge bullets for 10 seconds to break through to the next zone.

## Characters

Five unlockable skins purchasable with coins collected in-game:

- **Astronaut** (default) — free
- **Orange Suit** — 50 coins
- **Robot** — 100 coins
- **Alien** — 150 coins
- **Mini Rocket** — 200 coins

## Features

- 8-bit pixel art sprites drawn entirely in code (no image files)
- Chiptune background music and sound effects via Web Audio API (no audio files)
- Full-body running animations per character
- Zone-specific parallax backgrounds
- Spaghettification death animation in Zone 3
- Mobile-friendly with swipe controls and responsive scaling
- Coin economy with persistent localStorage

## Project Structure

```
astro-dash/
├── index.html
├── game.js              # Phaser config, scene list
├── audio.js             # AudioManager — all SFX and music generated via Web Audio API
├── style.css
└── scenes/
    ├── BootScene.js     # Generates all pixel art textures at startup
    ├── TitleScene.js    # Title screen
    ├── SelectScene.js   # Character select + shop
    ├── GameScene.js     # Main gameplay
    └── GameOverScene.js # Score summary
```

## Built With

- [Phaser 3](https://phaser.io/) — game framework
- Web Audio API — procedural chiptune audio
- Vanilla JS ES modules — no build step required
