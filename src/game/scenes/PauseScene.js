import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);

    // Panel
    this.add.image(width / 2, height / 2, 'panel').setDisplaySize(360, 280);

    // Title
    this.add.text(width / 2, height / 2 - 100, '⏸  PAUSED', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#7c4dff',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Resume button
    this.createButton(width / 2, height / 2 - 30, '▶ Resume', () => {
      this.scene.resume('Level1Scene');
      this.scene.resume('HUDScene');
      this.scene.resume('TouchControlsScene');
      this.scene.stop('PauseScene');
    });

    // Restart button
    this.createButton(width / 2, height / 2 + 45, '↺ Restart Level', () => {
      this.scene.stop('HUDScene');
      this.scene.stop('TouchControlsScene');
      this.scene.stop('Level1Scene');
      this.scene.stop('PauseScene');
      this.scene.start('Level1Scene', { character: this.scene.get('Level1Scene')?.selectedCharacter || 'aanya' });
    });

    // Main menu button
    this.createButton(width / 2, height / 2 + 110, '🏠 Main Menu', () => {
      this.scene.stop('HUDScene');
      this.scene.stop('TouchControlsScene');
      this.scene.stop('Level1Scene');
      this.scene.stop('PauseScene');
      this.scene.start('MainMenuScene');
    });
  }

  createButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'btn_purple').setDisplaySize(240, 52);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      stroke: '#4a148c',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(240, 52);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setTexture('btn_purple_hover');
      container.setScale(1.04);
    });
    container.on('pointerout', () => {
      bg.setTexture('btn_purple');
      container.setScale(1);
    });
    container.on('pointerdown', callback);

    return container;
  }
}
