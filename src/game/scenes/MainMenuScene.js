import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    // Animated stars
    this.createStars(width, height);

    // Animated midground parallax (slow float)
    const mid = this.add.image(width / 2, height / 2, 'midground').setDisplaySize(width, height);
    mid.setAlpha(0.5);
    this.tweens.add({
      targets: mid,
      x: width / 2 - 20,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title logo panel
    this.add.image(width / 2, 110, 'title_bg').setDisplaySize(580, 110);

    this.add.text(width / 2, 85, '✨ Alien Baby Adventure ✨', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#7c4dff', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, 125, 'Crystal Cove & Beyond', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ce93d8',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Characters preview on title screen
    this.createCharacterPreviews(width, height);

    // Start button
    const startBtn = this.createButton(width / 2, height - 100, 'START GAME', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('CharacterSelectScene');
      });
    });

    // Pulse animation on start button
    this.tweens.add({
      targets: startBtn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Floating bubbles
    this.createBubbles(width, height);

    // Version text
    this.add.text(width - 8, height - 8, 'v1.0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#7c4dff',
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(500);
  }

  createStars(width, height) {
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.6);
      const size = Math.random() * 2 + 0.5;
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Math.random() * 0.5 + 0.3);
      star.fillCircle(0, 0, size);
      star.setPosition(x, y);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.9 },
        duration: Math.random() * 2000 + 1000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 3000,
      });
    }
  }

  createCharacterPreviews(width, height) {
    // Aanya (left)
    const aanyaContainer = this.add.container(width / 2 - 120, height / 2 + 20);

    const aanyaSprite = this.add.image(0, 0, 'aanya', 'idle').setScale(2.5);
    aanyaContainer.add(aanyaSprite);

    const aanyaLabel = this.add.text(0, 55, 'Aanya', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#4caf50',
      stroke: '#1a0a3e',
      strokeThickness: 4,
    }).setOrigin(0.5);
    aanyaContainer.add(aanyaLabel);

    // Meera (right)
    const meeraContainer = this.add.container(width / 2 + 120, height / 2 + 20);

    const meeraSprite = this.add.image(0, 0, 'meera', 'idle').setScale(2.5);
    meeraContainer.add(meeraSprite);

    const meeraLabel = this.add.text(0, 55, 'Meera', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#2196f3',
      stroke: '#1a0a3e',
      strokeThickness: 4,
    }).setOrigin(0.5);
    meeraContainer.add(meeraLabel);

    // Float animation
    this.tweens.add({
      targets: [aanyaContainer, meeraContainer],
      y: '+=12',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      offset: 300,
    });

    // Walk animation frames for preview
    let walkFrame = false;
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        walkFrame = !walkFrame;
        aanyaSprite.setFrame(walkFrame ? 'walk1' : 'walk2');
        meeraSprite.setFrame(walkFrame ? 'walk2' : 'walk1');
      },
    });
  }

  createBubbles(width, height) {
    const colors = [0x80d8ff, 0xe040fb, 0x69f0ae, 0xffeb3b];
    for (let i = 0; i < 12; i++) {
      const bubble = this.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      bubble.lineStyle(1.5, color, 0.6);
      bubble.strokeCircle(0, 0, size);
      bubble.fillStyle(color, 0.15);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(Math.random() * width, height + 20);

      this.tweens.add({
        targets: bubble,
        y: -40,
        x: bubble.x + (Math.random() - 0.5) * 100,
        duration: Math.random() * 4000 + 3000,
        delay: Math.random() * 5000,
        repeat: -1,
        onRepeat: () => {
          bubble.setPosition(Math.random() * width, height + 20);
        },
      });
    }
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_purple').setDisplaySize(220, 64);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(220, 64);
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
