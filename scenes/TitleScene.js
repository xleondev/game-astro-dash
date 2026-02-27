export default class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 150, 'ASTRO DASH', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
    this.add.text(400, 220, 'Press SPACE to Start', { fontSize: '18px', color: '#aaa' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }
}
