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

    // HUD placeholder
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', color: '#fff' });
    this.coinText = this.add.text(700, 10, 'Coins: 0', { fontSize: '16px', color: '#fff' });
  }

  update(time, delta) {
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
