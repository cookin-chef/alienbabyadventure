#!/usr/bin/env node
/**
 * Generates minimal SVG icons for PWA since we can't use node-canvas
 * These get converted to PNG via the browser at runtime if needed,
 * or we use SVG directly.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconDir = join(__dirname, '../public/icons');

mkdirSync(iconDir, { recursive: true });

function makeSVG(size) {
  const s = size;
  const r = Math.round(s * 0.2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3a1a7e"/>
      <stop offset="100%" stop-color="#1a0a3e"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Stars -->
  <circle cx="${s*0.15}" cy="${s*0.2}" r="${s*0.015}" fill="white" opacity="0.8"/>
  <circle cx="${s*0.8}" cy="${s*0.15}" r="${s*0.012}" fill="white" opacity="0.7"/>
  <circle cx="${s*0.9}" cy="${s*0.7}" r="${s*0.01}" fill="white" opacity="0.6"/>
  <circle cx="${s*0.1}" cy="${s*0.75}" r="${s*0.013}" fill="white" opacity="0.7"/>
  <circle cx="${s*0.5}" cy="${s*0.08}" r="${s*0.015}" fill="white" opacity="0.8"/>
  <circle cx="${s*0.7}" cy="${s*0.9}" r="${s*0.01}" fill="white" opacity="0.5"/>

  <!-- Mermaid tail -->
  <ellipse cx="${s*0.5}" cy="${s*0.72}" rx="${s*0.14}" ry="${s*0.17}" fill="#00e5ff"/>
  <polygon points="${s*0.36},${s*0.84} ${s*0.5},${s*0.93} ${s*0.64},${s*0.84}" fill="#00acc1"/>

  <!-- Dress -->
  <ellipse cx="${s*0.5}" cy="${s*0.57}" rx="${s*0.18}" ry="${s*0.14}" fill="#388e3c"/>

  <!-- Body -->
  <ellipse cx="${s*0.5}" cy="${s*0.44}" rx="${s*0.14}" ry="${s*0.13}" fill="#66bb6a"/>

  <!-- Head -->
  <ellipse cx="${s*0.5}" cy="${s*0.3}" rx="${s*0.16}" ry="${s*0.16}" fill="#a5d6a7"/>

  <!-- Wig -->
  <ellipse cx="${s*0.5}" cy="${s*0.2}" rx="${s*0.17}" ry="${s*0.1}" fill="#d32f2f"/>
  <ellipse cx="${s*0.36}" cy="${s*0.16}" rx="${s*0.06}" ry="${s*0.1}" fill="#c62828"/>
  <ellipse cx="${s*0.64}" cy="${s*0.16}" rx="${s*0.06}" ry="${s*0.1}" fill="#c62828"/>

  <!-- Eyes -->
  <ellipse cx="${s*0.44}" cy="${s*0.29}" rx="${s*0.055}" ry="${s*0.062}" fill="white"/>
  <ellipse cx="${s*0.56}" cy="${s*0.29}" rx="${s*0.055}" ry="${s*0.062}" fill="white"/>
  <circle cx="${s*0.44}" cy="${s*0.3}" r="${s*0.035}" fill="#1a1a2e"/>
  <circle cx="${s*0.56}" cy="${s*0.3}" r="${s*0.035}" fill="#1a1a2e"/>
  <circle cx="${s*0.455}" cy="${s*0.285}" r="${s*0.013}" fill="white"/>
  <circle cx="${s*0.575}" cy="${s*0.285}" r="${s*0.013}" fill="white"/>

  <!-- Antennae -->
  <line x1="${s*0.44}" y1="${s*0.16}" x2="${s*0.38}" y2="${s*0.07}" stroke="#81c784" stroke-width="${s*0.015}"/>
  <line x1="${s*0.56}" y1="${s*0.16}" x2="${s*0.62}" y2="${s*0.07}" stroke="#81c784" stroke-width="${s*0.015}"/>
  <circle cx="${s*0.38}" cy="${s*0.07}" r="${s*0.025}" fill="#ff80ab"/>
  <circle cx="${s*0.62}" cy="${s*0.07}" r="${s*0.025}" fill="#ff80ab"/>

  <!-- Ice sparkle -->
  <text x="${s*0.7}" y="${s*0.55}" font-size="${s*0.2}" text-anchor="middle" opacity="0.9">❄</text>
</svg>`;
}

// Write SVGs (can be used directly or converted)
writeFileSync(join(iconDir, 'icon-192.svg'), makeSVG(192));
writeFileSync(join(iconDir, 'icon-512.svg'), makeSVG(512));

// Write simple PNG-ish fallback using a data trick
// For Vercel deployments, we'll use SVG as the icon source
const manifest192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
${makeSVG(192).split('\n').slice(1, -1).join('\n')}
</svg>`;

console.log('Icons generated as SVG in public/icons/');
console.log('Note: For PNG icons, run: npm run generate-png-icons (requires node-canvas)');
