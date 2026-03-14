import Phaser from 'phaser';

const LEVEL_WIDTH = 3200;
const TILE_SIZE = 64;
const GROUND_Y = 552; // y position of ground surface
const GRAVITY = 600;

// ── Platform layout ──────────────────────────────────────────────
const PLATFORMS = [
  { x: 128, y: 440, w: 3 },   // near start
  { x: 384, y: 380, w: 3 },
  { x: 600, y: 440, w: 2 },
  { x: 800, y: 360, w: 3 },
  // after water pool ~1000-1200
  { x: 1300, y: 350, w: 3 },
  { x: 1520, y: 430, w: 2 },
  { x: 1700, y: 360, w: 3 },
  { x: 1950, y: 430, w: 2 },
  // after fire ~2050-2150
  { x: 2200, y: 380, w: 3 },
  { x: 2450, y: 320, w: 3 },
  { x: 2650, y: 420, w: 2 },
  { x: 2850, y: 350, w: 3 },
  { x: 3000, y: 440, w: 2 },
];

const WATER_POOLS = [
  { x: 1000, y: GROUND_Y - 16, w: 5 },  // 5 tiles wide
  { x: 2100, y: GROUND_Y - 16, w: 4 },
];

const FIRE_HAZARDS = [
  { x: 1760, y: GROUND_Y - 32, count: 3 },
  { x: 2720, y: GROUND_Y - 32, count: 2 },
];

const CRYSTAL_POSITIONS = [
  { x: 180, y: 380 }, { x: 420, y: 320 }, { x: 630, y: 380 },
  { x: 840, y: 300 }, { x: 960, y: 430 }, { x: 1050, y: 350 },
  { x: 1150, y: 350 }, { x: 1360, y: 290 }, { x: 1540, y: 370 },
  { x: 1740, y: 300 }, { x: 1980, y: 370 }, { x: 2260, y: 320 },
  { x: 2400, y: 360 }, { x: 2500, y: 260 }, { x: 2700, y: 360 },
  { x: 2900, y: 290 }, { x: 3020, y: 380 }, { x: 3080, y: 340 },
  { x: 700, y: 410 }, { x: 1600, y: 400 },
];

const ENEMY_POSITIONS = [
  { x: 600, patrol: 100 },
  { x: 1100, patrol: 80 },
  { x: 1900, patrol: 120 },
  { x: 2500, patrol: 100 },
  { x: 2950, patrol: 80 },
];

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1Scene' });
  }

  init(data) {
    this.selectedCharacter = data.character || 'aanya';
    this.lives = 3;
    this.crystals = 0;
    this.totalCrystals = CRYSTAL_POSITIONS.length;
    this.icePower = 100; // 0-100
    this.iceCooldown = false;
    this.isHurt = false;
    this.isDead = false;
    this.levelComplete = false;
    this.startTime = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, height);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, height);

    // ── Background layers ──
    this.createBackground(width, height);

    // ── World setup ──
    this.createGround();
    this.createPlatforms();
    this.waterTiles = this.createWaterPools();
    this.iceTiles = this.physics.add.staticGroup(); // frozen water platforms
    this.createFireHazards();
    this.createCrystals();
    this.createPortal();

    // ── Player ──
    this.player = this.createPlayer();

    // ── Enemies ──
    this.enemies = this.createEnemies();

    // ── Camera ──
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor('#1a0a3e');

    // ── Collisions ──
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.collider(this.player, this.iceTiles);
    this.physics.add.collider(this.enemies, this.groundGroup);
    this.physics.add.collider(this.enemies, this.platformGroup);

    // Player collects crystals
    this.physics.add.overlap(this.player, this.crystalGroup, this.collectCrystal, null, this);

    // Player touches fire
    this.physics.add.overlap(this.player, this.fireGroup, this.hitFire, null, this);

    // Player touches enemies
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // Player touches unfrozen water — damage
    this.physics.add.overlap(this.player, this.waterTiles, (player, tile) => {
      if (!tile.isFrozen && !this.isHurt) {
        this.takeDamage(player);
      }
    }, null, this);

    // Player reaches portal
    this.physics.add.overlap(this.player, this.portal, this.reachPortal, null, this);

    // ── Input ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      ice: Phaser.Input.Keyboard.KeyCodes.SPACE,
      ice2: Phaser.Input.Keyboard.KeyCodes.E,
    });

    // Touch controls input state (set by TouchControlsScene)
    this.touchInput = { left: false, right: false, jump: false, ice: false };

    // ── HUD ──
    this.scene.launch('HUDScene', {
      lives: this.lives,
      crystals: this.crystals,
      total: this.totalCrystals,
      icePower: this.icePower,
      levelName: 'Crystal Cove',
    });
    this.hud = this.scene.get('HUDScene');

    // ── Touch controls ──
    this.scene.launch('TouchControlsScene', { gameScene: 'Level1Scene' });

    // ── Particle emitters ──
    this.iceParticles = this.add.particles(0, 0, 'ice_particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 220, max: 320 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 500,
      quantity: 0,
    });

    this.sparkleParticles = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 0,
    });

    // Start timer
    this.startTime = this.time.now;

    // Walk animation state
    this.walkTimer = 0;
    this.walkFrame = false;

    this.cameras.main.fadeIn(500);
  }

  // ── World Creation ────────────────────────────────────────────

  createBackground(width, height) {
    // scrollFactor(0) = stays at fixed screen position; we move tilePosition manually for parallax
    const bg = this.add.tileSprite(0, 0, width, height, 'background')
      .setOrigin(0, 0)
      .setScrollFactor(0);

    const mid = this.add.tileSprite(0, 0, width, height, 'midground')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setAlpha(0.6);

    this.bgLayers = { bg, mid };
  }

  createGround() {
    this.groundGroup = this.physics.add.staticGroup();
    const tilesPerRow = Math.ceil(LEVEL_WIDTH / TILE_SIZE) + 2;
    for (let i = 0; i < tilesPerRow; i++) {
      const tile = this.groundGroup.create(
        i * TILE_SIZE + TILE_SIZE / 2,
        GROUND_Y + TILE_SIZE / 2,
        'ground'
      );
      tile.setDisplaySize(TILE_SIZE, TILE_SIZE);
      tile.refreshBody();
    }
  }

  createPlatforms() {
    this.platformGroup = this.physics.add.staticGroup();
    PLATFORMS.forEach(({ x, y, w }) => {
      for (let i = 0; i < w; i++) {
        const tile = this.platformGroup.create(
          x + i * TILE_SIZE + TILE_SIZE / 2,
          y,
          'platform'
        );
        tile.setDisplaySize(TILE_SIZE, 16);
        tile.refreshBody();
      }
    });
  }

  createWaterPools() {
    const group = this.physics.add.staticGroup();
    WATER_POOLS.forEach((pool) => {
      for (let i = 0; i < pool.w; i++) {
        const tile = group.create(
          pool.x + i * TILE_SIZE + TILE_SIZE / 2,
          pool.y,
          'water'
        );
        tile.setDisplaySize(TILE_SIZE, 32);
        tile.refreshBody();
        tile.poolId = `${pool.x}_${pool.y}`;
        tile.isFrozen = false;
      }
    });

    // Animate water tiles
    this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        group.getChildren().forEach((t) => {
          if (!t.isFrozen) {
            t.setAlpha(t.alpha === 1 ? 0.8 : 1);
          }
        });
      },
    });

    return group;
  }

  createFireHazards() {
    this.fireGroup = this.physics.add.staticGroup();
    FIRE_HAZARDS.forEach(({ x, y, count }) => {
      for (let i = 0; i < count; i++) {
        const tile = this.fireGroup.create(
          x + i * 32 + 16,
          y,
          'fire'
        );
        tile.setDisplaySize(32, 48);
        tile.refreshBody();
      }
    });

    // Flicker animation
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        this.fireGroup.getChildren().forEach((f) => {
          f.setAlpha(Math.random() * 0.3 + 0.7);
          f.setScale(0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.3);
          f.refreshBody();
        });
      },
    });
  }

  createCrystals() {
    this.crystalGroup = this.physics.add.staticGroup();
    CRYSTAL_POSITIONS.forEach(({ x, y }) => {
      const crystal = this.crystalGroup.create(x, y, 'crystal', 0);
      crystal.setDisplaySize(24, 24);
      crystal.refreshBody();
    });

    // Spin animation using registered frame names
    let spinFrame = 0;
    this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        spinFrame = (spinFrame + 1) % 4;
        this.crystalGroup.getChildren().forEach((c) => {
          c.setFrame(`f${spinFrame}`);
        });
      },
    });
  }

  createPortal() {
    this.portal = this.physics.add.staticGroup();
    const p = this.portal.create(LEVEL_WIDTH - 80, GROUND_Y - 48, 'portal', 'frame0');
    p.setDisplaySize(64, 96);
    p.refreshBody();

    // Portal pulse animation using registered frame names
    let pFrame = false;
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        pFrame = !pFrame;
        this.portal.getChildren().forEach((tile) => {
          tile.setFrame(pFrame ? 'frame1' : 'frame0');
        });
        this.tweens.add({
          targets: this.portal.getChildren(),
          scaleX: pFrame ? 1.05 : 1,
          scaleY: pFrame ? 1.05 : 1,
          duration: 200,
          ease: 'Sine.easeOut',
        });
      },
    });
  }

  createPlayer() {
    const player = this.physics.add.sprite(100, GROUND_Y - 64, this.selectedCharacter, 'idle');
    player.setScale(2);
    player.setCollideWorldBounds(true);
    // Additional gravity on top of world gravity (so net = GRAVITY)
    player.body.setGravityY(GRAVITY - this.physics.world.gravity.y);
    player.body.setSize(24, 50);
    player.body.setOffset(12, 14);
    return player;
  }

  createEnemies() {
    const group = this.physics.add.group();
    ENEMY_POSITIONS.forEach(({ x, patrol }) => {
      const enemy = group.create(x, GROUND_Y - 32, 'enemy_crab', 'walk0');
      enemy.setDisplaySize(48, 32);
      enemy.setCollideWorldBounds(true);
      enemy.patrolOrigin = x;
      enemy.patrolRange = patrol;
      enemy.patrolDir = 1;
      enemy.isFrozen = false;
      enemy.body.setSize(38, 24);
      enemy.body.setOffset(5, 4);
    });
    return group;
  }

  // ── Game Logic ───────────────────────────────────────────────

  collectCrystal(player, crystal) {
    this.sparkleParticles.setPosition(crystal.x, crystal.y);
    this.sparkleParticles.explode(8);
    crystal.destroy();
    this.crystals++;

    // Update HUD
    this.hud.updateCrystals(this.crystals);

    // Score popup
    this.showPopup(crystal.x, crystal.y - 20, '+10', '#e040fb');
  }

  hitFire(player, _fire) {
    if (!this.isHurt) {
      this.takeDamage(player);
    }
  }

  hitEnemy(player, enemy) {
    if (enemy.isFrozen) {
      // Can jump on frozen enemies to defeat them
      if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
        this.defeatEnemy(enemy, player);
      }
      return;
    }
    if (!this.isHurt) {
      this.takeDamage(player);
    }
  }

  reachPortal(_player, _portal) {
    if (!this.levelComplete) {
      this.completelevel();
    }
  }

  takeDamage(player) {
    if (this.isDead) return;
    this.isHurt = true;
    this.lives--;
    this.hud.updateLives(this.lives);

    // Hurt animation + flash
    player.setFrame('hurt');
    this.cameras.main.shake(200, 0.008);

    // Flash player
    this.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        player.setAlpha(1);
        this.isHurt = false;
        if (this.lives <= 0) {
          this.triggerDeath();
        }
      },
    });

    // Knockback
    const dir = player.flipX ? 1 : -1;
    player.setVelocity(dir * 200, -200);
  }

  defeatEnemy(enemy, player) {
    this.sparkleParticles.setPosition(enemy.x, enemy.y);
    this.sparkleParticles.explode(12);
    enemy.destroy();
    // Bounce player up
    player.setVelocityY(-300);
    this.showPopup(enemy.x, enemy.y - 30, 'DEFEATED!', '#69f0ae');
  }

  triggerDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.player.setFrame('hurt');
    this.player.setVelocity(0, -400);

    this.cameras.main.shake(400, 0.015);

    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.stop('HUDScene');
        this.scene.stop('TouchControlsScene');
        this.scene.start('GameOverScene', { character: this.selectedCharacter });
      });
    });
  }

  completelevel() {
    this.levelComplete = true;
    const elapsed = (this.time.now - this.startTime) / 1000;

    // Stop player movement
    this.player.setVelocity(0, 0);
    this.player.body.allowGravity = false;
    this.player.setFrame('power');

    // Celebration particles
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(i * 60, () => {
        this.sparkleParticles.setPosition(
          this.player.x + (Math.random() - 0.5) * 100,
          this.player.y - Math.random() * 80
        );
        this.sparkleParticles.explode(5);
      });
    }

    this.cameras.main.fadeOut(800, 255, 255, 255);
    this.time.delayedCall(1200, () => {
      this.scene.stop('HUDScene');
      this.scene.stop('TouchControlsScene');
      this.scene.start('LevelCompleteScene', {
        character: this.selectedCharacter,
        crystals: this.crystals,
        total: this.totalCrystals,
        time: elapsed,
      });
    });
  }

  useIcePower() {
    if (this.iceCooldown || this.icePower < 20 || this.isDead) return;

    this.icePower = Math.max(0, this.icePower - 30);
    this.iceCooldown = true;

    // Ice power visual
    this.player.setFrame('power');
    this.cameras.main.flash(200, 0, 180, 255, false);

    // Emit ice particles
    this.iceParticles.setPosition(this.player.x, this.player.y);
    this.iceParticles.explode(20);

    // Freeze water tiles in range
    const range = 200;
    this.waterTiles.getChildren().forEach((tile) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tile.x, tile.y);
      if (dist < range && !tile.isFrozen) {
        this.freezeWaterTile(tile);
      }
    });

    // Freeze nearby enemies
    this.enemies.getChildren().forEach((enemy) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < range && !enemy.isFrozen) {
        this.freezeEnemy(enemy);
      }
    });

    // Cooldown: 4 seconds
    this.time.delayedCall(4000, () => {
      this.iceCooldown = false;
    });

    // Recharge ice power over time
    this.hud.updateIcePower(this.icePower);
  }

  freezeWaterTile(tile) {
    tile.isFrozen = true;
    tile.setTexture('ice');
    tile.setDisplaySize(TILE_SIZE, 32);
    tile.refreshBody();

    // Add to static physics group so player can walk on it
    this.iceTiles.add(tile);

    // Show freeze effect
    this.iceParticles.setPosition(tile.x, tile.y);
    this.iceParticles.explode(6);

    // Unfreeze after 5 seconds
    this.time.delayedCall(5000, () => {
      if (tile && tile.active) {
        tile.isFrozen = false;
        tile.setTexture('water');
        this.iceTiles.remove(tile, false, false);
        tile.refreshBody();
      }
    });
  }

  freezeEnemy(enemy) {
    enemy.isFrozen = true;
    enemy.setVelocity(0, 0);
    enemy.body.allowGravity = false;
    enemy.setTexture('enemy_frozen');
    enemy.setTint(0x80d8ff);

    // Show ice shard around enemy
    this.iceParticles.setPosition(enemy.x, enemy.y);
    this.iceParticles.explode(10);

    // Unfreeze after 3 seconds
    this.time.delayedCall(3000, () => {
      if (enemy && enemy.active) {
        enemy.isFrozen = false;
        enemy.body.allowGravity = true;
        enemy.setTexture('enemy_crab');
        enemy.clearTint();
      }
    });
  }

  showPopup(x, y, text, color) {
    const cam = this.cameras.main;
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color,
      stroke: '#1a0a3e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => popup.destroy(),
    });
  }

  // ── Update ───────────────────────────────────────────────────

  update(time, delta) {
    if (this.isDead || this.levelComplete) return;

    const player = this.player;
    const onGround = player.body.blocked.down;

    // ── Movement ──
    const goLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.touchInput.left;
    const goRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchInput.right;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.wasd.up)
      || this.touchInput.jump;
    const icePressed = Phaser.Input.Keyboard.JustDown(this.wasd.ice)
      || Phaser.Input.Keyboard.JustDown(this.wasd.ice2)
      || this.touchInput.ice;

    // Reset jump on next frame if touch
    if (this.touchInput.jump) this.touchInput.jump = false;
    if (this.touchInput.ice) this.touchInput.ice = false;

    const speed = 220;

    if (goLeft) {
      player.setVelocityX(-speed);
      player.setFlipX(true);
    } else if (goRight) {
      player.setVelocityX(speed);
      player.setFlipX(false);
    } else {
      player.setVelocityX(player.body.velocity.x * 0.8); // friction
    }

    // Jump / glide
    if (jumpPressed && onGround) {
      player.setVelocityY(-520);
    }

    // Glide: hold jump in air for slower fall (mermaid float)
    const holdJump = this.cursors.up.isDown || this.wasd.up.isDown;
    if (!onGround && holdJump && player.body.velocity.y > 50) {
      player.body.setGravityY(GRAVITY * 0.3 - this.physics.world.gravity.y);
    } else {
      player.body.setGravityY(GRAVITY - this.physics.world.gravity.y);
    }

    // Ice power
    if (icePressed) {
      this.useIcePower();
    }

    // ── Animation ──
    if (!this.isHurt) {
      if (!onGround) {
        player.setFrame('jump');
      } else if (Math.abs(player.body.velocity.x) > 10) {
        this.walkTimer += delta;
        if (this.walkTimer > 180) {
          this.walkTimer = 0;
          this.walkFrame = !this.walkFrame;
          player.setFrame(this.walkFrame ? 'walk1' : 'walk2');
        }
      } else {
        player.setFrame('idle');
      }
    }

    // ── Enemy AI ──
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.isFrozen) return;

      const distFromOrigin = enemy.x - enemy.patrolOrigin;
      if (distFromOrigin > enemy.patrolRange) {
        enemy.patrolDir = -1;
      } else if (distFromOrigin < -enemy.patrolRange) {
        enemy.patrolDir = 1;
      }

      enemy.setVelocityX(enemy.patrolDir * 80);
      enemy.setFlipX(enemy.patrolDir < 0);

      // Walk animation using named frames
      const walkFrame = Math.floor(time / 300) % 2;
      enemy.setFrame(walkFrame === 0 ? 'walk0' : 'walk1');
    });

    // ── Ice power recharge ──
    if (!this.iceCooldown && this.icePower < 100) {
      this.icePower = Math.min(100, this.icePower + delta * 0.012);
      this.hud.updateIcePower(this.icePower);
    }

    // ── Background parallax ──
    if (this.bgLayers) {
      this.bgLayers.bg.setTilePosition(this.cameras.main.scrollX * 0.2, 0);
      this.bgLayers.mid.setTilePosition(this.cameras.main.scrollX * 0.5, 0);
    }

    // ── Death pit ──
    if (player.y > 700) {
      this.takeDamage(player);
      player.setPosition(100, GROUND_Y - 80);
    }
  }
}
