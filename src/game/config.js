import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import CharacterSelectScene from './scenes/CharacterSelectScene';
import Level1Scene from './scenes/Level1Scene';
import HUDScene from './scenes/HUDScene';
import TouchControlsScene from './scenes/TouchControlsScene';
import PauseScene from './scenes/PauseScene';
import GameOverScene from './scenes/GameOverScene';
import LevelCompleteScene from './scenes/LevelCompleteScene';

export function createGame(parent) {
  // Get parent dimensions for responsive sizing
  const parentW = parent.clientWidth || window.innerWidth;
  const parentH = parent.clientHeight || window.innerHeight;

  // Target 16:9 or 16:10 ratio, capped at 800x600 logical resolution
  const targetW = 800;
  const targetH = 600;

  const config = {
    type: Phaser.AUTO,
    width: targetW,
    height: targetH,
    parent,
    backgroundColor: '#1a0a3e',
    pixelArt: false,
    antialias: true,

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: targetW,
      height: targetH,
    },

    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600 },
        debug: false,
      },
    },

    input: {
      activePointers: 3, // Support multi-touch
    },

    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      CharacterSelectScene,
      Level1Scene,
      HUDScene,
      TouchControlsScene,
      PauseScene,
      GameOverScene,
      LevelCompleteScene,
    ],
  };

  return new Phaser.Game(config);
}
