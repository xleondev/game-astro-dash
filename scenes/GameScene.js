import { audio } from '../audio.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.GROUND_Y = 280; // y position of ground surface

    // Background
    this.bg1 = this.add.rectangle(0, 0, 800, 300, 0x0a0a1a).setOrigin(0, 0);

    // Zone decoration layers (between bg and stars)
    this._bgDecorGfx    = this.add.graphics(); // static zone art
    this._bgParallaxGfx = this.add.graphics(); // slowly scrolling objects
    this._bgParallaxData = [];

    // Stars: plain data array + one Graphics object (no per-star GameObjects)
    this.starData = Array.from({ length: 80 }, () => ({
      x:     Phaser.Math.Between(0, 800),
      y:     Phaser.Math.Between(0, 260),
      size:  Phaser.Math.Between(1, 3),
      speed: Phaser.Math.FloatBetween(0.2, 1.0),
    }));
    this.starGfx = this.add.graphics();

    // Ground: one fixed static physics body (no scrolling needed for collision)
    // + a TileSprite for the visual that scrolls with tilePositionX
    const groundZone = this.add.zone(400, 295, 800, 20);
    this.physics.add.existing(groundZone, true);
    this.groundVisual = this.add.tileSprite(400, 295, 800, 20, 'ground');

    // Player — use correct texture and tint per selected skin
    const SKIN_DATA = {
      astronaut_white:  { texture: 'player', tint: 0xffffff },
      astronaut_orange: { texture: 'player', tint: 0xff8800 },
      robot:            { texture: 'robot',  tint: 0xffffff },
      alien:            { texture: 'alien',  tint: 0xffffff },
      rocket:           { texture: 'rocket', tint: 0xffffff },
    };
    const selected = localStorage.getItem('astro_selected') || 'astronaut_white';
    const skinData = SKIN_DATA[selected] || SKIN_DATA.astronaut_white;

    this.player = this.physics.add.sprite(120, this.GROUND_Y - 25, skinData.texture);
    this.player.setCollideWorldBounds(true);
    this.player.setTint(skinData.tint);

    this._neutralTexture = skinData.texture;

    this.physics.add.collider(this.player, groundZone);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Debug keys — press 1/2/3 to jump to a zone, B to trigger boss immediately
    this.input.keyboard.on('keydown-ONE',   () => this._debugZone(0));
    this.input.keyboard.on('keydown-TWO',   () => this._debugZone(1));
    this.input.keyboard.on('keydown-THREE', () => this._debugZone(2));
    this.input.keyboard.on('keydown-B',     () => { if (!this.inBoss && !this.gameOver) this.startBoss(); });

    this.isSliding = false;

    // Jump/slide-feel state
    this._coyoteTime  = 0;
    this._jumpBuffer  = 0;
    this._slideBuffer = 0;
    this._wasJumpHeld = false;
    this._jumpHeld    = false;
    this._wasOnGround = true;
    this._hasRunAnim = true;
    this._runTimer   = 0;
    this._runFrameA  = true;

    // Touch input
    this._jumpPressed    = false;
    this._slidePressed   = false;
    this._jumpHeld       = false;
    this._touchStartY    = 0;
    this._touchTriggered = false;
    this._inputReady     = false;  // ignore carry-over events from previous scene

    // Grace period: ignore the first 300 ms of touch input so the tap that
    // launched this scene doesn't immediately trigger a jump.
    this.time.delayedCall(300, () => { this._inputReady = true; });

    // Swipe: action fires instantly when threshold crossed (not on lift)
    this.input.on('pointerdown', (p) => {
      if (!this._inputReady) return;
      this._touchStartY    = p.y;
      this._touchTriggered = false;
    });

    this.input.on('pointermove', (p) => {
      if (!this._inputReady || this.gameOver || this._touchTriggered || !p.isDown) return;
      const dy = p.y - this._touchStartY;
      if (dy < -35) {
        this._touchTriggered = true;
        this._jumpPressed    = true;
        this._jumpHeld       = true;
      } else if (dy > 35) {
        this._touchTriggered = true;
        this._slidePressed   = true;
      }
    });

    this.input.on('pointerup', (p) => {
      this._jumpHeld = false;
      if (!this._inputReady || this.gameOver) return;
      if (!this._touchTriggered) {
        this._jumpPressed = true;
      }
      this._touchTriggered = false;
    });

    // World speed
    this.worldSpeed = 300; // px/sec, increases over time

    // Game state
    this.gameOver = false;
    this.score = 0;
    this.coinsCollected = 0;
    this.bossBulletHigh = false;

    // Obstacles
    this.obstacles = this.physics.add.group();
    // No ground collider for obstacles — they all have allowGravity:false
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

    // Coins
    this.coins = this.physics.add.group();
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // HUD placeholder
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', color: '#fff' }).setDepth(10);
    this.coinText = this.add.text(700, 10, 'Coins: 0', { fontSize: '16px', color: '#fff' }).setDepth(10);

    this.ZONES = [
      { name: 'Asteroid Belt', bgColor: 0x0a0a1a, groundColor: 0x1a1a4a },
      { name: 'Alien Planet',  bgColor: 0x1a0a2a, groundColor: 0x2a1a0a },
      { name: 'Black Hole',    bgColor: 0x050510, groundColor: 0x101030 },
    ];
    this.currentZone = 0;
    this.zoneScore = 0;
    this.ZONE_LENGTH = 500;
    this.inBoss = false;

    this.zoneText = this.add.text(400, 10, `Zone 1: ${this.ZONES[0].name}`, { fontSize: '14px', color: '#ffdd00' }).setOrigin(0.5, 0).setDepth(10);

    // Start background music for zone 0
    audio.playMusic(0);

    this._setupZoneBg(0);

    this._countingDown = true;
    this._startCountdown();
  }


  _startCountdown() {
    this.physics.pause();

    const cx = 400, cy = 148;

    // Show controls hint during countdown
    this._showControlsHint();

    // Countdown numbers: 3 → 2 → 1 → GO!
    const steps = ['3', '2', '1', 'GO!'];
    steps.forEach((label, i) => {
      this.time.delayedCall(i * 900, () => {
        const isGo = label === 'GO!';
        const txt = this.add.text(cx, cy, label, {
          fontSize: isGo ? '72px' : '88px',
          color: isGo ? '#ffdd00' : '#ffffff',
          stroke: '#000000',
          strokeThickness: 7,
          fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0).setDepth(60).setScale(1.4);

        this.tweens.add({
          targets: txt,
          alpha: 1, scaleX: 1, scaleY: 1,
          duration: 180, ease: 'Quad.out',
          onComplete: () => {
            this.tweens.add({
              targets: txt, alpha: 0,
              duration: 280, delay: isGo ? 350 : 500,
              onComplete: () => txt.destroy(),
            });
          },
        });
      });
    });

    // After GO! fades — start the game
    this.time.delayedCall(3 * 900 + 600, () => {
      this._countingDown = false;
      this.physics.resume();
      this._inputReady = true;
      this.spawnObstacle();
      this.spawnCoin();
    });
  }

  _showControlsHint() {
    const isTouch = this.sys.game.device.input.touch;
    // Two lines only — keeps the box small enough to sit above the countdown
    const lines = isTouch
      ? ['↑  Swipe up — JUMP', '↓  Swipe down — SLIDE']
      : ['↑ / Space — JUMP', '↓ — SLIDE'];

    // Position at top of screen, well above the countdown (cy≈148) and ground (y≈280)
    const cx = 400, cy = 50;
    const padY = 10, lineH = 22;
    const boxH = lines.length * lineH + padY * 2;

    const bg = this.add.rectangle(cx, cy, 260, boxH, 0x000011, 0.72)
      .setStrokeStyle(1, 0x4444aa, 0.7)
      .setDepth(50);

    const texts = lines.map((line, i) => {
      const color = i === 0 ? '#88ffcc' : i === 1 ? '#ffaa66' : '#aaaacc';
      return this.add.text(cx, cy - (lines.length - 1) * lineH / 2 + i * lineH, line, {
        fontSize: '13px', color,
      }).setOrigin(0.5).setDepth(50);
    });

    const all = [bg, ...texts];
    let gone = false;

    const dismiss = () => {
      if (gone) return;
      gone = true;
      all.forEach(obj =>
        this.tweens.add({ targets: obj, alpha: 0, duration: 350, onComplete: () => obj.destroy() })
      );
    };

    // Auto-dismiss after 4 s
    this.time.delayedCall(4000, dismiss);

    // Dismiss immediately on first input
    this.input.once('pointerdown', dismiss);
    this.input.keyboard.once('keydown', dismiss);
  }

  spawnObstacle() {
    if (this.gameOver) return;

    const zone = this.currentZone;
    let key, y;

    if (zone === 0) {
      // Zone 1 — Asteroid Belt: rolling rocks (jump) + low UFOs (slide)
      if (Phaser.Math.RND.pick([true, true, false])) {
        key = 'asteroid'; y = this.GROUND_Y - 20;
      } else {
        // UFO positioned so bottom ~= player head height — must slide under
        key = 'ufo'; y = this.GROUND_Y - 55;
      }
    } else if (zone === 1) {
      // Zone 2 — Alien Planet: alien plants (jump) + laser bolts (slide)
      if (Phaser.Math.RND.pick([true, true, false])) {
        key = 'alien_plant'; y = this.GROUND_Y - 25;
      } else {
        key = 'laser_bolt'; y = this.GROUND_Y - 55;
      }
    } else {
      // Zone 3 — Black Hole: space debris (jump) + gravity orbs (jump OR slide)
      if (Phaser.Math.RND.pick([true, true, false])) {
        key = 'space_debris'; y = this.GROUND_Y - 20;
      } else {
        // Alternates low (slide under) and high (jump over)
        y = Phaser.Math.RND.pick([this.GROUND_Y - 55, this.GROUND_Y - 120]);
        key = 'gravity_orb';
      }
    }

    const obs = this.obstacles.create(820, y, key);
    obs.setVelocityX(-this.worldSpeed);
    obs.body.allowGravity = false;

    this.time.delayedCall(3500, () => { if (obs && obs.active) obs.destroy(); });

    const gap = Phaser.Math.Between(1500, 3000) * (300 / this.worldSpeed);
    this.time.delayedCall(gap, this.spawnObstacle, [], this);
  }

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
    audio.playSFX('coin');
  }

  hitObstacle() {
    if (this.gameOver || this._countingDown) return;
    this.gameOver = true;

    if (this.bossCountdown) { this.bossCountdown.remove(); this.bossCountdown = null; }
    if (this.bossFiringEvent) { this.bossFiringEvent.remove(); this.bossFiringEvent = null; }

    audio.stopMusic();
    audio.playSFX('hit');
    this.physics.pause();

    if (this.currentZone === 2) {
      this._spaghettify();
    } else {
      this.player.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.scene.start('GameOverScene', { score: Math.floor(this.score), coins: this.coinsCollected });
      });
    }
  }

  _spaghettify() {
    // Phase 1: brief freeze — player turns white as tidal forces lock on
    this.player.setTint(0xffffff);

    // Left-edge danger flare — the black hole "reaching out"
    const flare = this.add.rectangle(0, 0, 180, 300, 0xff4400, 0).setOrigin(0, 0).setDepth(19);

    // Flash the flare on
    this.tweens.add({
      targets: flare,
      alpha: 0.30,
      duration: 160,
      ease: 'Quad.out',
      onComplete: () => {
        // Tint player the hot orange of the accretion disk
        this.player.setTint(0xff6600);

        // Phase 2: spaghettification — pulled hard off the LEFT edge
        this.tweens.add({
          targets: this.player,
          x: -90,          // yanked entirely off-screen left
          scaleX: 0.05,    // crushed to a thread
          scaleY: 8.0,     // stretched enormously tall
          alpha: 0,
          duration: 1050,
          ease: 'Cubic.in',
          onComplete: () => {
            // Phase 3: final flare burst as player crosses event horizon
            this.tweens.add({
              targets: flare,
              alpha: 0.55,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                flare.destroy();
                this.time.delayedCall(60, () => {
                  this.scene.start('GameOverScene', { score: Math.floor(this.score), coins: this.coinsCollected });
                });
              },
            });
          },
        });
      },
    });
  }

  update(time, delta) {
    const dt = delta / 1000;

    // Always draw stars so they're visible during the countdown too.
    // Only scroll them when the game is actually running.
    const move = (this._countingDown || this.gameOver) ? 0 : this.worldSpeed * dt;
    this.starGfx.clear();
    this.starGfx.fillStyle(0xffffff, 1);
    this.starData.forEach(s => {
      s.x -= s.speed * move;
      if (s.x < 0) s.x = 800;
      this.starGfx.fillRect(s.x, s.y, s.size, s.size);
    });

    if (this.gameOver || this._countingDown) return;

    this.groundVisual.tilePositionX += move;

    // Parallax background objects (zone 3 infall streaks scroll faster)
    const parallaxRate = this.currentZone === 2 ? 0.16 : 0.12;
    this._bgParallaxGfx.clear();
    this._bgParallaxData.forEach(p => {
      p.x -= move * parallaxRate;
      if (p.x < -160) p.x += 960;
      this._drawBgParallaxObj(p);
    });

    this.score += this.worldSpeed * dt * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    if (this.worldSpeed < 600) this.worldSpeed += 5 * dt;

    this.obstacles.getChildren().forEach(obs => {
      obs.setVelocityX(-this.worldSpeed);
    });

    // Zone tracking
    if (!this.inBoss) {
      this.zoneScore += this.worldSpeed * dt * 0.01;
      if (this.zoneScore >= this.ZONE_LENGTH) {
        this.zoneScore = 0;
        this.startBoss();
      }
    }

    const onGround = this.player.body.blocked.down;

    // ── Coyote time: still jumpable for 80 ms after leaving ground ──
    if (onGround) {
      this._coyoteTime = 0.08;
    } else {
      this._coyoteTime = Math.max(0, this._coyoteTime - dt);
    }

    // ── Extra fall gravity — snappier, less floaty arc ──
    if (this.player.body.velocity.y > 50) {
      this.player.body.velocity.y += 700 * dt;
    }

    // ── Jump input (with 120 ms buffer) ──
    const jumpTrigger = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.jumpKey)
      || this._jumpPressed;
    this._jumpPressed = false;
    if (jumpTrigger) this._jumpBuffer = 0.12;
    this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);

    // Variable jump height: releasing key early caps upward velocity
    const jumpHeld = this.cursors.up.isDown || this.jumpKey.isDown || this._jumpHeld;
    if (!onGround && this._wasJumpHeld && !jumpHeld && this.player.body.velocity.y < -200) {
      this.player.body.velocity.y = -200;
    }
    this._wasJumpHeld = jumpHeld;

    // Fire the jump
    const canJump = onGround || this._coyoteTime > 0;
    if (this._jumpBuffer > 0 && canJump && !this.isSliding) {
      this._jumpBuffer = 0;
      this._coyoteTime = 0;
      this.player.setVelocityY(-600);
      audio.playSFX('jump');
    }

    this._wasOnGround = onGround;

    // ── Leg running animation (astronaut skins only) ──
    if (this._hasRunAnim && !this.isSliding) {
      if (onGround) {
        this._runTimer += dt;
        if (this._runTimer >= 0.125) {
          this._runTimer = 0;
          this._runFrameA = !this._runFrameA;
          this.player.setTexture(this._runFrameA ? this._neutralTexture + '_run_a' : this._neutralTexture + '_run_b');
        }
      } else {
        this._runTimer = 0;
        this.player.setTexture(this._neutralTexture);
      }
    }

    // ── Slide ──
    const slideTrigger = Phaser.Input.Keyboard.JustDown(this.cursors.down)
      || this._slidePressed;
    this._slidePressed = false;

    if (slideTrigger) this._slideBuffer = 0.12;
    this._slideBuffer = Math.max(0, this._slideBuffer - dt);

    if (this._slideBuffer > 0 && onGround && !this.isSliding) {
      this._slideBuffer = 0;
      this.tweens.killTweensOf(this.player);
      this.isSliding = true;
      audio.playSFX('slide');
      this.player.setDisplaySize(40, 30);
      this.player.body.setSize(40, 30);
      this.player.y = this.GROUND_Y - 15;
      this.player.setAngle(-15);
      this.time.delayedCall(500, () => {
        this.isSliding = false;
        const bottom = this.player.body.bottom;
        this.player.setDisplaySize(40, 60);
        this.player.body.setSize(40, 60);
        this.player.y = bottom - 30;
        this.player.setAngle(0);
      });
    }

  }

  _debugZone(zoneIndex) {
    if (this.gameOver) return;
    // Clean up any active boss first
    if (this.inBoss) {
      if (this.bossCountdown)   { this.bossCountdown.remove();   this.bossCountdown = null; }
      if (this.bossFiringEvent) { this.bossFiringEvent.remove(); this.bossFiringEvent = null; }
      if (this.boss)            { this.boss.destroy();           this.boss = null; }
      if (this.bossTimerText)   { this.bossTimerText.destroy();  this.bossTimerText = null; }
      if (this.bossBullets)       this.bossBullets.clear(true, true);
      this.inBoss = false;
    }
    this.currentZone = zoneIndex;
    this.zoneScore = 0;
    const zone = this.ZONES[zoneIndex];
    this.bg1.setFillStyle(zone.bgColor);
    this._setupZoneBg(zoneIndex);
    this.zoneText.setText(`Zone ${zoneIndex + 1}: ${zone.name}`).setColor('#ffdd00');
    audio.stopMusic();
    audio.playMusic(zoneIndex);
  }

  startBoss() {
    this.inBoss = true;
    this.zoneText.setText('!! BOSS !!').setColor('#ff2200');
    audio.stopMusic();
    audio.playSFX('boss_start');

    // Spawn boss on right side
    this.boss = this.physics.add.sprite(700, this.GROUND_Y - 80, 'boss');
    this.boss.body.allowGravity = false;
    this.boss.setImmovable(true);

    // Boss bullets group
    this.bossBullets = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bossBullets, this.hitObstacle, null, this);

    // Boss timer — survive 10s to win
    this.bossTimeLeft = 10;
    this.bossTimerText = this.add.text(400, 30, '10', { fontSize: '20px', color: '#ff4444' }).setOrigin(0.5, 0).setDepth(10);

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
    audio.playSFX('boss_win');
    this.endBoss();
  }

  endBoss() {
    this.currentZone = (this.currentZone + 1) % this.ZONES.length;
    const zone = this.ZONES[this.currentZone];
    this.inBoss = false;
    this.bg1.setFillStyle(zone.bgColor);
    this._setupZoneBg(this.currentZone);
    this.zoneText.setText(`Zone ${this.currentZone + 1}: ${zone.name}`).setColor('#ffdd00');
    this.worldSpeed += 30;
    audio.playMusic(this.currentZone);
  }

  // ── Zone background decorations ────────────────────────────────

  _setupZoneBg(zone) {
    const g = this._bgDecorGfx;
    g.clear();
    this._bgParallaxData = [];

    if (zone === 0) {
      // ── Asteroid Belt: faint gas giant tucked in top-right corner ──
      // Very dim planet — just enough to read as a planet, not eye-catching
      g.fillStyle(0x152030, 0.55);
      g.fillCircle(720, 55, 48);
      // Subtle single band
      g.fillStyle(0x1a2c40, 0.4);
      g.fillRect(676, 44, 88, 6);
      // Thin ring, very transparent
      g.lineStyle(3, 0x1e3040, 0.35);
      g.strokeEllipse(720, 55, 138, 24);
      // Tiny distant dot planet top-left
      g.fillStyle(0x2a1a35, 0.4);
      g.fillCircle(55, 35, 9);

      // Parallax: 4 small dim asteroid silhouettes (upper half only)
      for (let i = 0; i < 4; i++) {
        this._bgParallaxData.push({
          type: 'asteroid',
          x: i * 210 + Phaser.Math.Between(0, 100),
          y: Phaser.Math.Between(15, 130),
          w: Phaser.Math.Between(8, 16),
          h: Phaser.Math.Between(5, 10),
        });
      }

    } else if (zone === 1) {
      // ── Alien Planet: dim purple world top-left, very faint mountains ──
      // Planet — small, dark, pushed to corner
      g.fillStyle(0x3a0066, 0.4);
      g.fillCircle(68, 52, 34);
      g.fillStyle(0x4a0088, 0.55);
      g.fillCircle(68, 52, 28);
      // Tiny moon
      g.fillStyle(0x554444, 0.45);
      g.fillCircle(116, 28, 10);
      // Mountain silhouette — very dark, barely different from bg,
      // only occupying the upper quarter of the sky area
      g.fillStyle(0x150828, 0.6);
      g.fillPoints([
        { x: 0,   y: 300 }, { x: 0,   y: 220 },
        { x: 55,  y: 196 }, { x: 105, y: 216 },
        { x: 150, y: 192 }, { x: 200, y: 210 },
        { x: 250, y: 188 }, { x: 300, y: 208 },
        { x: 360, y: 185 }, { x: 415, y: 206 },
        { x: 465, y: 183 }, { x: 520, y: 205 },
        { x: 575, y: 182 }, { x: 630, y: 204 },
        { x: 680, y: 180 }, { x: 740, y: 202 },
        { x: 800, y: 185 }, { x: 800, y: 300 },
      ], true);

      // Parallax: 4 tiny dim spores (upper half only)
      for (let i = 0; i < 4; i++) {
        this._bgParallaxData.push({
          type: 'spore',
          x: i * 210 + Phaser.Math.Between(0, 100),
          y: Phaser.Math.Between(20, 120),
          r: Phaser.Math.Between(2, 4),
        });
      }

    } else {
      // ── Zone 3: ESCAPING the Black Hole ────────────────────────────
      // The black hole is BEHIND the player (off the LEFT edge).
      // Only its gravitational influence bleeds into the screen — a warm
      // orange-red glow on the left. The center and right stay clear so
      // the player can focus on obstacles.

      // ── Tiered corona glow from left edge ─────────────────────────
      // Each ellipse is centered at x=0 (left edge), so only the right
      // half is visible — a natural gradient that dims toward center.
      const halos = [
        [0xbb1a00, 0.05, 700, 560],
        [0xcc2800, 0.05, 500, 420],
        [0xdd4000, 0.06, 320, 300],
        [0xee5a00, 0.07, 190, 210],
        [0xff7200, 0.07,  95, 130],
        [0xff9933, 0.06,  42,  70],
      ];
      halos.forEach(([color, a, w, h]) => {
        g.fillStyle(color, a);
        g.fillEllipse(0, 148, w, h);
      });

      // ── Black hole sliver peeking around the left edge ─────────────
      // The void circle is mostly off-screen — just its right rim shows,
      // reminding the player what's behind them.
      g.fillStyle(0x000000, 1.0);
      g.fillCircle(-38, 148, 68);
      // Photon ring — thin bright arc, only visible on the right side
      g.lineStyle(3, 0xff9933, 0.85);
      g.strokeCircle(-38, 148, 68);
      g.lineStyle(2, 0xffcc66, 0.45);
      g.strokeCircle(-38, 148, 74);

      // ── Escape velocity: star streaks in center & right ────────────
      // Horizontal streaks with bright leading tips — player is hurtling
      // through space. Kept in right 70% so they don't touch the glow.
      const streaks = [
        [240, 22,14],[380, 14,10],[490, 30, 8],[610, 18,13],[710, 26,10],
        [280, 58,10],[430, 72, 7],[540, 50,12],[660, 65, 8],[750, 44, 9],
        [310,100,16],[470,115, 9],[570, 95,11],[680,108, 7],[760, 88,10],
        [260,150,12],[410,138, 8],[520,162,10],[640,145, 9],[730,160, 7],
        [290,195,14],[440,210, 9],[560,200,12],[680,215, 8],[760,205, 9],
        [320,245,10],[480,252, 7],[590,240,11],[700,248, 8],
      ];
      streaks.forEach(([sx, sy, len]) => {
        g.fillStyle(0xffffff, 0.22);
        g.fillRect(sx, sy, len, 1);
        g.fillStyle(0xffffff, 0.50);
        g.fillRect(sx + len - 3, sy, 3, 1);  // bright leading tip
      });

      // ── Parallax: glowing debris fragments whipping left ───────────
      for (let i = 0; i < 8; i++) {
        this._bgParallaxData.push({
          type: 'debris',
          x: i * 110 + Phaser.Math.Between(20, 80),
          y: Phaser.Math.Between(10, 255),
          len: Phaser.Math.Between(5, 18),
          alpha: Phaser.Math.FloatBetween(0.14, 0.32),
        });
      }
    }
  }

  _drawBgParallaxObj(p) {
    const g = this._bgParallaxGfx;
    if (p.type === 'asteroid') {
      // Very dim, close to bg colour — barely visible
      g.fillStyle(0x181825, 0.4);
      g.fillEllipse(p.x, p.y, p.w, p.h);
    } else if (p.type === 'spore') {
      g.fillStyle(0x5a2288, 0.25);
      g.fillCircle(p.x, p.y, p.r);
    } else if (p.type === 'debris') {
      // Glowing fragment hurtling left — warm color tint from black hole proximity
      g.fillStyle(0xeecc88, p.alpha);
      g.fillRect(p.x, p.y, p.len, 1);
      g.fillStyle(0xffffff, p.alpha * 0.6);
      g.fillRect(p.x + p.len - 2, p.y, 2, 1);  // bright tip
    }
  }
}
