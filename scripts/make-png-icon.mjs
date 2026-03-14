#!/usr/bin/env node
/**
 * Generates PWA PNG icons using pure Node.js (no dependencies).
 */
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  return Buffer.from([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]);
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  return Buffer.concat([u32be(data.length), t, data, u32be(crc32(Buffer.concat([t,data])))]);
}

function makeIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const S = size / 192;

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    const af = a / 255;
    pixels[i]   = Math.min(255, Math.round(pixels[i]   * (1-af) + r * af));
    pixels[i+1] = Math.min(255, Math.round(pixels[i+1] * (1-af) + g * af));
    pixels[i+2] = Math.min(255, Math.round(pixels[i+2] * (1-af) + b * af));
    pixels[i+3] = Math.min(255, pixels[i+3] + a);
  }

  function fillEllipse(cx, cy, rx, ry, r, g, b, a = 255) {
    const x0=Math.max(0,Math.floor(cx-rx)), x1=Math.min(size-1,Math.ceil(cx+rx));
    const y0=Math.max(0,Math.floor(cy-ry)), y1=Math.min(size-1,Math.ceil(cy+ry));
    for (let y=y0; y<=y1; y++) for (let x=x0; x<=x1; x++) {
      const dx=(x-cx)/rx, dy=(y-cy)/ry;
      if (dx*dx+dy*dy<=1) setPixel(x,y,r,g,b,a);
    }
  }

  function fillTri(x1,y1,x2,y2,x3,y3,r,g,b,a=255) {
    const miny=Math.max(0,Math.min(y1,y2,y3)|0);
    const maxy=Math.min(size-1,Math.ceil(Math.max(y1,y2,y3)));
    for (let y=miny; y<=maxy; y++) {
      const xs=[];
      [[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]].forEach(([ax,ay,bx,by])=>{
        if ((ay<=y&&by>y)||(by<=y&&ay>y)) xs.push(ax+(y-ay)/(by-ay)*(bx-ax));
      });
      if (xs.length>=2) for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++) setPixel(x,y,r,g,b,a);
    }
  }

  // Background radial gradient
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const d=Math.sqrt((x-size/2)**2+(y-size/2)**2)/(size*0.71);
    const f=Math.max(0,1-d*0.45);
    setPixel(x,y, Math.round(58*f+10), Math.round(26*f+5), Math.round(126*f+20), 255);
  }

  // Clip rounded corners
  const cr=size*0.18;
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    let clip=false;
    if (x<cr&&y<cr&&Math.sqrt((x-cr)**2+(y-cr)**2)>cr) clip=true;
    else if (x>size-cr&&y<cr&&Math.sqrt((x-(size-cr))**2+(y-cr)**2)>cr) clip=true;
    else if (x<cr&&y>size-cr&&Math.sqrt((x-cr)**2+(y-(size-cr))**2)>cr) clip=true;
    else if (x>size-cr&&y>size-cr&&Math.sqrt((x-(size-cr))**2+(y-(size-cr))**2)>cr) clip=true;
    if (clip) pixels[(y*size+x)*4+3]=0;
  }

  // Stars
  [[0.15,0.18],[0.82,0.14],[0.88,0.70],[0.12,0.78],[0.5,0.09]].forEach(([px,py])=>{
    fillEllipse(px*size,py*size,S*2.5,S*2.5,255,255,255,200);
  });

  // Mermaid tail
  fillEllipse(size*.5,size*.73,S*27,S*33,0,229,255);
  fillTri(size*.36,size*.85,size*.5,size*.93,size*.64,size*.85,0,172,193);
  // Scale shimmer
  fillEllipse(size*.46,size*.69,S*8,S*6,128,237,255,150);

  // Dress
  fillEllipse(size*.5,size*.57,S*35,S*27,56,142,60);
  // Dress shimmer
  fillEllipse(size*.42,size*.53,S*10,S*16,255,255,255,40);

  // Body
  fillEllipse(size*.5,size*.44,S*27,S*25,102,187,106);

  // Head
  fillEllipse(size*.5,size*.30,S*31,S*31,165,214,167);

  // Cheek blush
  fillEllipse(size*.39,size*.33,S*8,S*6,255,128,171,100);
  fillEllipse(size*.61,size*.33,S*8,S*6,255,128,171,100);

  // Eye whites
  fillEllipse(size*.44,size*.29,S*10,S*11,255,255,255);
  fillEllipse(size*.56,size*.29,S*10,S*11,255,255,255);

  // Pupils
  fillEllipse(size*.44,size*.30,S*7,S*7,26,26,46);
  fillEllipse(size*.56,size*.30,S*7,S*7,26,26,46);

  // Eye shine
  fillEllipse(size*.455,size*.285,S*2.5,S*2.5,255,255,255);
  fillEllipse(size*.575,size*.285,S*2.5,S*2.5,255,255,255);

  // Wig (red/crimson)
  fillEllipse(size*.5,size*.21,S*33,S*19,211,47,47);
  fillEllipse(size*.36,size*.16,S*11,S*19,198,40,40);
  fillEllipse(size*.64,size*.16,S*11,S*19,198,40,40);
  fillEllipse(size*.5,size*.12,S*10,S*15,183,28,28);

  // Antenna tips
  fillEllipse(size*.38,size*.07,S*5,S*5,255,128,171);
  fillEllipse(size*.62,size*.07,S*5,S*5,255,128,171);
  // Antenna lines
  for (let t2=0;t2<=20;t2++) {
    const t=t2/20;
    setPixel(Math.round(size*.44+t*(size*.38-size*.44)),Math.round(size*.16+t*(size*.07-size*.16)),129,199,132,255);
    setPixel(Math.round(size*.56+t*(size*.62-size*.56)),Math.round(size*.16+t*(size*.07-size*.16)),129,199,132,255);
  }

  // Ice snowflake
  const sfx=size*.73, sfy=size*.52;
  for (let a=0;a<6;a++) {
    const rad=a*Math.PI/3;
    for (let r=0;r<=S*13;r+=0.5) {
      setPixel(Math.round(sfx+r*Math.cos(rad)),Math.round(sfy+r*Math.sin(rad)),128,216,255,220);
    }
  }
  fillEllipse(sfx,sfy,S*4,S*4,225,245,254,220);

  // Build PNG binary
  const raw=Buffer.alloc(size*(size*4+1));
  for (let y=0;y<size;y++) {
    raw[y*(size*4+1)]=0;
    for (let x=0;x<size;x++) {
      const s=(y*size+x)*4;
      const d=y*(size*4+1)+1+x*4;
      raw[d]=pixels[s]; raw[d+1]=pixels[s+1]; raw[d+2]=pixels[s+2]; raw[d+3]=pixels[s+3];
    }
  }
  const compressed=deflateSync(raw,{level:6});
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR',Buffer.concat([u32be(size),u32be(size),Buffer.from([8,6,0,0,0])])),
    pngChunk('IDAT',compressed),
    pngChunk('IEND',Buffer.alloc(0)),
  ]);
}

const iconDir=join(__dirname,'../public/icons');
mkdirSync(iconDir,{recursive:true});

for (const size of [192,512]) {
  const png=makeIcon(size);
  writeFileSync(join(iconDir,`icon-${size}.png`),png);
  console.log(`Generated icon-${size}.png (${(png.length/1024).toFixed(1)}KB)`);
}
