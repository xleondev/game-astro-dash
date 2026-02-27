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

    // Player
    this.player = this.physics.add.sprite(120, this.GROUND_Y - 60, 'player');
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundGroup);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.isSliding = false;

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
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', color: '#fff' });
    this.coinText = this.add.text(700, 10, 'Coins: 0', { fontSize: '16px', color: '#fff' });

    this.ZONES = [
      { name: 'Asteroid Belt', bgColor: 0x0a0a1a, groundColor: 0x1a1a4a },
      { name: 'Alien Planet',  bgColor: 0x1a0a2a, groundColor: 0x2a1a0a },
      { name: 'Black Hole',    bgColor: 0x050510, groundColor: 0x101030 },
    ];
    this.currentZone = 0;
    this.zoneScore = 0;
    this.ZONE_LENGTH = 500;
    this.inBoss = false;

    this.zoneText = this.add.text(400, 10, 'Zone 1: Asteroid Belt', {
      fontSize: '14px', color: '#ffdd00'
    }).setOrigin(0.5, 0);
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
  }

  hitObstacle() {
    if (this.gameOver) return;
    this.gameOver = true;
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

    // Jump
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.jumpKey)) && onGround && !this.isSliding) {
      this.player.setVelocityY(-600);
    }

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

  startBoss() {
    this.inBoss = true;
    this.zoneText.setText('!! BOSS !!').setColor('#ff2200');
    // Temporary: auto-advance after 10s (will be replaced in Task 9)
    this.time.delayedCall(10000, () => this.endBoss());
  }

  endBoss() {
    this.currentZone = (this.currentZone + 1) % this.ZONES.length;
    const zone = this.ZONES[this.currentZone];
    this.inBoss = false;
    this.bg1.setFillStyle(zone.bgColor);
    this.zoneText.setText(`Zone ${this.currentZone + 1}: ${zone.name}`).setColor('#ffdd00');
    this.worldSpeed += 30;
  }
}
