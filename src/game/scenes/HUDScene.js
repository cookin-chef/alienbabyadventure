import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  init(data) {
    this.lives = data.lives || 3;
    this.crystals = data.crystals || 0;
    this.total = data.total || 20;
    this.icePower = data.icePower || 100;
    this.levelName = data.levelName || 'Level 1';
  }

  create() {
    const { width } = this.cameras.main;

    // Semi-transparent HUD background strip
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.4);
    hudBg.fillRect(0, 0, width, 50);

    // ── Hearts (lives) ── top-left
    this.heartImages = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(20 + i * 38, 25, 'heart_full').setScale(0.85);
      this.heartImages.push(heart);
    }

    // ── Ice power bar ── top-center
    this.add.image(width / 2, 16, 'icebar_bg').setDisplaySize(160, 16);
    this.iceBarFill = this.add.image(width / 2 - 80, 16, 'icebar_fill')
      .setDisplaySize(160, 16)
      .setOrigin(0, 0.5);

    this.add.text(width / 2, 34, '❄ ICE POWER', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#80d8ff',
    }).setOrigin(0.5);

    // Cooldown overlay
    this.iceCooldownText = this.add.text(width / 2, 16, '', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#1a0a3e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Crystal counter ── top-right
    this.add.image(width - 80, 18, 'crystal_icon').setScale(1.2);
    this.crystalText = this.add.text(width - 62, 18, `${this.crystals}/${this.total}`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#e040fb',
      stroke: '#1a0a3e',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);

    // ── Level name ── top-right corner
    this.add.text(width - 10, 42, this.levelName, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ce93d8',
    }).setOrigin(1, 0.5);

    // ── Pause button ──
    const pauseBtn = this.add.text(width / 2 - 290, 20, '⏸', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => {
      this.scene.launch('PauseScene');
      this.scene.pause('Level1Scene');
      this.scene.pause('HUDScene');
      this.scene.pause('TouchControlsScene');
    });
  }

  updateLives(lives) {
    this.lives = lives;
    this.heartImages.forEach((heart, i) => {
      heart.setTexture(i < lives ? 'heart_full' : 'heart_empty');
    });

    // Flash hearts on damage
    if (lives < this.heartImages.length) {
      this.tweens.add({
        targets: this.heartImages[lives],
        alpha: { from: 1, to: 0 },
        duration: 150,
        yoyo: true,
        repeat: 3,
      });
    }
  }

  updateCrystals(crystals) {
    this.crystals = crystals;
    this.crystalText.setText(`${crystals}/${this.total}`);

    // Pop animation
    this.tweens.add({
      targets: this.crystalText,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  updateIcePower(power) {
    this.icePower = power;
    const pct = power / 100;
    this.iceBarFill.setDisplaySize(Math.max(0, 160 * pct), 16);

    // Color feedback
    if (power < 30) {
      this.iceBarFill.setTint(0xff5252);
    } else if (power < 60) {
      this.iceBarFill.setTint(0xffd740);
    } else {
      this.iceBarFill.clearTint();
    }
  }
}
