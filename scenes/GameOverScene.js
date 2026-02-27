import { audio } from '../audio.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data) {
    audio.stopMusic();
    const score = data.score || 0;
    const coins = data.coins || 0;

    // Load + update persistent data
    const prevBest = parseInt(localStorage.getItem('astro_best') || '0');
    const newBest = Math.max(prevBest, score);
    localStorage.setItem('astro_best', String(newBest));

    const prevCoins = parseInt(localStorage.getItem('astro_coins') || '0');
    localStorage.setItem('astro_coins', String(prevCoins + coins));

    // UI
    this.add.text(400, 60, 'GAME OVER', { fontSize: '40px', color: '#ff2200' }).setOrigin(0.5);
    this.add.text(400, 130, `Score: ${score}`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 165, `Best:  ${newBest}`, { fontSize: '20px', color: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 200, `Coins earned: ${coins}`, { fontSize: '18px', color: '#ffdd00' }).setOrigin(0.5);
    this.add.text(400, 230, `Total coins: ${prevCoins + coins}`, { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);

    // Large touch-friendly button
    const btnBg = this.add.rectangle(400, 270, 220, 44, 0x003322)
      .setStrokeStyle(2, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    const btn = this.add.text(400, 270, '[ PLAY AGAIN ]', { fontSize: '20px', color: '#00ff88' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const goTitle = () => this.scene.start('TitleScene');
    btnBg.on('pointerover', () => { btnBg.setFillStyle(0x005533); btn.setColor('#ffffff'); });
    btnBg.on('pointerout',  () => { btnBg.setFillStyle(0x003322); btn.setColor('#00ff88'); });
    btnBg.on('pointerdown', goTitle);
    btn.on('pointerdown', goTitle);

    this.input.keyboard.once('keydown-SPACE', goTitle);
  }
}
