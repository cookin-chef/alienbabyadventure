import Phaser from 'phaser';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  init(data) {
    this.character = data.character || 'aanya';
    this.crystals = data.crystals || 0;
    this.total = data.total || 20;
    this.time = data.time || 120;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Starfield background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x1a0a3e, 0x1a0a3e, 0x0d47a1, 0x0d47a1, 0.8);
    overlay.fillRect(0, 0, width, height);

    // Panel
    this.add.image(width / 2, height / 2 - 10, 'panel').setDisplaySize(440, 360);

    // Calculate star rating
    const pct = this.crystals / this.total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;

    // Title
    const titleText = this.add.text(width / 2, height / 2 - 155, '✨ LEVEL COMPLETE! ✨', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '26px',
      color: '#ffeb3b',
      stroke: '#1a0a3e',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#ff9800', blur: 8, fill: true },
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: titleText,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.easeOut',
      delay: 100,
    });

    // Level name
    this.add.text(width / 2, height / 2 - 120, 'Crystal Cove — World 1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ce93d8',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Character sprite celebrating
    const charSprite = this.add.image(width / 2, height / 2 - 30, this.character, 'power')
      .setScale(3.5).setAlpha(0);
    this.tweens.add({
      targets: charSprite,
      alpha: 1,
      y: height / 2 - 40,
      duration: 500,
      delay: 400,
      ease: 'Back.easeOut',
    });

    // Bounce character
    this.tweens.add({
      targets: charSprite,
      y: height / 2 - 55,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 900,
    });

    // Stars rating
    this.createStarRating(width / 2, height / 2 + 65, stars);

    // Stats
    const statsY = height / 2 + 115;
    this.add.text(width / 2 - 80, statsY, `Crystals: ${this.crystals}/${this.total}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#e040fb',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const mins = Math.floor(this.time / 60);
    const secs = Math.floor(this.time % 60).toString().padStart(2, '0');
    this.add.text(width / 2 + 80, statsY, `Time: ${mins}:${secs}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#69f0ae',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Next / Retry buttons
    const nextBtn = this.createButton(width / 2 - 70, height / 2 + 155, '▶ Next Level', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        // For now, loop back to Level 1 (more levels coming!)
        this.scene.start('Level1Scene', { character: this.character });
      });
    });

    const menuBtn = this.createButton(width / 2 + 90, height / 2 + 155, '🏠 Menu', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('MainMenuScene');
      });
    }, 160);

    // Confetti celebration
    this.createConfetti(width, height);

    this.cameras.main.fadeIn(500);
  }

  createStarRating(x, y, earned) {
    const positions = [-55, 0, 55];
    positions.forEach((offset, i) => {
      const starKey = i < earned ? 'star_full' : 'star_empty';
      const star = this.add.image(x + offset, y, starKey).setScale(0).setAlpha(0);
      const delay = 600 + i * 250;

      this.tweens.add({
        targets: star,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 400,
        ease: 'Back.easeOut',
        delay,
        onComplete: () => {
          if (i < earned) {
            // Sparkle filled stars
            this.tweens.add({
              targets: star,
              angle: 15,
              duration: 150,
              yoyo: true,
              repeat: 1,
              ease: 'Sine.easeInOut',
            });
          }
        },
      });
    });

    // Rating text
    const labels = ['', 'Good job!', 'Great work!', 'PERFECT!'];
    this.time.delayedCall(1350, () => {
      this.add.text(x, y + 35, labels[earned], {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffeb3b',
        stroke: '#1a0a3e',
        strokeThickness: 4,
      }).setOrigin(0.5).setScale(0, 1).setAlpha(0,
        this.tweens.add({ targets: this, alpha: 1, duration: 0 }) // placeholder
      );
      // Re-add properly
      const ratingText = this.children.list[this.children.list.length - 1];
      ratingText.setAlpha(1).setScale(1);
      this.tweens.add({
        targets: ratingText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    });
  }

  createConfetti(width, height) {
    const colors = [0xff5252, 0xff9800, 0xffeb3b, 0x69f0ae, 0x40c4ff, 0xe040fb];
    for (let i = 0; i < 40; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const piece = this.add.graphics();
      piece.fillStyle(color, 0.8);
      const r = Math.random();
      if (r < 0.33) piece.fillRect(-4, -4, 8, 8);
      else if (r < 0.66) piece.fillCircle(0, 0, 4);
      else piece.fillTriangle(-5, 5, 5, 5, 0, -5);

      piece.setPosition(Math.random() * width, -20);
      const startX = piece.x;

      this.tweens.add({
        targets: piece,
        y: height + 30,
        x: startX + (Math.random() - 0.5) * 200,
        angle: Math.random() * 720,
        duration: Math.random() * 3000 + 2000,
        delay: Math.random() * 2000,
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          piece.setPosition(Math.random() * width, -20);
        },
      });
    }
  }

  createButton(x, y, label, callback, w = 200) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_purple').setDisplaySize(w, 52);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(w, 52);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setTexture('btn_purple_hover');
      container.setScale(1.05);
    });
    container.on('pointerout', () => {
      bg.setTexture('btn_purple');
      container.setScale(1);
    });
    container.on('pointerdown', callback);

    return container;
  }
}
