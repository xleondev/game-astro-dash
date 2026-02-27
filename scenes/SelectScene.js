const SKINS = [
  { id: 'astronaut_white',  label: 'Astronaut',    cost: 0,   texture: 'player', tint: 0xffffff },
  { id: 'astronaut_orange', label: 'Orange Suit',  cost: 50,  texture: 'player', tint: 0xff8800 },
  { id: 'robot',            label: 'Robot',        cost: 100, texture: 'robot',  tint: 0xffffff },
  { id: 'alien',            label: 'Alien',        cost: 150, texture: 'alien',  tint: 0xffffff },
  { id: 'rocket',           label: 'Mini Rocket',  cost: 200, texture: 'rocket', tint: 0xffffff },
];

export { SKINS };

export default class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }

  create() {
    // Dark background
    this.add.rectangle(400, 150, 800, 300, 0x05050f).setOrigin(0.5);

    this.add.text(400, 18, 'SELECT CHARACTER', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

    const coins = parseInt(localStorage.getItem('astro_coins') || '0');
    const unlocked = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
    const selected = localStorage.getItem('astro_selected') || 'astronaut_white';

    this.add.text(400, 44, `★  ${coins} coins`, { fontSize: '14px', color: '#ffdd00' }).setOrigin(0.5);

    // Layout: 5 cards evenly spaced
    const cardW = 90;
    const cardH = 110;
    const startX = 400 - (5 - 1) * 130 / 2;  // centered, 130px gap

    SKINS.forEach((skin, i) => {
      const x = startX + i * 130;
      const y = 155;
      const isUnlocked = unlocked.includes(skin.id);
      const isSelected = skin.id === selected;

      // Card background
      const cardBg = this.add.rectangle(x, y, cardW, cardH, isUnlocked ? 0x1a1a3a : 0x111122)
        .setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0xffdd00 : 0x333355);

      // Hero sprite — scaled to fill most of the card
      const sprite = this.add.image(x, y - 8, skin.texture)
        .setScale(1.5)
        .setTint(isUnlocked ? skin.tint : 0x333344);

      // Selected glow effect (extra highlight ring)
      if (isSelected) {
        this.add.rectangle(x, y, cardW + 4, cardH + 4, 0x000000, 0)
          .setStrokeStyle(1, 0xffdd00, 0.4);
      }

      // Dark overlay for locked cards
      if (!isUnlocked) {
        this.add.rectangle(x, y, cardW, cardH, 0x000000, 0.55);
        // Lock icon — simple pixel padlock
        this.drawLock(x, y - 6);
      }

      // Skin name
      this.add.text(x, y + cardH / 2 - 14, skin.label, {
        fontSize: '10px',
        color: isUnlocked ? (isSelected ? '#ffdd00' : '#cccccc') : '#555566',
      }).setOrigin(0.5);

      // Cost or SELECTED badge
      if (isSelected) {
        this.add.text(x, y + cardH / 2, '✦ ACTIVE', { fontSize: '9px', color: '#ffdd00' }).setOrigin(0.5);
      } else if (!isUnlocked) {
        this.add.text(x, y + cardH / 2, `${skin.cost} coins`, { fontSize: '9px', color: '#888899' }).setOrigin(0.5);
      }

      // Click to select (unlocked only)
      if (isUnlocked && !isSelected) {
        cardBg.setInteractive({ useHandCursor: true });
        sprite.setInteractive({ useHandCursor: true });
        const select = () => {
          localStorage.setItem('astro_selected', skin.id);
          this.scene.restart();
        };
        cardBg.on('pointerdown', select);
        sprite.on('pointerdown', select);
        cardBg.on('pointerover', () => cardBg.setStrokeStyle(2, 0x8888ff));
        cardBg.on('pointerout',  () => cardBg.setStrokeStyle(1, 0x333355));
      }

      // BUY button (locked but affordable)
      if (!isUnlocked && coins >= skin.cost) {
        const btnBg = this.add.rectangle(x, y + cardH / 2 + 14, 60, 18, 0x005500)
          .setStrokeStyle(1, 0x00ff88)
          .setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(x, y + cardH / 2 + 14, 'BUY', { fontSize: '11px', color: '#00ff88' })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        const buy = () => {
          const c = parseInt(localStorage.getItem('astro_coins') || '0');
          if (c >= skin.cost) {
            localStorage.setItem('astro_coins', String(c - skin.cost));
            const u = JSON.parse(localStorage.getItem('astro_unlocked') || '["astronaut_white"]');
            u.push(skin.id);
            localStorage.setItem('astro_unlocked', JSON.stringify(u));
            this.scene.restart();
          }
        };
        btnBg.on('pointerdown', buy);
        btnTxt.on('pointerdown', buy);
        btnBg.on('pointerover', () => { btnBg.setFillStyle(0x007700); btnTxt.setColor('#ffffff'); });
        btnBg.on('pointerout',  () => { btnBg.setFillStyle(0x005500); btnTxt.setColor('#00ff88'); });
      }
    });

    // Back button
    const back = this.add.text(400, 284, '◀  Back to Title', { fontSize: '13px', color: '#666688' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#aaaacc'));
    back.on('pointerout',  () => back.setColor('#666688'));
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  // Draws a simple pixel padlock at (cx, cy)
  drawLock(cx, cy) {
    const g = this.add.graphics();
    // Shackle (top arc — two vertical lines + top bar)
    g.fillStyle(0xaaaaaa);
    g.fillRect(cx - 5, cy - 14, 3, 8);
    g.fillRect(cx + 2, cy - 14, 3, 8);
    g.fillRect(cx - 5, cy - 17, 10, 4);
    // Body
    g.fillStyle(0xcccccc);
    g.fillRect(cx - 8, cy - 6, 16, 13);
    // Keyhole
    g.fillStyle(0x333333);
    g.fillRect(cx - 2, cy - 2, 4, 6);
  }
}
