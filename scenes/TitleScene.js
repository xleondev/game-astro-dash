import { audio } from '../audio.js';

export default class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    audio.stopMusic();
    this.add.text(400, 70, 'ASTRO DASH', { fontSize: '52px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 130, '8-BIT SPACE RUNNER', { fontSize: '16px', color: '#8888ff' }).setOrigin(0.5);

    const best = parseInt(localStorage.getItem('astro_best') || '0');
    const coins = parseInt(localStorage.getItem('astro_coins') || '0');
    this.add.text(400, 175, `Best Score: ${best}`, { fontSize: '18px', color: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 200, `Coins: ${coins}`, { fontSize: '16px', color: '#ffdd00' }).setOrigin(0.5);

    this.add.text(400, 240, 'Press SPACE or TAP to Start', { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);

    const selectBtn = this.add.text(400, 275, 'Change Character >', { fontSize: '14px', color: '#00ff88' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    selectBtn.on('pointerdown', () => this.scene.start('SelectScene'));

    const startGame = () => {
      audio.resume();
      this.scene.start('GameScene');
    };

    this.input.keyboard.once('keydown-SPACE', startGame);

    // Large tap zone covering the middle of the screen (excludes the selectBtn area)
    const tapZone = this.add.rectangle(400, 160, 800, 200, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    tapZone.on('pointerdown', startGame);
  }
}
