import Phaser from 'phaser';

/**
 * TouchControlsScene - Renders virtual D-pad and action buttons for mobile.
 * Runs as a scene overlay on top of the game scene.
 * Communicates input via the game scene's touchInput object.
 */
export default class TouchControlsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TouchControlsScene' });
  }

  init(data) {
    this.gameSceneKey = data.gameScene || 'Level1Scene';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Only show on touch-capable devices
    // (but we always create them for compatibility — they're semi-transparent)
    const isTouch = this.sys.game.device.input.touch;

    this.createDPad(width, height);
    this.createActionButtons(width, height);

    // Make the scene transparent (don't block background)
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    if (!isTouch) {
      // Desktop: make buttons very transparent
      this.children.list.forEach((child) => {
        if (child.alpha !== undefined) child.setAlpha(child.alpha * 0.3);
      });
    }
  }

  getGameScene() {
    return this.scene.get(this.gameSceneKey);
  }

  createDPad(width, height) {
    const padX = 90;
    const padY = height - 90;
    const btnSize = 64;
    const gap = 68;

    // Left button
    this.createDPadBtn(padX - gap, padY, '◀', () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.left = true;
    }, () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.left = false;
    });

    // Right button
    this.createDPadBtn(padX + gap, padY, '▶', () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.right = true;
    }, () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.right = false;
    });

    // Up/Jump button (center-top of D-pad)
    this.createDPadBtn(padX, padY - gap, '▲', () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.jump = true;
    }, () => {});
  }

  createDPadBtn(x, y, icon, onDown, onUp) {
    const btn = this.add.container(x, y);
    btn.setScrollFactor(0);

    const bg = this.add.image(0, 0, 'dpad_btn').setDisplaySize(64, 64).setAlpha(0.7);
    btn.add(bg);

    const label = this.add.text(0, 0, icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.9);
    btn.add(label);

    btn.setSize(64, 64);
    btn.setInteractive();

    btn.on('pointerdown', (ptr) => {
      bg.setAlpha(1);
      onDown(ptr);
    });
    btn.on('pointerup', (ptr) => {
      bg.setAlpha(0.7);
      onUp(ptr);
    });
    btn.on('pointerout', (ptr) => {
      bg.setAlpha(0.7);
      onUp(ptr);
    });

    return btn;
  }

  createActionButtons(width, height) {
    const padY = height - 90;

    // Jump button (right side, bottom)
    this.createActionBtn(width - 90, padY, '↑\nJUMP', 'jump_btn', '#00e5ff', () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.jump = true;
    });

    // Ice power button (right side, upper)
    this.createActionBtn(width - 170, padY - 10, '❄\nICE', 'action_btn', '#e040fb', () => {
      const gs = this.getGameScene();
      if (gs && gs.touchInput) gs.touchInput.ice = true;
    });
  }

  createActionBtn(x, y, label, texture, color, onDown) {
    const btn = this.add.container(x, y);
    btn.setScrollFactor(0);

    const bg = this.add.image(0, 0, texture).setDisplaySize(72, 72).setAlpha(0.75);
    btn.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '13px',
      color,
      stroke: '#1a0a3e',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setAlpha(0.95);
    btn.add(text);

    btn.setSize(72, 72);
    btn.setInteractive();

    btn.on('pointerdown', () => {
      bg.setAlpha(1);
      btn.setScale(0.93);
      onDown();
    });
    btn.on('pointerup', () => {
      bg.setAlpha(0.75);
      btn.setScale(1);
    });
    btn.on('pointerout', () => {
      bg.setAlpha(0.75);
      btn.setScale(1);
    });

    return btn;
  }
}
