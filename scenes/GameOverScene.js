export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  create() {
    this.add.text(400, 150, 'GAME OVER (stub)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
  }
}
