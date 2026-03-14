import Phaser from 'phaser';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.selectedCharacter = null;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0020, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 50, 'Choose Your Hero!', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#7c4dff',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#e040fb', blur: 10, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Both heroes share the Water-to-Ice power ❄️', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ce93d8',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Character cards
    this.createCharacterCard(width / 2 - 140, height / 2 + 10, 'aanya', 'Aanya', '#4caf50',
      'Green dress & red wig\nFreezes water with\nicy precision!');
    this.createCharacterCard(width / 2 + 140, height / 2 + 10, 'meera', 'Meera', '#2196f3',
      'Blue dress & pink wig\nFreezes water with\ncool style!');

    // Start button (disabled until selection)
    this.startBtn = this.createButton(width / 2, height - 60, 'START ADVENTURE!', () => {
      if (this.selectedCharacter) {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('Level1Scene', { character: this.selectedCharacter });
        });
      }
    });
    this.startBtn.setAlpha(0.4);

    // Tap prompt
    this.promptText = this.add.text(width / 2, height - 60, 'Select a character to begin!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#9e9e9e',
    }).setOrigin(0.5);

    // Floating particles
    this.createFloatingStars(width, height);

    this.cameras.main.fadeIn(400);
  }

  createCharacterCard(x, y, charKey, name, nameColor, description) {
    const container = this.add.container(x, y);

    // Card background
    const card = this.add.image(0, 0, 'char_card').setDisplaySize(210, 290);
    container.add(card);

    // Character sprite (large)
    const sprite = this.add.image(0, -60, charKey, 'idle').setScale(3);
    container.add(sprite);

    // Name
    const nameText = this.add.text(0, 65, name, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '22px',
      color: nameColor,
      stroke: '#1a0a3e',
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(nameText);

    // Description
    const descText = this.add.text(0, 105, description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#e0e0e0',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    container.add(descText);

    // Power icon
    const powerLabel = this.add.text(0, 130, '❄ Ice Power', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#80d8ff',
    }).setOrigin(0.5);
    container.add(powerLabel);

    // Make interactive
    container.setSize(210, 290);
    container.setInteractive({ useHandCursor: true });

    // Selection indicator (initially hidden)
    const selectRing = this.add.image(0, 0, 'char_card_selected').setDisplaySize(210, 290);
    selectRing.setVisible(false);
    container.add(selectRing);

    // Hover effect
    container.on('pointerover', () => {
      if (this.selectedCharacter !== charKey) {
        this.tweens.add({
          targets: container,
          scaleY: 1.04,
          scaleX: 1.04,
          duration: 150,
          ease: 'Back.easeOut',
        });
      }
    });

    container.on('pointerout', () => {
      if (this.selectedCharacter !== charKey) {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
        });
      }
    });

    container.on('pointerdown', () => {
      this.selectCharacter(charKey, container, selectRing, sprite);
    });

    // Float animation
    this.tweens.add({
      targets: container,
      y: y + 10,
      duration: 1500 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Walk cycle animation
    let frame = false;
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        frame = !frame;
        sprite.setFrame(frame ? 'walk1' : 'idle');
      },
    });

    return container;
  }

  selectCharacter(charKey, container, selectRing, sprite) {
    this.selectedCharacter = charKey;

    // Show selection on all cards — reset others first
    this.scene.scene.children.list.forEach(() => {}); // Refresh

    selectRing.setVisible(true);

    // Power animation on selected character
    sprite.setFrame('power');
    this.time.delayedCall(600, () => sprite.setFrame('idle'));

    // Scale up selected
    this.tweens.add({
      targets: container,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Sparkle particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const spark = this.add.image(
        container.x + Math.cos(angle) * 50,
        container.y + Math.sin(angle) * 80,
        'sparkle'
      ).setScale(1.5);
      this.tweens.add({
        targets: spark,
        x: container.x + Math.cos(angle) * 100,
        y: container.y + Math.sin(angle) * 130,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      });
    }

    // Enable start button
    this.startBtn.setAlpha(1);
    this.promptText.setVisible(false);

    // Pulse start button
    this.tweens.add({
      targets: this.startBtn,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_purple').setDisplaySize(260, 60);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(260, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      if (this.selectedCharacter) bg.setTexture('btn_purple_hover');
    });
    container.on('pointerout', () => {
      bg.setTexture('btn_purple');
    });
    container.on('pointerdown', callback);

    return container;
  }

  createFloatingStars(width, height) {
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.image(
        Math.random() * width,
        Math.random() * height,
        'sparkle'
      ).setScale(Math.random() + 0.5).setAlpha(0.6);

      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - 150,
        alpha: 0,
        duration: Math.random() * 3000 + 2000,
        delay: Math.random() * 4000,
        repeat: -1,
        onRepeat: () => {
          sparkle.setPosition(Math.random() * width, height + 20);
          sparkle.setAlpha(0.6);
        },
      });
    }
  }
}
