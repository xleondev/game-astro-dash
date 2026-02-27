export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.add.text(400, 150, 'GAME SCENE (stub)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
  }
}
