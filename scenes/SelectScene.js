const SKINS = [
  { id: 'astronaut_white',  label: 'Astronaut',    cost: 0,   color: 0xffffff },
  { id: 'astronaut_orange', label: 'Orange Suit',  cost: 50,  color: 0xff8800 },
  { id: 'robot',            label: 'Robot',        cost: 100, color: 0x88ccff },
  { id: 'alien',            label: 'Alien',        cost: 150, color: 0x00ff88 },
  { id: 'rocket',           label: 'Mini Rocket',  cost: 200, color: 0xff4444 },
];

export default class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }

  create() {
    this.add.text(400, 20, 'SELECT CHARACTER', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

    const coins = parseInt(localStorage.getItem('astro_coins') || '0');
    const unlocked = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
    const selected = localStorage.getItem('astro_selected') || 'astronaut_white';

    this.add.text(400, 50, `Coins: ${coins}`, { fontSize: '16px', color: '#ffdd00' }).setOrigin(0.5);

    SKINS.forEach((skin, i) => {
      const x = 100 + (i % 5) * 140;
      const y = 140;
      const isUnlocked = unlocked.includes(skin.id);
      const isSelected = skin.id === selected;

      // Skin box
      const box = this.add.rectangle(x, y, 80, 80, skin.color, isUnlocked ? 1 : 0.3)
        .setStrokeStyle(2, isSelected ? 0xffdd00 : 0x444444);

      if (isUnlocked) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => {
          localStorage.setItem('astro_selected', skin.id);
          this.scene.restart();
        });
      }

      this.add.text(x, y + 55, skin.label, { fontSize: '11px', color: isUnlocked ? '#fff' : '#666' }).setOrigin(0.5);

      if (!isUnlocked) {
        this.add.text(x, y + 68, `${skin.cost} coins`, { fontSize: '10px', color: '#ffdd00' }).setOrigin(0.5);

        if (coins >= skin.cost) {
          const buyBtn = this.add.text(x, y - 55, 'BUY', { fontSize: '12px', color: '#00ff88' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
          buyBtn.on('pointerdown', () => {
            const c = parseInt(localStorage.getItem('astro_coins') || '0');
            if (c >= skin.cost) {
              localStorage.setItem('astro_coins', String(c - skin.cost));
              const u = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
              u.push(skin.id);
              localStorage.setItem('astro_unlocked', JSON.stringify(u));
              this.scene.restart();
            }
          });
        }
      }
    });

    const back = this.add.text(400, 275, '< Back to Title', { fontSize: '14px', color: '#aaaaaa' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
