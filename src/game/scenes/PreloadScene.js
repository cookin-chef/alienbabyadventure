import Phaser from 'phaser';
import { generateAllAssets } from '../AssetGenerator';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2d0057, 1);
    barBg.fillRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 15);
    barBg.lineStyle(2, 0x7c4dff, 1);
    barBg.strokeRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 15);

    const barFill = this.add.graphics();

    // Title text
    this.add.text(width / 2, height / 2 - 80, 'Alien Baby Adventure', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: '#e040fb',
      stroke: '#4a148c',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height / 2 + 35, 'Loading magical world...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ce93d8',
    }).setOrigin(0.5);

    // Stars twinkling in background
    for (let i = 0; i < 40; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Math.random() * 0.6 + 0.2);
      star.fillCircle(0, 0, Math.random() * 2 + 0.5);
      star.setPosition(Math.random() * width, Math.random() * height);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.9 },
        duration: Math.random() * 1500 + 800,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }

    // Generate all assets programmatically (takes 1-2 frames)
    let progress = 0;
    const steps = 8;
    const stepTime = 60;

    const updateBar = (pct) => {
      barFill.clear();
      barFill.fillStyle(0xe040fb, 1);
      barFill.fillRoundedRect(
        width / 2 - 196,
        height / 2 - 11,
        Math.max(0, 392 * pct),
        22,
        11
      );
    };

    // Generate assets over multiple frames to avoid freezing
    const generateStep = () => {
      if (progress === 0) {
        // Generate all assets in one go (it's fast with graphics)
        generateAllAssets(this);
      }
      progress++;
      updateBar(progress / steps);
      loadingText.setText(`Loading... ${Math.round((progress / steps) * 100)}%`);

      if (progress >= steps) {
        loadingText.setText('Ready!');
        this.time.delayedCall(300, () => {
          this.scene.start('MainMenuScene');
        });
      } else {
        this.time.delayedCall(stepTime, generateStep);
      }
    };

    this.time.delayedCall(100, generateStep);
  }
}
