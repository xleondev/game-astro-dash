export default class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }
  create() {
    this.add.text(400, 150, 'SELECT SCENE (stub)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
  }
}
