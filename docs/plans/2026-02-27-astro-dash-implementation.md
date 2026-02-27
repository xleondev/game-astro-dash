# Astro Dash Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete 8-bit space endless runner web game for kids aged 7-10, playable directly in the browser with no install.

**Architecture:** Pure HTML/CSS/JS using Phaser 3 via CDN. Five Phaser scenes handle the full game flow (Boot → Title → Select → Game → GameOver). All persistence (high score, coins, unlocks) lives in localStorage.

**Tech Stack:** Phaser 3.60 (CDN), vanilla JS ES6 modules, localStorage, CSS for centering only.

---

## File Map

```
astro-dash/
  index.html              # Canvas host, loads Phaser CDN + game.js
  style.css               # Center canvas on page, black background
  game.js                 # Phaser config, registers all scenes
  scenes/
    BootScene.js          # Preload all assets
    TitleScene.js         # Title + high score + press space
    SelectScene.js        # Skin picker with coin costs
    GameScene.js          # Core gameplay (biggest file)
    GameOverScene.js      # Score summary + play again
  assets/
    sprites/              # PNG spritesheets and images
    audio/                # OGG/MP3 chiptune tracks + SFX
```

> **Note on testing:** This is a browser game — no unit test runner. Each task ends with a "Verify in browser" step. Open `index.html` directly in Chrome/Firefox (or `npx serve .` if CORS blocks ES modules).

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `game.js`

**Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Astro Dash</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script type="module" src="game.js"></script>
</body>
</html>
```

**Step 2: Create `style.css`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}
canvas { display: block; }
```

**Step 3: Create `game.js`**

```js
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import SelectScene from './scenes/SelectScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 300,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: [BootScene, TitleScene, SelectScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
```

**Step 4: Create `scenes/` directory and stub all 5 scenes**

Create `scenes/BootScene.js`:
```js
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {}
  create() { this.scene.start('TitleScene'); }
}
```

Create `scenes/TitleScene.js`:
```js
export default class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 150, 'ASTRO DASH', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 220, 'Press SPACE to Start', { fontSize: '18px', fill: '#aaa' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }
}
```

Create `scenes/SelectScene.js`:
```js
export default class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }
  create() {
    this.add.text(400, 150, 'SELECT SCENE (stub)', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
  }
}
```

Create `scenes/GameScene.js`:
```js
export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.add.text(400, 150, 'GAME SCENE (stub)', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
  }
}
```

Create `scenes/GameOverScene.js`:
```js
export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  create() {
    this.add.text(400, 150, 'GAME OVER (stub)', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
  }
}
```

**Step 5: Verify in browser**

Run: `npx serve . -p 3000` (or open index.html directly)
Expected: Black canvas, "ASTRO DASH" title, "Press SPACE to Start" text. Pressing space switches to blank GameScene stub.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: project scaffold with Phaser 3 and scene stubs"
```

---

### Task 2: Placeholder Assets (Colored Rectangles)

Build the game with colored rectangles first — swap in real pixel art later without touching game logic.

**Files:**
- Modify: `scenes/BootScene.js`

**Step 1: Generate sprite textures programmatically in BootScene**

Replace `BootScene.js`:
```js
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Player — white rectangle 40x60
    const player = this.make.graphics({ x: 0, y: 0, add: false });
    player.fillStyle(0xffffff); player.fillRect(0, 0, 40, 60);
    player.generateTexture('player', 40, 60);
    player.destroy();

    // Asteroid — grey rectangle 40x40
    const asteroid = this.make.graphics({ x: 0, y: 0, add: false });
    asteroid.fillStyle(0x888888); asteroid.fillRect(0, 0, 40, 40);
    asteroid.generateTexture('asteroid', 40, 40);
    asteroid.destroy();

    // UFO — purple rectangle 60x30
    const ufo = this.make.graphics({ x: 0, y: 0, add: false });
    ufo.fillStyle(0xaa00ff); ufo.fillRect(0, 0, 60, 30);
    ufo.generateTexture('ufo', 60, 30);
    ufo.destroy();

    // Coin — yellow rectangle 20x20
    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0xffdd00); coin.fillRect(0, 0, 20, 20);
    coin.generateTexture('coin', 20, 20);
    coin.destroy();

    // Ground tile — dark blue rectangle 800x20
    const ground = this.make.graphics({ x: 0, y: 0, add: false });
    ground.fillStyle(0x1a1a4a); ground.fillRect(0, 0, 800, 20);
    ground.generateTexture('ground', 800, 20);
    ground.destroy();

    // Boss — red rectangle 80x80
    const boss = this.make.graphics({ x: 0, y: 0, add: false });
    boss.fillStyle(0xff2200); boss.fillRect(0, 0, 80, 80);
    boss.generateTexture('boss', 80, 80);
    boss.destroy();

    // Bullet — orange rectangle 16x8
    const bullet = this.make.graphics({ x: 0, y: 0, add: false });
    bullet.fillStyle(0xff8800); bullet.fillRect(0, 0, 16, 8);
    bullet.generateTexture('bullet', 16, 8);
    bullet.destroy();

    this.scene.start('TitleScene');
  }
}
```

**Step 2: Verify in browser**

Expected: Same title screen as before — no visual change yet, but textures are now registered.

**Step 3: Commit**

```bash
git add scenes/BootScene.js
git commit -m "feat: generate placeholder sprite textures in BootScene"
```

---

### Task 3: Ground + Scrolling Background

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Replace GameScene stub with ground + scrolling star background**

```js
export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.GROUND_Y = 280; // y position of ground surface

    // Scrolling star background — two tiled images side by side
    this.bg1 = this.add.rectangle(0, 0, 800, 300, 0x0a0a1a).setOrigin(0, 0);

    // Draw stars manually
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 260),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      star.scrollSpeed = Phaser.Math.FloatBetween(0.2, 1.0);
      this.stars.push(star);
    }

    // Ground group (static)
    this.groundGroup = this.physics.add.staticGroup();
    this.ground1 = this.groundGroup.create(400, 295, 'ground');
    this.ground2 = this.groundGroup.create(1200, 295, 'ground');

    // World speed
    this.worldSpeed = 300; // px/sec, increases over time

    // HUD placeholder
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
    this.coinText = this.add.text(700, 10, 'Coins: 0', { fontSize: '16px', fill: '#fff' });
  }

  update(time, delta) {
    const dt = delta / 1000;
    const move = this.worldSpeed * dt;

    // Scroll stars
    this.stars.forEach(star => {
      star.x -= star.scrollSpeed * move;
      if (star.x < 0) star.x = 800;
    });

    // Scroll ground tiles
    this.ground1.x -= move;
    this.ground2.x -= move;
    if (this.ground1.x < -400) this.ground1.x = this.ground2.x + 800;
    if (this.ground2.x < -400) this.ground2.x = this.ground1.x + 800;
    this.groundGroup.refresh();
  }
}
```

**Step 2: Verify in browser**

Press Space on title → GameScene. Expected: scrolling stars, moving ground tile. No player yet.

**Step 3: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: scrolling background and ground tiles in GameScene"
```

---

### Task 4: Player — Jump Mechanic

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Add player sprite and jump to `create()`**

Add after ground setup:
```js
// Player
this.player = this.physics.add.sprite(120, this.GROUND_Y - 60, 'player');
this.player.setCollideWorldBounds(true);
this.physics.add.collider(this.player, this.groundGroup);

// Input
this.cursors = this.input.keyboard.createCursorKeys();
this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

this.isSliding = false;
```

**Step 2: Add jump logic to `update()`**

Add at the start of update():
```js
const onGround = this.player.body.blocked.down;

// Jump
if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.jumpKey)) && onGround && !this.isSliding) {
  this.player.setVelocityY(-600);
}
```

**Step 3: Verify in browser**

Expected: White rectangle player sits on ground. Press Space or Up arrow → player jumps and falls back down with gravity.

**Step 4: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: player sprite with jump mechanic"
```

---

### Task 5: Player — Slide Mechanic

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Add slide logic to `update()`**

After jump logic:
```js
// Slide
if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && onGround) {
  if (!this.isSliding) {
    this.isSliding = true;
    this.player.setDisplaySize(40, 30); // squish to half height
    this.player.body.setSize(40, 30);
    this.player.y = this.GROUND_Y - 15;
    this.time.delayedCall(500, () => {
      this.isSliding = false;
      this.player.setDisplaySize(40, 60);
      this.player.body.setSize(40, 60);
    });
  }
}
```

**Step 2: Verify in browser**

Expected: Down arrow squishes player to half height for 500ms, then returns to normal. Player can slide under obstacles.

**Step 3: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: player slide mechanic with hitbox reduction"
```

---

### Task 6: Obstacle Spawning

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Add obstacle group and spawn timer to `create()`**

```js
// Obstacles
this.obstacles = this.physics.add.group();
this.physics.add.collider(this.obstacles, this.groundGroup);
this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

this.spawnObstacle(); // kick off spawning
```

**Step 2: Add spawn methods**

```js
spawnObstacle() {
  if (this.gameOver) return;

  const type = Phaser.Math.RND.pick(['asteroid', 'asteroid', 'ufo']); // 2:1 ratio
  let obs;

  if (type === 'asteroid') {
    obs = this.obstacles.create(820, this.GROUND_Y - 40, 'asteroid');
    obs.setVelocityX(-this.worldSpeed);
    obs.body.allowGravity = false;
    obs.obstacleType = 'asteroid';
  } else {
    obs = this.obstacles.create(820, this.GROUND_Y - 80, 'ufo');
    obs.setVelocityX(-this.worldSpeed);
    obs.body.allowGravity = false;
    obs.obstacleType = 'ufo';
  }

  // Despawn when off screen
  this.time.delayedCall(3500, () => { if (obs) obs.destroy(); });

  // Schedule next spawn (1.5–3s gap, shrinks with speed)
  const gap = Phaser.Math.Between(1500, 3000) * (300 / this.worldSpeed);
  this.time.delayedCall(gap, this.spawnObstacle, [], this);
}

hitObstacle() {
  this.gameOver = true;
  this.physics.pause();
  this.player.setTint(0xff0000);
  this.time.delayedCall(1000, () => {
    this.scene.start('GameOverScene', { score: Math.floor(this.score), coins: this.coinsCollected });
  });
}
```

**Step 3: Initialize game state in `create()`**

Add before `spawnObstacle()` call:
```js
this.gameOver = false;
this.score = 0;
this.coinsCollected = 0;
```

**Step 4: Update score in `update()`**

Add at the start of update (before gameOver guard):
```js
if (this.gameOver) return;
this.score += this.worldSpeed * dt * 0.01; // distance-based score
this.scoreText.setText('Score: ' + Math.floor(this.score));

// Gradually increase world speed (cap at 600)
if (this.worldSpeed < 600) this.worldSpeed += 5 * dt;

// Update all obstacles velocity to match world speed
this.obstacles.getChildren().forEach(obs => {
  obs.setVelocityX(-this.worldSpeed);
});
```

**Step 5: Verify in browser**

Expected: Asteroids and UFOs spawn from the right and scroll left. Running into one pauses physics and turns player red, then transitions to GameOverScene stub.

**Step 6: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: obstacle spawning, collision detection, and score"
```

---

### Task 7: Coin Spawning & Collection

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Add coin group to `create()`**

```js
// Coins
this.coins = this.physics.add.group();
this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
this.spawnCoin();
```

**Step 2: Add coin methods**

```js
spawnCoin() {
  if (this.gameOver) return;
  const x = 820;
  const y = Phaser.Math.RND.pick([this.GROUND_Y - 80, this.GROUND_Y - 120, this.GROUND_Y - 160]);
  const c = this.coins.create(x, y, 'coin');
  c.setVelocityX(-this.worldSpeed);
  c.body.allowGravity = false;
  this.time.delayedCall(3500, () => { if (c) c.destroy(); });
  this.time.delayedCall(Phaser.Math.Between(2000, 4000), this.spawnCoin, [], this);
}

collectCoin(player, coin) {
  coin.destroy();
  this.coinsCollected++;
  this.coinText.setText('Coins: ' + this.coinsCollected);
}
```

**Step 3: Verify in browser**

Expected: Yellow squares spawn at varying heights, scroll left. Running (or jumping) into one increments the coin counter. They vanish when collected.

**Step 4: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: coin spawning and collection"
```

---

### Task 8: Zone System

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Add zone config and tracking to `create()`**

```js
this.ZONES = [
  { name: 'Asteroid Belt', bgColor: 0x0a0a1a, groundColor: 0x1a1a4a },
  { name: 'Alien Planet',  bgColor: 0x1a0a2a, groundColor: 0x2a1a0a },
  { name: 'Black Hole',    bgColor: 0x050510, groundColor: 0x101030 },
];
this.currentZone = 0;
this.zoneScore = 0;
this.ZONE_LENGTH = 500; // score units per zone
this.inBoss = false;

this.zoneText = this.add.text(400, 10, 'Zone 1: Asteroid Belt', {
  fontSize: '14px', fill: '#ffdd00'
}).setOrigin(0.5, 0);
```

**Step 2: Check zone transition in `update()`**

Add after score update:
```js
// Zone tracking
if (!this.inBoss) {
  this.zoneScore += this.worldSpeed * dt * 0.01;
  if (this.zoneScore >= this.ZONE_LENGTH) {
    this.zoneScore = 0;
    this.startBoss();
  }
}
```

**Step 3: Add zone transition method**

```js
startBoss() {
  this.inBoss = true;
  this.spawnObstacleTimer = false; // flag to pause obstacle spawning
  this.zoneText.setText('!! BOSS !!').setFill('#ff2200');
  // Boss spawned in Task 9
  // For now, auto-advance after 10s
  this.time.delayedCall(10000, () => this.endBoss());
}

endBoss() {
  this.currentZone = (this.currentZone + 1) % this.ZONES.length;
  const zone = this.ZONES[this.currentZone];
  this.inBoss = false;
  this.bg1.setFillStyle(zone.bgColor);
  this.zoneText.setText(`Zone ${this.currentZone + 1}: ${zone.name}`).setFill('#ffdd00');
  this.worldSpeed += 30; // zone speed bump
}
```

**Step 4: Verify in browser**

Expected: After enough score, zone text flashes "!! BOSS !!", then transitions to next zone after 10s with a slightly higher speed and new background tint.

**Step 5: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: zone system with 3 themed zones"
```

---

### Task 9: Boss Encounter

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Replace `startBoss()` with real boss logic**

```js
startBoss() {
  this.inBoss = true;
  this.zoneText.setText('!! BOSS !!').setFill('#ff2200');

  // Spawn boss on right side
  this.boss = this.physics.add.sprite(700, this.GROUND_Y - 80, 'boss');
  this.boss.body.allowGravity = false;
  this.boss.setImmovable(true);

  // Boss bullets group
  this.bossBullets = this.physics.add.group();
  this.physics.add.overlap(this.player, this.bossBullets, this.hitObstacle, null, this);

  // Boss timer — survive 10s to win
  this.bossTimeLeft = 10;
  this.bossTimerText = this.add.text(400, 30, '10', { fontSize: '20px', fill: '#ff4444' }).setOrigin(0.5, 0);

  this.bossCountdown = this.time.addEvent({
    delay: 1000,
    repeat: 9,
    callback: () => {
      this.bossTimeLeft--;
      this.bossTimerText.setText(String(this.bossTimeLeft));
      if (this.bossTimeLeft <= 0) this.defeatBoss();
    }
  });

  // Boss fires every 1.2s
  this.bossFiringEvent = this.time.addEvent({
    delay: 1200,
    loop: true,
    callback: this.fireBossBullet,
    callbackScope: this
  });
}

fireBossBullet() {
  if (!this.boss || this.gameOver) return;
  // Alternate between high and low shots
  const yOffset = this.bossBulletHigh ? -40 : 0;
  this.bossBulletHigh = !this.bossBulletHigh;
  const b = this.bossBullets.create(this.boss.x - 40, this.boss.y + yOffset, 'bullet');
  b.setVelocityX(-400);
  b.body.allowGravity = false;
  this.time.delayedCall(2000, () => { if (b) b.destroy(); });
}

defeatBoss() {
  this.bossFiringEvent.remove();
  this.bossCountdown.remove();
  if (this.boss) { this.boss.destroy(); this.boss = null; }
  if (this.bossTimerText) { this.bossTimerText.destroy(); }
  this.bossBullets.clear(true, true);
  this.endBoss();
}
```

**Step 2: Initialize `this.bossBulletHigh = false` in `create()`**

```js
this.bossBulletHigh = false;
```

**Step 3: Verify in browser**

Expected: After first zone, a red rectangle (boss) appears on the right and fires orange bullets at two heights alternately. Countdown from 10. On reaching 0, boss disappears and next zone begins. Getting hit by a bullet triggers game over.

**Step 4: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: boss encounter with projectile patterns and survival timer"
```

---

### Task 10: Game Over Scene

**Files:**
- Modify: `scenes/GameOverScene.js`

**Step 1: Replace stub with full GameOverScene**

```js
export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data) {
    const score = data.score || 0;
    const coins = data.coins || 0;

    // Load + update persistent data
    const prevBest = parseInt(localStorage.getItem('astro_best') || '0');
    const newBest = Math.max(prevBest, score);
    localStorage.setItem('astro_best', String(newBest));

    const prevCoins = parseInt(localStorage.getItem('astro_coins') || '0');
    localStorage.setItem('astro_coins', String(prevCoins + coins));

    // UI
    this.add.text(400, 60, 'GAME OVER', { fontSize: '40px', fill: '#ff2200' }).setOrigin(0.5);
    this.add.text(400, 130, `Score: ${score}`, { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 165, `Best:  ${newBest}`, { fontSize: '20px', fill: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 200, `Coins earned: ${coins}`, { fontSize: '18px', fill: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 200, `Total coins: ${prevCoins + coins}`, { fontSize: '16px', fill: '#aaaaaa' }).setOrigin(0.5).setY(230);

    const btn = this.add.text(400, 270, '[ PLAY AGAIN ]', { fontSize: '20px', fill: '#00ff88' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setFill('#ffffff'));
    btn.on('pointerout', () => btn.setFill('#00ff88'));
    btn.on('pointerdown', () => this.scene.start('TitleScene'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('TitleScene'));
  }
}
```

**Step 2: Verify in browser**

Expected: After dying, GameOver screen shows score, personal best (updates if beaten), coins earned, total coins. Click or space restarts to title.

**Step 3: Commit**

```bash
git add scenes/GameOverScene.js
git commit -m "feat: game over scene with score summary and localStorage persistence"
```

---

### Task 11: Title Scene with High Score

**Files:**
- Modify: `scenes/TitleScene.js`

**Step 1: Replace stub with full TitleScene**

```js
export default class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    this.add.text(400, 70, 'ASTRO DASH', { fontSize: '52px', fill: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 130, '8-BIT SPACE RUNNER', { fontSize: '16px', fill: '#8888ff' }).setOrigin(0.5);

    const best = localStorage.getItem('astro_best') || '0';
    const coins = localStorage.getItem('astro_coins') || '0';
    this.add.text(400, 175, `Best Score: ${best}`, { fontSize: '18px', fill: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 200, `Coins: ${coins}`, { fontSize: '16px', fill: '#ffdd00' }).setOrigin(0.5);

    this.add.text(400, 245, 'Press SPACE to Start', { fontSize: '18px', fill: '#aaaaaa' }).setOrigin(0.5);

    const selectBtn = this.add.text(400, 275, 'Change Character >', { fontSize: '14px', fill: '#00ff88' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    selectBtn.on('pointerdown', () => this.scene.start('SelectScene'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }
}
```

**Step 2: Verify in browser**

Expected: Title screen shows high score and total coins from localStorage. "Change Character >" button navigates to SelectScene stub.

**Step 3: Commit**

```bash
git add scenes/TitleScene.js
git commit -m "feat: title scene with persistent high score and coin display"
```

---

### Task 12: Character Select Scene

**Files:**
- Modify: `scenes/SelectScene.js`

**Step 1: Define skin data and replace stub**

```js
const SKINS = [
  { id: 'astronaut_white',  label: 'Astronaut',       cost: 0,   color: 0xffffff },
  { id: 'astronaut_orange', label: 'Orange Suit',      cost: 50,  color: 0xff8800 },
  { id: 'robot',            label: 'Robot',            cost: 100, color: 0x88ccff },
  { id: 'alien',            label: 'Alien',            cost: 150, color: 0x00ff88 },
  { id: 'rocket',           label: 'Mini Rocket',      cost: 200, color: 0xff4444 },
];

export default class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }

  create() {
    this.add.text(400, 20, 'SELECT CHARACTER', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    const coins = parseInt(localStorage.getItem('astro_coins') || '0');
    const unlocked = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
    const selected = localStorage.getItem('astro_selected') || 'astronaut_white';

    this.add.text(400, 50, `Coins: ${coins}`, { fontSize: '16px', fill: '#ffdd00' }).setOrigin(0.5);

    SKINS.forEach((skin, i) => {
      const x = 100 + (i % 5) * 140;
      const y = 140;
      const isUnlocked = unlocked.includes(skin.id);
      const isSelected = skin.id === selected;

      // Skin box
      const box = this.add.rectangle(x, y, 80, 80, skin.color, isUnlocked ? 1 : 0.3)
        .setStrokeStyle(2, isSelected ? 0xffdd00 : 0x444444);

      if (isUnlocked) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => {
          localStorage.setItem('astro_selected', skin.id);
          this.scene.restart();
        });
      }

      this.add.text(x, y + 55, skin.label, { fontSize: '11px', fill: isUnlocked ? '#fff' : '#666' }).setOrigin(0.5);

      if (!isUnlocked) {
        this.add.text(x, y + 68, `${skin.cost} coins`, { fontSize: '10px', fill: '#ffdd00' }).setOrigin(0.5);

        if (coins >= skin.cost) {
          const buyBtn = this.add.text(x, y - 55, 'BUY', { fontSize: '12px', fill: '#00ff88' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
          buyBtn.on('pointerdown', () => {
            const c = parseInt(localStorage.getItem('astro_coins') || '0');
            if (c >= skin.cost) {
              localStorage.setItem('astro_coins', String(c - skin.cost));
              const u = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
              u.push(skin.id);
              localStorage.setItem('astro_unlocked', JSON.stringify(u));
              this.scene.restart();
            }
          });
        }
      }
    });

    const back = this.add.text(400, 275, '< Back to Title', { fontSize: '14px', fill: '#aaaaaa' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
```

**Step 2: Verify in browser**

Expected: 5 character boxes shown. Only "Astronaut" is available by default (others dimmed with lock + cost). If you have enough coins, BUY button appears. Selecting a character highlights it with yellow border and persists to localStorage.

**Step 3: Commit**

```bash
git add scenes/SelectScene.js
git commit -m "feat: character select scene with unlockable skins and coin purchase"
```

---

### Task 13: Apply Selected Skin in GameScene

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Read selected skin tint in `create()` after player creation**

After `this.player = this.physics.add.sprite(...)`:
```js
// Apply selected skin as tint
const SKIN_TINTS = {
  astronaut_white:  0xffffff,
  astronaut_orange: 0xff8800,
  robot:            0x88ccff,
  alien:            0x00ff88,
  rocket:           0xff4444,
};
const selected = localStorage.getItem('astro_selected') || 'astronaut_white';
this.player.setTint(SKIN_TINTS[selected] || 0xffffff);
```

**Step 2: Verify in browser**

Select "Orange Suit" on the select screen (after earning 50 coins), return to game — player rectangle should be orange.

**Step 3: Commit**

```bash
git add scenes/GameScene.js
git commit -m "feat: apply selected skin tint to player in GameScene"
```

---

### Task 14: Polish — HUD Zone Indicator & Speed Display

**Files:**
- Modify: `scenes/GameScene.js`

**Step 1: Make zone text always match current zone name**

In `create()`, initialize:
```js
this.zoneText = this.add.text(400, 10,
  `Zone 1: ${this.ZONES[0].name}`,
  { fontSize: '14px', fill: '#ffdd00' }
).setOrigin(0.5, 0).setDepth(10);
```

**Step 2: Bring HUD elements to front**

After creating `scoreText`, `coinText`, `zoneText`:
```js
this.scoreText.setDepth(10);
this.coinText.setDepth(10);
```

**Step 3: Verify in browser**

Expected: HUD text always renders above obstacles and boss. Zone name updates correctly.

**Step 4: Commit**

```bash
git add scenes/GameScene.js
git commit -m "fix: HUD depth ordering and zone name display"
```

---

### Task 15: Final Integration Test

**Step 1: Full playthrough checklist**

Open `index.html` and verify each of these manually:

- [ ] Title screen shows high score and coins
- [ ] "Change Character" navigates to SelectScene
- [ ] SelectScene shows 5 skins, locked ones are dimmed
- [ ] Starting with coins, BUY button appears and purchase works
- [ ] Selected skin is tinted correctly in game
- [ ] Player jumps with Space/Up arrow
- [ ] Player slides with Down arrow
- [ ] Asteroids and UFOs spawn and scroll left
- [ ] Hitting an obstacle triggers game over
- [ ] Coins can be collected, counter increments
- [ ] Score increases over time
- [ ] Zone changes after ~500 score points
- [ ] Boss appears, fires bullets at two heights
- [ ] Surviving boss for 10s advances to next zone
- [ ] Dying sends to GameOverScene with correct score/coins
- [ ] Personal best updates if beaten
- [ ] Coins persist across sessions (reload page)
- [ ] Play Again restarts cleanly

**Step 2: Fix any issues found during playthrough**

Address them with targeted commits.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Astro Dash v1.0 — all scenes integrated and tested"
```

---

## Future Enhancements (Post v1.0, YAGNI for now)

- Real pixel art sprites (replace colored rectangles)
- Chiptune audio (zone music + SFX)
- Mobile touch controls (tap = jump, swipe down = slide)
- Parallax multi-layer background
- Particle effects on coin collect and death
