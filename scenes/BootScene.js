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
