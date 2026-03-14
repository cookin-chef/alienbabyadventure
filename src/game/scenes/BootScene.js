import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Minimal loading - just set background color
    this.cameras.main.setBackgroundColor('#1a0a3e');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
