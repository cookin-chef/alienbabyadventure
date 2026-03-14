/**
 * WorldObjects.js — Procedural 3D objects for the game world.
 * All built from Babylon.js primitives (no external assets).
 */
import * as BABYLON from '@babylonjs/core'

// ── Material helper ─────────────────────────────────────────────────────────

export function toonMat(name, hex, scene, opts = {}) {
  const m = new BABYLON.StandardMaterial(name, scene)
  m.diffuseColor = BABYLON.Color3.FromHexString(hex)
  m.emissiveColor = m.diffuseColor.scale(opts.emissive ?? 0.2)
  m.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05)
  if (opts.alpha !== undefined) m.alpha = opts.alpha
  return m
}

function ol(mesh, w = 0.05) {
  mesh.renderOutline = true
  mesh.outlineColor = new BABYLON.Color3(0.05, 0.02, 0.08)
  mesh.outlineWidth = w
}

// ── Stars ───────────────────────────────────────────────────────────────────

export function createStar(name, position, scene, onCollect) {
  const root = new BABYLON.TransformNode(`star_${name}`, scene)
  root.position.copyFrom(position)

  // Star body (golden sphere with sparkle look)
  const body = BABYLON.MeshBuilder.CreatePolyhedron(`star_body_${name}`, {
    type: 3, size: 0.28,
  }, scene)
  body.material = toonMat(`star_mat_${name}`, '#FFD700', scene, { emissive: 0.7 })
  body.parent = root

  // Glow ring
  const ring = BABYLON.MeshBuilder.CreateTorus(`star_ring_${name}`, {
    diameter: 0.8, thickness: 0.06, tessellation: 20,
  }, scene)
  ring.material = toonMat(`star_ring_mat_${name}`, '#FFF176', scene, { emissive: 0.9, alpha: 0.6 })
  ring.parent = root

  // Float + spin animation
  let t = Math.random() * Math.PI * 2
  const baseY = position.y
  const obs = scene.registerBeforeRender(() => {
    t += scene.getEngine().getDeltaTime() / 1000
    root.position.y = baseY + Math.sin(t * 2) * 0.2
    root.rotation.y = t * 2
    ring.rotation.x = t * 1.5
  })

  // Pickup detection handled externally via distance check
  return {
    root,
    body,
    collected: false,
    collect() {
      this.collected = true
      scene.unregisterBeforeRender(obs)
      // Pop animation then dispose
      let pt = 0
      const popObs = scene.registerBeforeRender(() => {
        pt += scene.getEngine().getDeltaTime() / 1000
        root.scaling.setAll(1 + pt * 4)
        root.getChildMeshes().forEach(m => {
          const mat = m.material
          if (mat) mat.alpha = Math.max(0, 1 - pt * 3)
        })
        if (pt > 0.4) {
          scene.unregisterBeforeRender(popObs)
          root.dispose()
          if (onCollect) onCollect()
        }
      })
    },
  }
}

// ── Trees ───────────────────────────────────────────────────────────────────

export function createTree(x, z, scene, colorHex = '#2E7D32', height = 3.5) {
  const trunk = BABYLON.MeshBuilder.CreateCylinder(`tree_trunk_${x}_${z}`, {
    diameterTop: 0.22, diameterBottom: 0.32, height: height * 0.45, tessellation: 7,
  }, scene)
  trunk.position.set(x, height * 0.225, z)
  trunk.material = toonMat(`trunk_${x}`, '#5D4037', scene)
  ol(trunk, 0.03)

  // Three layered cones for fluffy look
  const leafColors = [colorHex, shiftColor(colorHex, 15), shiftColor(colorHex, -15)]
  for (let i = 0; i < 3; i++) {
    const cone = BABYLON.MeshBuilder.CreateCylinder(`leaf_${x}_${z}_${i}`, {
      diameterTop: 0, diameterBottom: (2.2 - i * 0.35) * (height / 3.5),
      height: (1.8 + i * 0.3) * (height / 3.5), tessellation: 9,
    }, scene)
    cone.position.set(x, height * 0.45 + i * height * 0.18, z)
    cone.material = toonMat(`leaf_${x}_${i}`, leafColors[i], scene, { emissive: 0.15 })
    ol(cone, 0.04)
  }
}

function shiftColor(hex, delta) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = v => Math.min(255, Math.max(0, v + delta))
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('')
}

// ── Flower ──────────────────────────────────────────────────────────────────

export function createFlower(x, z, scene, color = '#E91E63') {
  const stem = BABYLON.MeshBuilder.CreateCylinder(`stem_${x}_${z}`, {
    diameter: 0.06, height: 0.5, tessellation: 5,
  }, scene)
  stem.position.set(x, 0.25, z)
  stem.material = toonMat(`stem_mat`, '#388E3C', scene)

  const petal = BABYLON.MeshBuilder.CreateSphere(`flower_${x}_${z}`, {
    diameter: 0.35, segments: 5,
  }, scene)
  petal.position.set(x, 0.58, z)
  petal.material = toonMat(`flower_mat_${x}_${z}`, color, scene, { emissive: 0.4 })
  ol(petal, 0.03)

  const center = BABYLON.MeshBuilder.CreateSphere(`fc_${x}_${z}`, {
    diameter: 0.15, segments: 4,
  }, scene)
  center.position.set(x, 0.6, z)
  center.material = toonMat(`fc_mat`, '#FFEB3B', scene, { emissive: 0.6 })
}

// ── Castle building ──────────────────────────────────────────────────────────

export function createCastle(scene) {
  const root = new BABYLON.TransformNode('castle_root', scene)
  const wallMat = toonMat('wall', '#F5F5DC', scene, { emissive: 0.1 })
  const roofMat = toonMat('roof', '#9C27B0', scene, { emissive: 0.2 })
  const windowMat = toonMat('window', '#FFF9C4', scene, { emissive: 0.9, alpha: 0.85 })
  const doorMat = toonMat('door', '#4A148C', scene, { emissive: 0.3 })

  function addBox(id, w, h, d, x, y, z, mat) {
    const box = BABYLON.MeshBuilder.CreateBox(`castle_${id}`, { width: w, height: h, depth: d }, scene)
    box.position.set(x, y, z)
    box.material = mat
    ol(box, 0.06)
    box.parent = root
    return box
  }

  function addCyl(id, diam, h, x, y, z, mat, tess = 10) {
    const c = BABYLON.MeshBuilder.CreateCylinder(`castle_${id}`, {
      diameter: diam, height: h, tessellation: tess,
    }, scene)
    c.position.set(x, y, z)
    c.material = mat
    ol(c, 0.05)
    c.parent = root
    return c
  }

  function addCone(id, diam, h, x, y, z, mat, tess = 10) {
    const c = BABYLON.MeshBuilder.CreateCylinder(`castle_${id}`, {
      diameterTop: 0, diameterBottom: diam, height: h, tessellation: tess,
    }, scene)
    c.position.set(x, y, z)
    c.material = mat
    ol(c, 0.05)
    c.parent = root
    return c
  }

  // Main keep
  addBox('keep', 12, 8, 10, 0, 4, 0, wallMat)

  // Battlements (top edge boxes)
  for (let i = -5; i <= 5; i += 2) {
    addBox(`batt_f_${i}`, 0.8, 0.8, 0.8, i, 8.4, 5, wallMat)
    addBox(`batt_b_${i}`, 0.8, 0.8, 0.8, i, 8.4, -5, wallMat)
  }
  for (let i = -4; i <= 4; i += 2) {
    addBox(`batt_l_${i}`, 0.8, 0.8, 0.8, -6, 8.4, i, wallMat)
    addBox(`batt_r_${i}`, 0.8, 0.8, 0.8, 6, 8.4, i, wallMat)
  }

  // Four corner towers
  const towerPosns = [[-7, 6], [7, 6], [-7, -6], [7, -6]]
  towerPosns.forEach(([tx, tz], i) => {
    addCyl(`tower_${i}`, 3, 12, tx, 6, tz, wallMat)
    addCone(`roof_${i}`, 3.8, 4, tx, 13, tz, roofMat)
  })

  // Flags on towers
  towerPosns.forEach(([tx, tz], i) => {
    const pole = BABYLON.MeshBuilder.CreateCylinder(`flag_pole_${i}`, {
      diameter: 0.1, height: 2, tessellation: 5,
    }, scene)
    pole.position.set(tx, 15.5, tz)
    pole.material = toonMat('pole', '#FFC107', scene)
    pole.parent = root

    const flag = BABYLON.MeshBuilder.CreateBox(`flag_${i}`, { width: 1.2, height: 0.6, depth: 0.05 }, scene)
    flag.position.set(tx + 0.7, 16.0, tz)
    flag.material = toonMat(`flag_m_${i}`, i % 2 === 0 ? '#E040FB' : '#7C4DFF', scene, { emissive: 0.5 })
    flag.parent = root
    // Wave
    let ft = i * 0.5
    scene.registerBeforeRender(() => {
      ft += scene.getEngine().getDeltaTime() / 1000
      flag.rotation.y = Math.sin(ft * 2) * 0.3
    })
  })

  // Door arch
  const door = addBox('door', 3, 4.5, 0.5, 0, 2.25, 5.1, doorMat)

  // Door arch top (rounded top via torus half)
  const arch = BABYLON.MeshBuilder.CreateTorus('door_arch', {
    diameter: 3, thickness: 0.5, tessellation: 16, arc: 0.5,
  }, scene)
  arch.position.set(0, 4.5, 5.1)
  arch.rotation.z = Math.PI
  arch.material = doorMat
  arch.parent = root

  // Windows (glowing)
  const winPosns = [[-3, 5, 5.1], [3, 5, 5.1], [-3, 3, 5.1], [3, 3, 5.1]]
  winPosns.forEach(([wx, wy, wz], i) => {
    const win = addBox(`win_${i}`, 1.0, 1.4, 0.3, wx, wy, wz, windowMat)
  })

  // Add glow light for castle
  const glow = new BABYLON.PointLight('castle_glow', new BABYLON.Vector3(0, 6, 4), scene)
  glow.diffuse = new BABYLON.Color3(1, 0.9, 0.6)
  glow.intensity = 1.2
  glow.range = 20

  // Door label billboard (handled in scene via GUI)
  return { root, doorPosition: new BABYLON.Vector3(0, 0, -20) }
}

// ── Roller Coaster ───────────────────────────────────────────────────────────

export function createRollerCoaster(cx, cz, scene) {
  const root = new BABYLON.TransformNode('coaster_root', scene)

  const trackMat = toonMat('track', '#607D8B', scene, { emissive: 0.15 })
  const supportMat = toonMat('support', '#546E7A', scene, { emissive: 0.1 })
  const cartMat = toonMat('cart', '#F44336', scene, { emissive: 0.3 })

  // Track path — a fun looping oval
  const path = []
  const N = 40
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2
    const x = cx + Math.cos(t) * 7
    const z = cz + Math.sin(t) * 5
    const y = 1.5 + Math.sin(t * 2) * 2 + Math.abs(Math.sin(t)) * 1.5
    path.push(new BABYLON.Vector3(x, y, z))
  }

  const track = BABYLON.MeshBuilder.CreateTube('coaster_track', {
    path, radius: 0.18, tessellation: 8, updatable: false,
  }, scene)
  track.material = trackMat
  track.parent = root

  // Second parallel rail
  const path2 = path.map(p => new BABYLON.Vector3(p.x + 0.6, p.y, p.z))
  const track2 = BABYLON.MeshBuilder.CreateTube('coaster_track2', {
    path: path2, radius: 0.18, tessellation: 8,
  }, scene)
  track2.material = trackMat
  track2.parent = root

  // Support pillars
  for (let i = 0; i < N; i += 4) {
    const p = path[i]
    if (p.y > 1.0) {
      const sup = BABYLON.MeshBuilder.CreateCylinder(`sup_${i}`, {
        diameter: 0.25, height: p.y, tessellation: 6,
      }, scene)
      sup.position.set(p.x, p.y / 2, p.z)
      sup.material = supportMat
      sup.parent = root
    }
  }

  // Cart (animated along track)
  const cart = BABYLON.MeshBuilder.CreateBox('cart', { width: 1.2, height: 0.7, depth: 0.9 }, scene)
  cart.material = cartMat
  ol(cart, 0.05)
  cart.parent = root

  // Sign
  const signPost = BABYLON.MeshBuilder.CreateCylinder('coaster_sign_pole', {
    diameter: 0.15, height: 3, tessellation: 6,
  }, scene)
  signPost.position.set(cx + 8, 1.5, cz)
  signPost.material = supportMat

  const sign = BABYLON.MeshBuilder.CreateBox('coaster_sign', {
    width: 3.5, height: 1.4, depth: 0.2,
  }, scene)
  sign.position.set(cx + 8, 3.5, cz)
  sign.material = toonMat('sign_mat', '#E91E63', scene, { emissive: 0.4 })
  ol(sign, 0.05)

  // Animate cart along track
  let cartT = 0
  const cartObs = scene.registerBeforeRender(() => {
    cartT += scene.getEngine().getDeltaTime() / 1000 * 0.12
    const idx = Math.floor((cartT % 1) * (N - 1))
    const next = (idx + 1) % N
    const frac = (cartT % (1 / (N - 1))) * (N - 1)
    const pos = BABYLON.Vector3.Lerp(path[idx], path[next], frac % 1)
    cart.position.copyFrom(pos)
    // Face direction
    const dir = path[next].subtract(path[idx])
    if (dir.length() > 0.01) {
      cart.lookAt(pos.add(dir))
    }
  })

  return {
    root,
    center: new BABYLON.Vector3(cx, 0, cz),
    ridePoints: path,
    cartObs,
    // Returns animation promise for ride cutscene
    playRide(character, camera, onDone) {
      let rt = 0
      const savedCamParent = camera.parent
      // Attach camera to cart
      camera.parent = cart
      camera.position = new BABYLON.Vector3(0, 2, -4)
      camera.setTarget(cart.position.add(new BABYLON.Vector3(0, 1, 0)))

      const rideId = scene.registerBeforeRender(() => {
        rt += scene.getEngine().getDeltaTime() / 1000
        // Move character with cart
        character.root.position.copyFrom(cart.position)
        character.root.position.y += 0.35
        if (rt > 4) {
          scene.unregisterBeforeRender(rideId)
          camera.parent = null
          if (onDone) onDone()
        }
      })
    },
  }
}

// ── Carousel ─────────────────────────────────────────────────────────────────

export function createCarousel(cx, cz, scene) {
  const root = new BABYLON.TransformNode('carousel_root', scene)
  root.position.set(cx, 0, cz)

  const baseMat  = toonMat('car_base',  '#CE93D8', scene, { emissive: 0.2 })
  const poleMat  = toonMat('car_pole',  '#FFD700', scene, { emissive: 0.4 })
  const topMat   = toonMat('car_top',   '#E040FB', scene, { emissive: 0.3 })
  const horseMat = toonMat('car_horse', '#FFFFFF', scene, { emissive: 0.3 })

  // Base platform
  const base = BABYLON.MeshBuilder.CreateCylinder('car_base', {
    diameter: 7, height: 0.4, tessellation: 24,
  }, scene)
  base.position.y = 0.2
  base.material = baseMat
  ol(base, 0.06)
  base.parent = root

  // Center pole
  const center = BABYLON.MeshBuilder.CreateCylinder('car_center', {
    diameter: 0.4, height: 5, tessellation: 10,
  }, scene)
  center.position.y = 2.5
  center.material = poleMat
  center.parent = root

  // Top canopy
  const top = BABYLON.MeshBuilder.CreateCylinder('car_top', {
    diameterTop: 0.5, diameterBottom: 8, height: 2.5, tessellation: 24,
  }, scene)
  top.position.y = 6.5
  top.material = topMat
  ol(top, 0.07)
  top.parent = root

  // Canopy stripes (colored segments)
  const stripeColors = ['#7C4DFF', '#E040FB', '#7C4DFF', '#E040FB']
  // (Full stripe geometry would be complex; rely on base color + lighting)

  // 4 Horses
  const horses = []
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const hx = Math.cos(angle) * 2.8
    const hz = Math.sin(angle) * 2.8

    const horsePole = BABYLON.MeshBuilder.CreateCylinder(`car_hpole_${i}`, {
      diameter: 0.12, height: 4, tessellation: 6,
    }, scene)
    horsePole.position.set(hx, 3.5, hz)
    horsePole.material = poleMat
    horsePole.parent = root

    const horseBody = BABYLON.MeshBuilder.CreateBox(`car_horse_${i}`, {
      width: 0.6, height: 0.8, depth: 1.2,
    }, scene)
    horseBody.position.set(hx, 2.5, hz)
    horseBody.material = horseMat
    ol(horseBody, 0.04)
    horseBody.parent = root

    // Horse head
    const horseHead = BABYLON.MeshBuilder.CreateBox(`car_hhead_${i}`, {
      width: 0.4, height: 0.5, depth: 0.4,
    }, scene)
    horseHead.position.set(hx, 3.1, hz - 0.5)
    horseHead.material = horseMat
    horseHead.parent = root

    // Saddle (colored)
    const saddle = BABYLON.MeshBuilder.CreateBox(`car_saddle_${i}`, {
      width: 0.65, height: 0.2, depth: 0.7,
    }, scene)
    saddle.position.set(hx, 2.95, hz)
    saddle.material = toonMat(`saddle_${i}`, stripeColors[i], scene, { emissive: 0.4 })
    saddle.parent = root

    horses.push({ pole: horsePole, body: horseBody, head: horseHead, baseY: 2.5 })
  }

  // Decorative lights (small spheres)
  const lightColors = ['#FF5252', '#FFEB3B', '#69F0AE', '#40C4FF', '#E040FB']
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    const bulb = BABYLON.MeshBuilder.CreateSphere(`car_bulb_${i}`, { diameter: 0.2, segments: 4 }, scene)
    bulb.position.set(Math.cos(angle) * 3.8, 6.0, Math.sin(angle) * 3.8)
    bulb.material = toonMat(`bulb_${i}`, lightColors[i % lightColors.length], scene, { emissive: 0.9 })
    bulb.parent = root
  }

  // Rotate + horse bob animation
  let rot = 0
  scene.registerBeforeRender(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000
    rot += dt * 0.6
    root.rotation.y = rot
    horses.forEach((h, i) => {
      const bob = Math.sin(rot * 2 + i * 1.57) * 0.3
      h.body.position.y = h.baseY + bob
      h.head.position.y = 3.1 + bob
      h.pole.scaling.y = 1
    })
  })

  return {
    root,
    center: new BABYLON.Vector3(cx, 0, cz),
    playRide(character, onDone) {
      // Character sits on first horse during ride
      let rt = 0
      const horse = horses[0]
      const rideId = scene.registerBeforeRender(() => {
        rt += scene.getEngine().getDeltaTime() / 1000
        // Character follows horse
        const worldPos = BABYLON.Vector3.TransformCoordinates(
          horse.body.position,
          root.getWorldMatrix()
        )
        character.root.position.copyFrom(worldPos)
        character.root.position.y += 0.4
        character.root.rotation.y = root.rotation.y + Math.PI
        if (rt > 4) {
          scene.unregisterBeforeRender(rideId)
          if (onDone) onDone()
        }
      })
    },
  }
}

// ── Ground + Path ─────────────────────────────────────────────────────────────

export function createGround(scene) {
  // Main grass ground
  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: 120, height: 120, subdivisions: 2,
  }, scene)
  const gm = toonMat('grass', '#4CAF50', scene, { emissive: 0.08 })
  ground.material = gm
  ground.receiveShadows = true

  // Path (cream colored strip from start to castle)
  const path = BABYLON.MeshBuilder.CreateBox('path', {
    width: 5, height: 0.05, depth: 60,
  }, scene)
  path.position.set(0, 0.025, 5)
  path.material = toonMat('path_mat', '#F5F5DC', scene, { emissive: 0.12 })

  return ground
}

// ── Balloon clusters ─────────────────────────────────────────────────────────

export function createBalloons(x, z, scene) {
  const colors = ['#FF5252', '#FF9800', '#FFEB3B', '#69F0AE', '#40C4FF', '#E040FB']
  const root = new BABYLON.TransformNode(`balloons_${x}_${z}`, scene)

  const stick = BABYLON.MeshBuilder.CreateCylinder(`bstick_${x}`, {
    diameter: 0.08, height: 2.5, tessellation: 5,
  }, scene)
  stick.position.set(x, 1.25, z)
  stick.material = toonMat('bstick_mat', '#795548', scene)

  for (let i = 0; i < 5; i++) {
    const balloon = BABYLON.MeshBuilder.CreateSphere(`balloon_${x}_${i}`, {
      diameter: 0.8, segments: 7,
    }, scene)
    const angle = (i / 5) * Math.PI * 2
    balloon.position.set(
      x + Math.cos(angle) * 0.5,
      2.5 + Math.random() * 0.8 + Math.abs(Math.sin(i)) * 0.5,
      z + Math.sin(angle) * 0.5
    )
    balloon.material = toonMat(`b_mat_${x}_${i}`, colors[i % colors.length], scene, { emissive: 0.4 })
    ol(balloon, 0.03)

    // Float
    let bt = i * 0.5
    const baseY = balloon.position.y
    scene.registerBeforeRender(() => {
      bt += scene.getEngine().getDeltaTime() / 1000
      balloon.position.y = baseY + Math.sin(bt * 1.5) * 0.15
    })
  }
}
