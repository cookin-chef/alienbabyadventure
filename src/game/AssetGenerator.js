/**
 * AssetGenerator - Creates all game textures programmatically using Phaser 3 Graphics.
 * No external image files required.
 *
 * Verified Phaser 3.60 Graphics API usage only:
 *   fillStyle, fillRect, fillRoundedRect, fillCircle, fillEllipse, fillTriangle, fillPoints
 *   lineStyle, strokeRect, strokeRoundedRect, strokeCircle, strokeEllipse, strokeTriangle, strokePoints
 *   lineBetween, clear, generateTexture, destroy, fillGradientStyle
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns an array of {x,y} points for a star polygon */
function starPoints(cx, cy, numPoints, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

function fillStar(g, cx, cy, numPoints, outerR, innerR) {
  g.fillPoints(starPoints(cx, cy, numPoints, outerR, innerR), true);
}

function strokeStar(g, cx, cy, numPoints, outerR, innerR) {
  g.strokePoints(starPoints(cx, cy, numPoints, outerR, innerR), true);
}

function line(g, x1, y1, x2, y2) {
  g.lineBetween(x1, y1, x2, y2);
}

// ── Entry Point ───────────────────────────────────────────────────────────────

export function generateAllAssets(scene) {
  generateCharacters(scene);
  generateTiles(scene);
  generateEnemies(scene);
  generateCollectibles(scene);
  generateHUD(scene);
  generateParticles(scene);
  generateBackgrounds(scene);
  generateUI(scene);
}

// ── CHARACTERS ────────────────────────────────────────────────────────────────

const CHAR_W = 48, CHAR_H = 64;
const CHAR_FRAMES = ['idle', 'walk1', 'walk2', 'jump', 'hurt', 'power'];

function generateCharacters(scene) {
  drawAlienBaby(scene, 'aanya', 0x388e3c, 0xd32f2f);
  drawAlienBaby(scene, 'meera', 0x1565c0, 0xe91e63);
}

function drawAlienBaby(scene, key, dressColor, wigColor) {
  const g = scene.add.graphics();

  CHAR_FRAMES.forEach((frame, idx) => {
    const ox = idx * CHAR_W;
    drawCharacterFrame(g, ox, 0, dressColor, wigColor, frame);
  });

  g.generateTexture(key, CHAR_W * CHAR_FRAMES.length, CHAR_H);
  g.destroy();

  // Register named frames for setFrame()
  const tex = scene.textures.get(key);
  CHAR_FRAMES.forEach((frame, idx) => {
    tex.add(frame, 0, idx * CHAR_W, 0, CHAR_W, CHAR_H);
  });
}

function drawCharacterFrame(g, ox, _oy, dressColor, wigColor, frame) {
  const cx = ox + CHAR_W / 2;
  const H = CHAR_H;

  const tailWave  = frame === 'walk1' ? -4 : frame === 'walk2' ? 4 : 0;
  const bodyBob   = frame === 'jump'  ? -5 : 0;
  const hx        = frame === 'hurt'  ?  3 : 0; // hurt horizontal shake

  // ── Tail ──
  g.fillStyle(0x00e5ff, 1);
  g.fillEllipse(cx + hx, H - 18 + tailWave, 24, 22);

  g.fillStyle(0x00acc1, 1);
  g.fillTriangle(
    cx - 14, H - 8 + tailWave,
    cx,      H + 2 + tailWave,
    cx + 14, H - 8 + tailWave
  );

  g.fillStyle(0x80deea, 0.5);
  g.fillEllipse(cx - 4, H - 22 + tailWave, 8, 6);
  g.fillEllipse(cx + 4, H - 18 + tailWave, 8, 6);

  // ── Dress ──
  g.fillStyle(dressColor, 1);
  g.fillEllipse(cx + hx, H - 30 + bodyBob, 34, 26);
  g.fillStyle(0xffffff, 0.12);
  g.fillEllipse(cx - 5 + hx, H - 34 + bodyBob, 12, 18);

  // ── Body ──
  g.fillStyle(0x81c784, 1);
  g.fillEllipse(cx + hx, H - 44 + bodyBob, 28, 24);

  // ── Head ──
  g.fillStyle(0xa5d6a7, 1);
  g.fillEllipse(cx + hx, H - 56 + bodyBob, 30, 28);

  // Blush
  g.fillStyle(0xff80ab, 0.4);
  g.fillCircle(cx - 10 + hx, H - 53 + bodyBob, 5);
  g.fillCircle(cx + 10 + hx, H - 53 + bodyBob, 5);

  // ── Antennae ──
  g.lineStyle(2, 0x81c784, 1);
  line(g, cx - 7 + hx, H - 65 + bodyBob, cx - 12 + hx, H - 73 + bodyBob);
  line(g, cx + 7 + hx, H - 65 + bodyBob, cx + 12 + hx, H - 73 + bodyBob);

  g.fillStyle(0xff80ab, 1);
  g.fillCircle(cx - 12 + hx, H - 73 + bodyBob, 3);
  g.fillCircle(cx + 12 + hx, H - 73 + bodyBob, 3);

  // ── Wig ──
  g.fillStyle(wigColor, 1);
  g.fillEllipse(cx + hx, H - 62 + bodyBob, 32, 18);
  for (let i = -1; i <= 1; i++) {
    g.fillEllipse(cx + i * 10 + hx, H - 68 + bodyBob, 10, 16);
  }

  // ── Eyes ──
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(cx - 7 + hx, H - 57 + bodyBob, 12, 13);
  g.fillEllipse(cx + 7 + hx, H - 57 + bodyBob, 12, 13);

  const eyeDrop = frame === 'hurt' ? 0 : 1;
  g.fillStyle(0x1a1a2e, 1);
  g.fillCircle(cx - 6 + hx, H - 57 + bodyBob + eyeDrop, 5);
  g.fillCircle(cx + 8 + hx, H - 57 + bodyBob + eyeDrop, 5);

  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 4 + hx, H - 59 + bodyBob, 2);
  g.fillCircle(cx + 10 + hx, H - 59 + bodyBob, 2);

  // ── Ice power effect ──
  if (frame === 'power') {
    g.fillStyle(0x80d8ff, 0.55);
    g.fillCircle(cx + 16, H - 34, 14);
    g.lineStyle(2, 0xe1f5fe, 0.85);
    line(g, cx + 10, H - 34, cx + 22, H - 34);
    line(g, cx + 16, H - 40, cx + 16, H - 28);
    line(g, cx + 11, H - 39, cx + 21, H - 29);
    line(g, cx + 21, H - 39, cx + 11, H - 29);
  }

  // ── Hurt X eyes ──
  if (frame === 'hurt') {
    g.lineStyle(2, 0xff1744, 1);
    line(g, cx - 10, H - 61, cx - 4, H - 55);
    line(g, cx - 4,  H - 61, cx - 10, H - 55);
    line(g, cx + 4,  H - 61, cx + 10, H - 55);
    line(g, cx + 10, H - 61, cx + 4,  H - 55);
  }
}

// ── TILES ────────────────────────────────────────────────────────────────────

function generateTiles(scene) {
  const g = scene.add.graphics();

  // Ground (64x32) — teal crystal
  g.fillStyle(0x006064, 1);
  g.fillRect(0, 0, 64, 32);
  g.fillStyle(0x00838f, 1);
  g.fillRect(0, 0, 64, 6);
  g.fillStyle(0x00acc1, 0.6);
  g.fillTriangle(8, 6, 14, 0, 20, 6);
  g.fillTriangle(30, 6, 38, 0, 46, 6);
  g.fillTriangle(50, 6, 56, 0, 62, 6);
  g.generateTexture('ground', 64, 32);
  g.clear();

  // Platform (64x16) — purple crystal
  g.fillStyle(0x4a148c, 1);
  g.fillRect(0, 0, 64, 16);
  g.fillStyle(0x7b1fa2, 1);
  g.fillRect(0, 0, 64, 5);
  g.fillStyle(0xce93d8, 0.4);
  g.fillTriangle(5, 5, 10, 0, 15, 5);
  g.fillTriangle(25, 5, 32, 0, 39, 5);
  g.fillTriangle(50, 5, 56, 0, 62, 5);
  g.generateTexture('platform', 64, 16);
  g.clear();

  // Water (64x32)
  g.fillStyle(0x1565c0, 0.85);
  g.fillRect(0, 0, 64, 32);
  g.fillStyle(0x42a5f5, 0.45);
  g.fillEllipse(16, 8, 24, 12);
  g.fillEllipse(48, 12, 20, 10);
  g.lineStyle(2, 0x90caf9, 0.6);
  g.strokeEllipse(16, 8, 24, 12);
  g.generateTexture('water', 64, 32);
  g.clear();

  // Ice (frozen water — 64x32)
  g.fillStyle(0x80deea, 0.9);
  g.fillRect(0, 0, 64, 32);
  g.fillStyle(0xe1f5fe, 0.7);
  g.fillRect(0, 0, 64, 5);
  g.lineStyle(1, 0xb3e5fc, 0.8);
  line(g, 8, 16, 20, 16); line(g, 14, 10, 14, 22);
  line(g, 10, 12, 18, 20); line(g, 18, 12, 10, 20);
  line(g, 44, 18, 56, 18); line(g, 50, 12, 50, 24);
  g.generateTexture('ice', 64, 32);
  g.clear();

  // Fire (32x48)
  g.fillStyle(0xff6f00, 1);
  g.fillTriangle(16, 48, 0, 20, 32, 20);
  g.fillStyle(0xff9800, 1);
  g.fillTriangle(16, 48, 4, 28, 28, 28);
  g.fillTriangle(16, 40, 2, 18, 30, 18);
  g.fillStyle(0xffeb3b, 1);
  g.fillTriangle(16, 48, 8, 30, 24, 30);
  g.fillTriangle(16, 42, 6, 20, 26, 20);
  g.fillStyle(0xffffff, 0.8);
  g.fillTriangle(16, 45, 11, 35, 21, 35);
  g.generateTexture('fire', 32, 48);
  g.clear();

  g.destroy();
}

// ── ENEMIES ──────────────────────────────────────────────────────────────────

function generateEnemies(scene) {
  const g = scene.add.graphics();

  drawCrab(g, 0, 0, false);
  drawCrab(g, 48, 0, true);
  g.generateTexture('enemy_crab', 96, 32);
  const crabTex = scene.textures.get('enemy_crab');
  crabTex.add('walk0', 0, 0,  0, 48, 32);
  crabTex.add('walk1', 0, 48, 0, 48, 32);
  g.clear();

  // Frozen crab
  drawCrab(g, 0, 0, false);
  g.fillStyle(0x80d8ff, 0.5);
  g.fillRect(0, 0, 48, 32);
  g.generateTexture('enemy_frozen', 48, 32);
  g.clear();

  g.destroy();
}

function drawCrab(g, ox, oy, legUp) {
  const cx = ox + 24;

  g.fillStyle(0xe91e63, 1);
  g.fillEllipse(cx, oy + 18, 38, 22);

  const eyeY = legUp ? oy + 5 : oy + 6;
  g.lineStyle(2, 0xc2185b, 1);
  line(g, cx - 8, oy + 10, cx - 10, eyeY);
  line(g, cx + 8, oy + 10, cx + 10, eyeY);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 10, eyeY, 5);
  g.fillCircle(cx + 10, eyeY, 5);
  g.fillStyle(0x212121, 1);
  g.fillCircle(cx - 9, eyeY, 3);
  g.fillCircle(cx + 11, eyeY, 3);

  g.fillStyle(0xad1457, 1);
  const lcy = legUp ? oy + 12 : oy + 15;
  g.fillEllipse(cx - 22, lcy, 16, 12);
  g.fillTriangle(cx - 22, lcy - 4, cx - 28, lcy - 9, cx - 16, lcy - 9);
  const rcy = legUp ? oy + 15 : oy + 12;
  g.fillEllipse(cx + 22, rcy, 16, 12);
  g.fillTriangle(cx + 22, rcy - 4, cx + 28, rcy - 9, cx + 16, rcy - 9);

  g.lineStyle(2, 0xc2185b, 1);
  const legOff = legUp ? -2 : 2;
  for (let i = 0; i < 3; i++) {
    const lx = cx - 8 - i * 6;
    line(g, lx, oy + 26, lx - 6, oy + 30 + legOff);
    const rx = cx + 8 + i * 6;
    line(g, rx, oy + 26, rx + 6, oy + 30 + legOff);
  }

  // Shell pattern — small star
  g.fillStyle(0xf48fb1, 0.5);
  fillStar(g, cx, oy + 18, 5, 8, 4);
}

// ── COLLECTIBLES ─────────────────────────────────────────────────────────────

function generateCollectibles(scene) {
  const g = scene.add.graphics();

  // Crystal (24x24) × 4 spin frames
  for (let f = 0; f < 4; f++) {
    const ox = f * 24;
    const sx = f === 1 || f === 3 ? 0.3 : 1;
    g.fillStyle(0xe040fb, 1);
    g.fillTriangle(ox + 12, 2, ox + 12 - 8 * sx, 12, ox + 12 + 8 * sx, 12);
    g.fillStyle(0xce93d8, 1);
    g.fillTriangle(ox + 12, 22, ox + 12 - 8 * sx, 12, ox + 12 + 8 * sx, 12);
    g.fillStyle(0xf3e5f5, 0.6);
    g.fillTriangle(ox + 12, 4, ox + 12 - 3 * sx, 12, ox + 12 + 3 * sx, 12);
  }
  g.generateTexture('crystal', 96, 24);
  // Register named frames
  const crystalTex = scene.textures.get('crystal');
  for (let f = 0; f < 4; f++) {
    crystalTex.add(`f${f}`, 0, f * 24, 0, 24, 24);
  }
  g.clear();

  // Star collectible (24x24)
  g.fillStyle(0xffeb3b, 1);
  fillStar(g, 12, 12, 5, 11, 5);
  g.fillStyle(0xfff176, 0.7);
  fillStar(g, 12, 12, 5, 6, 3);
  g.generateTexture('star_collect', 24, 24);
  g.clear();

  g.destroy();
}

// ── HUD ──────────────────────────────────────────────────────────────────────

function generateHUD(scene) {
  const g = scene.add.graphics();

  // Full heart (32x28)
  g.fillStyle(0xff1744, 1);
  g.fillCircle(10, 10, 9);
  g.fillCircle(22, 10, 9);
  g.fillTriangle(1, 14, 16, 28, 31, 14);
  g.fillStyle(0xff6b6b, 0.5);
  g.fillCircle(8, 7, 5);
  g.generateTexture('heart_full', 32, 28);
  g.clear();

  // Empty heart (32x28)
  g.lineStyle(2, 0xff1744, 0.5);
  g.strokeCircle(10, 10, 9);
  g.strokeCircle(22, 10, 9);
  g.strokeTriangle(1, 14, 16, 28, 31, 14);
  g.generateTexture('heart_empty', 32, 28);
  g.clear();

  // Ice bar bg (160x16)
  g.fillStyle(0x1a0a3e, 0.7);
  g.fillRoundedRect(0, 0, 160, 16, 8);
  g.lineStyle(2, 0x80d8ff, 0.8);
  g.strokeRoundedRect(0, 0, 160, 16, 8);
  g.generateTexture('icebar_bg', 160, 16);
  g.clear();

  // Ice bar fill (160x16) — gradient
  g.fillGradientStyle(0x80d8ff, 0xe1f5fe, 0x00b0ff, 0x40c4ff, 1);
  g.fillRoundedRect(0, 0, 160, 16, 8);
  g.generateTexture('icebar_fill', 160, 16);
  g.clear();

  // Crystal icon (20x20)
  g.fillStyle(0xe040fb, 1);
  g.fillTriangle(10, 1, 2, 10, 18, 10);
  g.fillStyle(0xce93d8, 1);
  g.fillTriangle(10, 19, 2, 10, 18, 10);
  g.fillStyle(0xf3e5f5, 0.6);
  g.fillTriangle(10, 3, 5, 10, 15, 10);
  g.generateTexture('crystal_icon', 20, 20);
  g.clear();

  // Star full (40x40)
  g.fillStyle(0xffeb3b, 1);
  fillStar(g, 20, 20, 5, 19, 8);
  g.fillStyle(0xfff176, 0.6);
  fillStar(g, 20, 20, 5, 10, 5);
  g.generateTexture('star_full', 40, 40);
  g.clear();

  // Star empty (40x40)
  g.fillStyle(0x444466, 1);
  fillStar(g, 20, 20, 5, 19, 8);
  g.lineStyle(2, 0x666688, 1);
  strokeStar(g, 20, 20, 5, 19, 8);
  g.generateTexture('star_empty', 40, 40);
  g.clear();

  g.destroy();
}

// ── PARTICLES ────────────────────────────────────────────────────────────────

function generateParticles(scene) {
  const g = scene.add.graphics();

  // Ice particle (8x8)
  g.fillStyle(0x80d8ff, 1);
  fillStar(g, 4, 4, 4, 4, 2);
  g.generateTexture('ice_particle', 8, 8);
  g.clear();

  // Sparkle (6x6)
  g.fillStyle(0xffeb3b, 1);
  fillStar(g, 3, 3, 4, 3, 1);
  g.generateTexture('sparkle', 6, 6);
  g.clear();

  // Bubble (8x8)
  g.lineStyle(1.5, 0x80d8ff, 0.8);
  g.strokeCircle(4, 4, 3);
  g.fillStyle(0xe1f5fe, 0.3);
  g.fillCircle(4, 4, 3);
  g.generateTexture('bubble', 8, 8);
  g.clear();

  g.destroy();
}

// ── BACKGROUNDS ──────────────────────────────────────────────────────────────

function generateBackgrounds(scene) {
  const g = scene.add.graphics();
  const W = 800, H = 600;

  // Sky
  g.fillGradientStyle(0x1a0a3e, 0x1a0a3e, 0x0d47a1, 0x0d47a1, 1);
  g.fillRect(0, 0, W, H);

  // Stars
  const starPos = [
    [50,40],[120,80],[200,30],[280,70],[370,20],[450,55],[540,35],
    [610,75],[700,25],[760,60],[100,120],[300,100],[500,110],[650,90],
    [180,160],[420,140],[580,150],[730,130],
  ];
  starPos.forEach(([x, y]) => {
    g.fillStyle(0xffffff, 0.5 + Math.random() * 0.4);
    g.fillCircle(x, y, 1 + Math.random() * 1.5);
  });

  // Castle silhouette
  g.fillStyle(0x1a237e, 0.65);
  g.fillRect(80, 250, 40, 150); g.fillRect(180, 220, 50, 180); g.fillRect(280, 260, 35, 140);
  g.fillRect(120, 300, 60, 100); g.fillRect(230, 300, 50, 100);
  for (let i = 0; i < 4; i++) {
    g.fillRect(82 + i*10, 244, 7, 10);
    g.fillRect(182 + i*12, 213, 8, 10);
  }
  g.fillStyle(0xffe082, 0.6);
  g.fillRect(93, 270, 14, 18); g.fillRect(193, 250, 16, 20); g.fillRect(291, 280, 13, 16);

  // Ferris wheel silhouette
  g.lineStyle(2, 0x283593, 0.75);
  g.strokeCircle(620, 220, 80);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(g, 620, 220, 620 + Math.cos(a)*80, 220 + Math.sin(a)*80);
    g.fillStyle(0x1976d2, 0.55);
    g.fillRect(620 + Math.cos(a)*75 - 8, 220 + Math.sin(a)*75 - 6, 16, 12);
  }
  g.lineStyle(3, 0x283593, 0.75);
  line(g, 620, 300, 580, 380); line(g, 620, 300, 660, 380);

  // Ground fade
  g.fillGradientStyle(0x003333, 0x003333, 0x004d40, 0x004d40, 1);
  g.fillRect(0, 450, W, 150);

  g.generateTexture('background', W, H);
  g.clear();

  // Midground (decorative)
  g.fillStyle(0x00695c, 0.6);
  g.fillCircle(150, 400, 35); g.fillRect(145, 430, 10, 40);
  g.fillCircle(400, 390, 28); g.fillRect(396, 415, 8, 35);
  g.fillCircle(650, 405, 32); g.fillRect(645, 432, 10, 38);

  g.fillStyle(0x880e4f, 0.5);
  g.fillRect(280, 360, 80, 10); g.fillRect(315, 310, 10, 50);
  g.fillTriangle(280, 360, 360, 360, 320, 310);

  g.generateTexture('midground', W, H);
  g.clear();

  g.destroy();
}

// ── UI ───────────────────────────────────────────────────────────────────────

function generateUI(scene) {
  const g = scene.add.graphics();

  // Button purple (200x60)
  g.fillStyle(0x7b1fa2, 1);
  g.fillRoundedRect(0, 0, 200, 60, 16);
  g.fillStyle(0x9c27b0, 1);
  g.fillRoundedRect(3, 3, 194, 30, 12);
  g.lineStyle(3, 0xce93d8, 1);
  g.strokeRoundedRect(0, 0, 200, 60, 16);
  g.generateTexture('btn_purple', 200, 60);
  g.clear();

  // Button purple hover (200x60)
  g.fillStyle(0xab47bc, 1);
  g.fillRoundedRect(0, 0, 200, 60, 16);
  g.fillStyle(0xba68c8, 1);
  g.fillRoundedRect(3, 3, 194, 30, 12);
  g.lineStyle(3, 0xf3e5f5, 1);
  g.strokeRoundedRect(0, 0, 200, 60, 16);
  g.generateTexture('btn_purple_hover', 200, 60);
  g.clear();

  // Character card (220x300)
  g.fillStyle(0x1a0a4e, 0.9);
  g.fillRoundedRect(0, 0, 220, 300, 20);
  g.lineStyle(3, 0x7c4dff, 1);
  g.strokeRoundedRect(0, 0, 220, 300, 20);
  g.generateTexture('char_card', 220, 300);
  g.clear();

  // Character card selected (220x300)
  g.fillStyle(0x2a1a6e, 0.95);
  g.fillRoundedRect(0, 0, 220, 300, 20);
  g.lineStyle(4, 0xe040fb, 1);
  g.strokeRoundedRect(0, 0, 220, 300, 20);
  g.generateTexture('char_card_selected', 220, 300);
  g.clear();

  // Portal (128x96 — 2 frames side by side)
  drawPortal(g, 0, 0, false);
  drawPortal(g, 64, 0, true);
  g.generateTexture('portal', 128, 96);
  const portalTex = scene.textures.get('portal');
  portalTex.add('frame0', 0, 0,  0, 64, 96);
  portalTex.add('frame1', 0, 64, 0, 64, 96);
  g.clear();

  // Panel overlay (400x300)
  g.fillStyle(0x0d0021, 0.92);
  g.fillRoundedRect(0, 0, 400, 300, 24);
  g.lineStyle(3, 0x7c4dff, 1);
  g.strokeRoundedRect(0, 0, 400, 300, 24);
  g.generateTexture('panel', 400, 300);
  g.clear();

  // D-pad button (80x80)
  g.fillStyle(0xffffff, 0.2);
  g.fillCircle(40, 40, 38);
  g.lineStyle(2, 0xffffff, 0.4);
  g.strokeCircle(40, 40, 38);
  g.generateTexture('dpad_btn', 80, 80);
  g.clear();

  // Action button — purple (80x80)
  g.fillStyle(0xe040fb, 0.3);
  g.fillCircle(40, 40, 38);
  g.lineStyle(2, 0xe040fb, 0.6);
  g.strokeCircle(40, 40, 38);
  g.generateTexture('action_btn', 80, 80);
  g.clear();

  // Jump button — cyan (80x80)
  g.fillStyle(0x00e5ff, 0.3);
  g.fillCircle(40, 40, 38);
  g.lineStyle(2, 0x00e5ff, 0.6);
  g.strokeCircle(40, 40, 38);
  g.generateTexture('jump_btn', 80, 80);
  g.clear();

  // Title background (600x120)
  g.fillGradientStyle(0x4a148c, 0x4a148c, 0x0d47a1, 0x0d47a1, 1);
  g.fillRoundedRect(0, 0, 600, 120, 30);
  g.lineStyle(4, 0xe040fb, 1);
  g.strokeRoundedRect(0, 0, 600, 120, 30);
  g.generateTexture('title_bg', 600, 120);
  g.clear();

  g.destroy();
}

function drawPortal(g, ox, oy, pulse) {
  const cx = ox + 32, cy = oy + 48;
  const p = pulse ? 3 : 0;

  g.lineStyle(6, 0x7c4dff, 1);
  g.strokeEllipse(cx, cy, 50 + p, 80 + p);
  g.lineStyle(4, 0xe040fb, 0.8);
  g.strokeEllipse(cx, cy, 38 + p, 64 + p);
  g.fillStyle(0x7c4dff, 0.3);
  g.fillEllipse(cx, cy, 30, 52);
  g.fillStyle(0xe040fb, 0.2);
  g.fillEllipse(cx, cy, 18, 34);

  g.fillStyle(0xffffff, 0.8);
  [[cx, oy+4],[cx+28, oy+16],[cx-28, oy+16],[cx+30, oy+80],[cx-30, oy+80]].forEach(([sx,sy]) => {
    fillStar(g, sx, sy, 4, pulse ? 5 : 4, 2);
  });
}
