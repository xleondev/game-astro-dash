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
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', color: '#fff' });
    this.coinText = this.add.text(700, 10, 'Coins: 0', { fontSize: '16px', color: '#fff' });
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
