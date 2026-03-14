import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.character = data.character || 'aanya';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0020, 0.75);
    overlay.fillRect(0, 0, width, height);

    // Panel
    this.add.image(width / 2, height / 2, 'panel').setDisplaySize(400, 320);

    // Game over title with dramatic entrance
    const titleText = this.add.text(width / 2, height / 2 - 115, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '38px',
      color: '#ff5252',
      stroke: '#1a0a3e',
      strokeThickness: 7,
      shadow: { offsetX: 3, offsetY: 3, color: '#7c4dff', blur: 10, fill: true },
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: titleText,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 200,
    });

    // Character sprite looking sad
    const charSprite = this.add.image(width / 2, height / 2 - 20, this.character, 'hurt')
      .setScale(3);
    charSprite.setAlpha(0);

    this.tweens.add({
      targets: charSprite,
      alpha: 1,
      duration: 400,
      delay: 500,
    });

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 + 55, "Don't give up! Try again!", {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ce93d8',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 400,
      delay: 700,
    });

    // Try again button
    const retryBtn = this.createButton(width / 2, height / 2 + 100, '↺ Try Again', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('Level1Scene', { character: this.character });
      });
    });
    retryBtn.setAlpha(0);
    this.tweens.add({ targets: retryBtn, alpha: 1, duration: 300, delay: 900 });

    // Main menu button
    const menuBtn = this.createButton(width / 2, height / 2 + 165, '🏠 Main Menu', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });
    menuBtn.setAlpha(0);
    this.tweens.add({ targets: menuBtn, alpha: 1, duration: 300, delay: 1000 });

    // Falling particles (tears/drops)
    this.createSadParticles(width, height);

    this.cameras.main.fadeIn(400);
  }

  createSadParticles(width, height) {
    for (let i = 0; i < 15; i++) {
      const drop = this.add.graphics();
      drop.fillStyle(0x80d8ff, 0.5);
      drop.fillEllipse(0, 0, 6, 10);
      drop.setPosition(Math.random() * width, -20);

      this.tweens.add({
        targets: drop,
        y: height + 20,
        x: drop.x + (Math.random() - 0.5) * 40,
        duration: Math.random() * 2000 + 2000,
        delay: Math.random() * 3000,
        repeat: -1,
        onRepeat: () => {
          drop.setPosition(Math.random() * width, -20);
        },
      });
    }
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_purple').setDisplaySize(230, 56);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(230, 56);
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
