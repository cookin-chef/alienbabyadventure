import * as BABYLON from '@babylonjs/core'

/**
 * Super chibi baby alien princess.
 * Proportions: head ~60% of total height (very baby).
 * Style: soft mint green skin, anime eyes, puffy dress, tiara, mermaid tail.
 */

const SKIN  = '#B2DFDB'  // soft mint green (pastel)
const SKIN_DARK = '#80CBC4'

const CONFIGS = {
  aanya: {
    dress:   '#388E3C',   // forest green
    dressDark: '#1B5E20',
    wig:     '#E53935',   // red
    wigDark: '#B71C1C',
    gem:     '#69F0AE',   // green gem on tiara
    irisColor: '#7C4DFF',
    name: 'Aanya',
  },
  meera: {
    dress:   '#1565C0',   // royal blue
    dressDark: '#0D47A1',
    wig:     '#E91E63',   // hot pink
    wigDark: '#880E4F',
    gem:     '#40C4FF',   // blue gem on tiara
    irisColor: '#E040FB',
    name: 'Meera',
  },
}

// ── Material helper ────────────────────────────────────────────────────────

function m(name, hex, scene, emissive = 0.18, alpha = 1) {
  const mat = new BABYLON.StandardMaterial(name, scene)
  mat.diffuseColor  = BABYLON.Color3.FromHexString(hex)
  mat.emissiveColor = mat.diffuseColor.scale(emissive)
  mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05)
  if (alpha < 1) mat.alpha = alpha
  return mat
}

function ol(mesh, w = 0.04) {
  mesh.renderOutline  = true
  mesh.outlineColor   = new BABYLON.Color3(0.04, 0.02, 0.08)
  mesh.outlineWidth   = w
}

function attach(mesh, parent) {
  mesh.parent = parent
  return mesh
}

// ── Main builder ───────────────────────────────────────────────────────────

export function buildCharacter(characterKey, scene) {
  const cfg  = CONFIGS[characterKey] || CONFIGS.aanya
  const root = new BABYLON.TransformNode('char_root', scene)

  // Total visual height ≈ 2.6 units
  // Head height: ~1.55 units (60% of 2.6)
  // Body: ~1.05 units

  // ─── TAIL (bottom, peeking under dress) ───────────────────────────────
  const tail = BABYLON.MeshBuilder.CreateSphere('tail', { diameter: 1.0, segments: 8 }, scene)
  tail.scaling.set(1.1, 0.45, 0.7)
  tail.position.set(0, 0.22, 0)
  tail.material = m('tail_mat', '#00E5FF', scene, 0.3)
  ol(tail, 0.035)
  attach(tail, root)

  // Tail fin
  const fin = BABYLON.MeshBuilder.CreateCylinder('fin', {
    diameterTop: 0.12, diameterBottom: 0.9, height: 0.22, tessellation: 8,
  }, scene)
  fin.position.set(0, 0.05, 0)
  fin.material = m('fin_mat', '#00ACC1', scene, 0.25)
  ol(fin, 0.03)
  attach(fin, root)

  // ─── SKIRT (puffy princess dress) ─────────────────────────────────────
  const skirt = BABYLON.MeshBuilder.CreateCylinder('skirt', {
    diameterTop: 0.55, diameterBottom: 1.65, height: 0.72, tessellation: 14,
  }, scene)
  skirt.position.set(0, 0.68, 0)
  skirt.material = m('skirt_mat', cfg.dress, scene, 0.22)
  ol(skirt, 0.05)
  attach(skirt, root)

  // Skirt ruffle ring (small spheres around the bottom hem)
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2
    const ruffle = BABYLON.MeshBuilder.CreateSphere(`ruffle_${i}`, { diameter: 0.28, segments: 5 }, scene)
    ruffle.position.set(Math.cos(angle) * 0.76, 0.32, Math.sin(angle) * 0.76)
    ruffle.material = m(`rf_mat_${i}`, cfg.dressDark, scene, 0.2)
    ol(ruffle, 0.02)
    attach(ruffle, root)
  }

  // Skirt shimmer stripe
  const stripe = BABYLON.MeshBuilder.CreateCylinder('stripe', {
    diameterTop: 0.58, diameterBottom: 1.68, height: 0.12, tessellation: 14,
  }, scene)
  stripe.position.set(0, 0.39, 0)
  const stripeMat = m('stripe_mat', '#FFFFFF', scene, 0.4, 0.4)
  stripe.material = stripeMat
  attach(stripe, root)

  // ─── BODICE ────────────────────────────────────────────────────────────
  const bodice = BABYLON.MeshBuilder.CreateCylinder('bodice', {
    diameterTop: 0.48, diameterBottom: 0.55, height: 0.38, tessellation: 12,
  }, scene)
  bodice.position.set(0, 1.22, 0)
  bodice.material = m('bodice_mat', cfg.dress, scene, 0.25)
  ol(bodice, 0.04)
  attach(bodice, root)

  // Bodice bow / star decoration
  const bow = BABYLON.MeshBuilder.CreatePolyhedron('bow', { type: 3, size: 0.1 }, scene)
  bow.position.set(0, 1.3, 0.26)
  bow.material = m('bow_mat', '#FFFFFF', scene, 0.8)
  attach(bow, root)

  // ─── TINY ARMS ─────────────────────────────────────────────────────────
  for (const side of [-1, 1]) {
    const arm = BABYLON.MeshBuilder.CreateSphere(`arm_${side}`, { diameter: 0.26, segments: 5 }, scene)
    arm.position.set(side * 0.38, 1.22, 0.04)
    arm.material = m(`arm_mat_${side}`, SKIN, scene, 0.15)
    ol(arm, 0.025)
    attach(arm, root)

    // Tiny hand
    const hand = BABYLON.MeshBuilder.CreateSphere(`hand_${side}`, { diameter: 0.18, segments: 4 }, scene)
    hand.position.set(side * 0.46, 1.08, 0.04)
    hand.material = m(`hand_mat_${side}`, SKIN, scene, 0.18)
    attach(hand, root)
  }

  // ─── HEAD (big chibi sphere) ────────────────────────────────────────────
  const head = BABYLON.MeshBuilder.CreateSphere('head', { diameter: 1.42, segments: 12 }, scene)
  head.position.set(0, 1.97, 0)
  head.material = m('head_mat', SKIN, scene, 0.18)
  ol(head, 0.055)
  attach(head, root)

  // Neck
  const neck = BABYLON.MeshBuilder.CreateCylinder('neck', {
    diameter: 0.32, height: 0.24, tessellation: 8,
  }, scene)
  neck.position.set(0, 1.44, 0)
  neck.material = m('neck_mat', SKIN, scene, 0.15)
  attach(neck, root)

  // Cheek blush (left and right)
  for (const side of [-1, 1]) {
    const blush = BABYLON.MeshBuilder.CreateSphere(`blush_${side}`, { diameter: 0.35, segments: 5 }, scene)
    blush.position.set(side * 0.48, 1.9, 0.5)
    blush.scaling.set(1, 0.55, 0.4)
    blush.material = m(`blush_mat_${side}`, '#FF80AB', scene, 0.5, 0.45)
    attach(blush, root)
  }

  // ─── ANIME EYES ────────────────────────────────────────────────────────
  for (const side of [-1, 1]) {
    const ex = side * 0.33
    const ey = 2.0
    const ez = 0.62

    // Eye white (large oval)
    const eyeW = BABYLON.MeshBuilder.CreateSphere(`eyeW_${side}`, { diameter: 0.38, segments: 7 }, scene)
    eyeW.position.set(ex, ey, ez)
    eyeW.scaling.set(1, 1.35, 0.38)
    eyeW.material = m(`eyeW_mat_${side}`, '#FFFFFF', scene, 0.6)
    attach(eyeW, root)

    // Iris (colored, large)
    const iris = BABYLON.MeshBuilder.CreateSphere(`iris_${side}`, { diameter: 0.26, segments: 6 }, scene)
    iris.position.set(ex, ey - 0.02, ez + 0.01)
    iris.scaling.set(1, 1.35, 0.4)
    iris.material = m(`iris_mat_${side}`, cfg.irisColor, scene, 0.5)
    attach(iris, root)

    // Pupil (dark)
    const pupil = BABYLON.MeshBuilder.CreateSphere(`pupil_${side}`, { diameter: 0.14, segments: 5 }, scene)
    pupil.position.set(ex, ey - 0.03, ez + 0.02)
    pupil.scaling.set(1, 1.2, 0.35)
    pupil.material = m(`pupil_mat_${side}`, '#150A2E', scene, 0.1)
    attach(pupil, root)

    // Big shine (upper-left of eye)
    const shine1 = BABYLON.MeshBuilder.CreateSphere(`shine1_${side}`, { diameter: 0.1, segments: 4 }, scene)
    shine1.position.set(ex - side * 0.06, ey + 0.07, ez + 0.03)
    shine1.material = m(`sh1_mat`, '#FFFFFF', scene, 1.0)
    attach(shine1, root)

    // Small shine
    const shine2 = BABYLON.MeshBuilder.CreateSphere(`shine2_${side}`, { diameter: 0.05, segments: 4 }, scene)
    shine2.position.set(ex + side * 0.04, ey - 0.06, ez + 0.03)
    shine2.material = m(`sh2_mat_${side}`, '#FFFFFF', scene, 1.0)
    attach(shine2, root)

    // Eyelash (thin flat box on top of eye)
    const lash = BABYLON.MeshBuilder.CreateBox(`lash_${side}`, { width: 0.42, height: 0.07, depth: 0.06 }, scene)
    lash.position.set(ex, ey + 0.24, ez)
    lash.material = m(`lash_mat_${side}`, '#1A0050', scene, 0.2)
    attach(lash, root)

    // Eye sparkle dot (extra cute detail)
    const spark = BABYLON.MeshBuilder.CreateSphere(`spark_${side}`, { diameter: 0.04, segments: 3 }, scene)
    spark.position.set(ex + side * 0.08, ey + 0.1, ez + 0.03)
    spark.material = m(`spark_mat_${side}`, '#E1F5FE', scene, 1.0)
    attach(spark, root)
  }

  // Little smile
  const smile = BABYLON.MeshBuilder.CreateTorus('smile', {
    diameter: 0.28, thickness: 0.045, tessellation: 14, arc: 0.45,
  }, scene)
  smile.position.set(0, 1.72, 0.64)
  smile.rotation.z = Math.PI
  smile.material = m('smile_mat', '#E91E63', scene, 0.4)
  attach(smile, root)

  // ─── WIG / HAIR ────────────────────────────────────────────────────────
  // Main wig dome
  const wigDome = BABYLON.MeshBuilder.CreateSphere('wig_dome', { diameter: 1.52, segments: 10, arc: 0.55 }, scene)
  wigDome.position.set(0, 2.48, -0.05)
  wigDome.rotation.x = Math.PI
  wigDome.material = m('wig_mat', cfg.wig, scene, 0.28)
  ol(wigDome, 0.04)
  attach(wigDome, root)

  // Side hair puffs
  for (const side of [-1, 1]) {
    const puff = BABYLON.MeshBuilder.CreateSphere(`puff_${side}`, { diameter: 0.52, segments: 7 }, scene)
    puff.position.set(side * 0.7, 2.1, -0.1)
    puff.material = m(`puff_mat_${side}`, cfg.wig, scene, 0.25)
    ol(puff, 0.03)
    attach(puff, root)

    // Extra small puff below
    const puff2 = BABYLON.MeshBuilder.CreateSphere(`puff2_${side}`, { diameter: 0.36, segments: 6 }, scene)
    puff2.position.set(side * 0.65, 1.78, -0.05)
    puff2.material = m(`puff2_mat_${side}`, cfg.wigDark, scene, 0.22)
    ol(puff2, 0.025)
    attach(puff2, root)
  }

  // Top hair tufts (cute sticking-up bits)
  for (let i = -1; i <= 1; i++) {
    const tuft = BABYLON.MeshBuilder.CreateSphere(`tuft_${i}`, { diameter: 0.3, segments: 5 }, scene)
    tuft.position.set(i * 0.28, 2.85, -0.1)
    tuft.material = m(`tuft_mat_${i}`, cfg.wig, scene, 0.3)
    ol(tuft, 0.025)
    attach(tuft, root)
  }

  // ─── TIARA / CROWN ─────────────────────────────────────────────────────
  // Crown band
  const crownBand = BABYLON.MeshBuilder.CreateCylinder('crown_band', {
    diameterTop: 1.0, diameterBottom: 1.05, height: 0.14, tessellation: 18,
  }, scene)
  crownBand.position.set(0, 2.72, 0)
  crownBand.material = m('crown_mat', '#FFD700', scene, 0.6)
  ol(crownBand, 0.03)
  attach(crownBand, root)

  // Crown points (5 small spikes)
  const crownPoints = [
    { x: 0,     z: 0,    h: 0.32, s: 1.0 },   // center (tallest)
    { x: -0.28, z: 0.24, h: 0.22, s: 0.8 },
    { x:  0.28, z: 0.24, h: 0.22, s: 0.8 },
    { x: -0.38, z: -0.1, h: 0.18, s: 0.7 },
    { x:  0.38, z: -0.1, h: 0.18, s: 0.7 },
  ]
  crownPoints.forEach(({ x, z, h, s }, i) => {
    const spike = BABYLON.MeshBuilder.CreateCylinder(`spike_${i}`, {
      diameterTop: 0, diameterBottom: 0.13 * s, height: h, tessellation: 6,
    }, scene)
    spike.position.set(x, 2.79 + h / 2, z)
    spike.material = m(`spike_mat_${i}`, '#FFD700', scene, 0.55)
    attach(spike, root)
  })

  // Crown gems (3 colored spheres)
  const gemPositions = [
    { x: 0, z: 0.52, color: cfg.gem },
    { x: -0.36, z: 0.36, color: '#FF80AB' },
    { x:  0.36, z: 0.36, color: '#FF80AB' },
  ]
  gemPositions.forEach(({ x, z, color }, i) => {
    const gem = BABYLON.MeshBuilder.CreateSphere(`gem_${i}`, { diameter: 0.16, segments: 5 }, scene)
    gem.position.set(x, 2.77, z)
    gem.material = m(`gem_mat_${i}`, color, scene, 0.9)
    ol(gem, 0.015)
    attach(gem, root)
  })

  // ─── ANTENNAE ──────────────────────────────────────────────────────────
  for (const side of [-1, 1]) {
    // Stick
    const stick = BABYLON.MeshBuilder.CreateCylinder(`ant_${side}`, {
      diameterTop: 0.04, diameterBottom: 0.06, height: 0.5, tessellation: 5,
    }, scene)
    stick.position.set(side * 0.42, 2.9, 0.1)
    stick.rotation.z = side * 0.35
    stick.rotation.x = -0.15
    stick.material = m(`ant_mat_${side}`, SKIN_DARK, scene, 0.2)
    attach(stick, root)

    // Glowing tip
    const tip = BABYLON.MeshBuilder.CreateSphere(`antTip_${side}`, { diameter: 0.18, segments: 5 }, scene)
    tip.position.set(side * 0.56, 3.15, 0.05)
    tip.material = m(`tip_mat_${side}`, '#FF80AB', scene, 1.0)
    ol(tip, 0.018)
    attach(tip, root)

    // Tip glow pulse
    let gt = side === -1 ? 0 : 1.2
    scene.registerBeforeRender(() => {
      gt += scene.getEngine().getDeltaTime() / 1000
      tip.material.emissiveColor.setAll(0.7 + Math.sin(gt * 3) * 0.3)
    })
  }

  // ─── SHADOW + OUTLINE for main parts ───────────────────────────────────
  root.getChildMeshes().forEach(mesh => {
    mesh.receiveShadows = true
  })

  // ─── Walk bob animation ─────────────────────────────────────────────────
  let walkTime = 0
  let isWalking = false

  scene.registerBeforeRender(() => {
    if (isWalking) {
      walkTime += scene.getEngine().getDeltaTime() / 1000
      // Gentle bounce
      root.position.y = Math.abs(Math.sin(walkTime * 7)) * 0.08
      // Slight side sway
      root.rotation.z = Math.sin(walkTime * 7) * 0.05
    } else {
      root.position.y = BABYLON.Scalar.Lerp(root.position.y, 0, 0.18)
      root.rotation.z = BABYLON.Scalar.Lerp(root.rotation.z, 0, 0.18)
    }
  })

  return {
    root,
    get meshes() { return root.getChildMeshes() },
    setWalking: v => { isWalking = v },

    celebrate() {
      let t = 0
      isWalking = false
      const id = scene.registerBeforeRender(() => {
        t += scene.getEngine().getDeltaTime() / 1000
        root.rotation.y += 0.12
        root.position.y  = Math.abs(Math.sin(t * 5)) * 0.5
        if (t > 2.5) {
          scene.unregisterBeforeRender(id)
          root.rotation.y = 0
          root.position.y = 0
        }
      })
    },
  }
}
