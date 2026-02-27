import { audio } from '../audio.js';

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

    // Player — use correct texture and tint per selected skin
    const SKIN_DATA = {
      astronaut_white:  { texture: 'player',  tint: 0xffffff },
      astronaut_orange: { texture: 'player',  tint: 0xff8800 },
      robot:            { texture: 'robot',   tint: 0xffffff },
      alien:            { texture: 'alien',   tint: 0xffffff },
      rocket:           { texture: 'rocket',  tint: 0xffffff },
    };
    const selected = localStorage.getItem('astro_selected') || 'astronaut_white';
    const skinData = SKIN_DATA[selected] || SKIN_DATA.astronaut_white;

    this.player = this.physics.add.sprite(120, this.GROUND_Y - 60, skinData.texture);
    this.player.setCollideWorldBounds(true);
    this.player.setTint(skinData.tint);

    this.physics.add.collider(this.player, this.groundGroup);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.isSliding = false;

    // Touch input flags (set by on-screen buttons and swipe detection)
    this._jumpPressed = false;
    this._slidePressed = false;
    this._touchStartY = 0;

    // On-screen touch buttons
    this._buildTouchControls();

    // Swipe detection (tap = jump, swipe down = slide)
    this.input.on('pointerdown', (p) => { this._touchStartY = p.y; });
    this.input.on('pointerup', (p) => {
      if (this.gameOver) return;
      const dy = p.y - this._touchStartY;
      if (dy > 40) {
        this._slidePressed = true;
      } else if (Math.abs(dy) < 40) {
        this._jumpPressed = true;
      }
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
    this.physics.add.collider(this.obstacles, this.groundGroup);
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

    this.spawnObstacle();

    // Coins
    this.coins = this.physics.add.group();
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.spawnCoin();

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
  }

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
    if (this.gameOver) return;
    this.gameOver = true;

    // Clean up boss events if active
    if (this.bossCountdown) { this.bossCountdown.remove(); this.bossCountdown = null; }
    if (this.bossFiringEvent) { this.bossFiringEvent.remove(); this.bossFiringEvent = null; }

    audio.stopMusic();
    audio.playSFX('hit');
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: Math.floor(this.score), coins: this.coinsCollected });
    });
  }

  update(time, delta) {
    const dt = delta / 1000;

    if (this.gameOver) return;
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

    // Jump — keyboard or touch
    const jumpTrigger = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.jumpKey)
      || this._jumpPressed;
    this._jumpPressed = false;

    if (jumpTrigger && onGround && !this.isSliding) {
      this.player.setVelocityY(-600);
      audio.playSFX('jump');
    }

    // Slide — keyboard or touch
    const slideTrigger = Phaser.Input.Keyboard.JustDown(this.cursors.down)
      || this._slidePressed;
    this._slidePressed = false;

    if (slideTrigger && onGround && !this.isSliding) {
      this.isSliding = true;
      audio.playSFX('slide');
      this.player.setDisplaySize(40, 30);
      this.player.body.setSize(40, 30);
      this.player.y = this.GROUND_Y - 15;
      this.time.delayedCall(500, () => {
        this.isSliding = false;
        this.player.setDisplaySize(40, 60);
        this.player.body.setSize(40, 60);
      });
    }

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

  _buildTouchControls() {
    // Only show on-screen buttons on touch devices
    if (!this.sys.game.device.input.touch) return;

    const alpha = 0.18;
    const btnW = 160;
    const btnH = 52;
    const y = 274;

    // Jump button — left side
    const jumpBg = this.add.rectangle(btnW / 2, y, btnW, btnH, 0xffffff, alpha)
      .setStrokeStyle(1, 0xffffff, 0.35)
      .setDepth(20)
      .setInteractive();
    this.add.text(btnW / 2, y, '▲  JUMP', { fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5).setAlpha(0.7).setDepth(21);

    jumpBg.on('pointerdown', () => { this._jumpPressed = true; });

    // Slide button — right side
    const slideBg = this.add.rectangle(800 - btnW / 2, y, btnW, btnH, 0xffffff, alpha)
      .setStrokeStyle(1, 0xffffff, 0.35)
      .setDepth(20)
      .setInteractive();
    this.add.text(800 - btnW / 2, y, '▼  SLIDE', { fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5).setAlpha(0.7).setDepth(21);

    slideBg.on('pointerdown', () => { this._slidePressed = true; });
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
    this.zoneText.setText(`Zone ${this.currentZone + 1}: ${zone.name}`).setColor('#ffdd00');
    this.worldSpeed += 30;
    audio.playMusic(this.currentZone);
  }
}
