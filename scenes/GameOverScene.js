export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data) {
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

    const btn = this.add.text(400, 270, '[ PLAY AGAIN ]', { fontSize: '20px', color: '#00ff88' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#00ff88'));
    btn.on('pointerdown', () => this.scene.start('TitleScene'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('TitleScene'));
  }
}
