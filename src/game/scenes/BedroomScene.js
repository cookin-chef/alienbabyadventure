import * as BABYLON from '@babylonjs/core'
import { buildCharacter } from '../objects/CharacterMesh'
import { createStar, toonMat, makeFabricTex, makeStoneTex } from '../objects/WorldObjects'

// 3 stars in the bedroom
const BEDROOM_STARS = [
  { x: -4, y: 1.2, z:  3 },
  { x:  4, y: 1.2, z:  3 },
  { x:  0, y: 1.5, z: -4 },
]

export function createBedroomScene(engine, characterKey, callbacks) {
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.08, 0.04, 0.18, 1)

  // ── Lighting ──
  const ambient = new BABYLON.HemisphericLight('amb', new BABYLON.Vector3(0, 1, 0), scene)
  ambient.intensity = 0.4

  // Chandelier light (center)
  const chandelierLight = new BABYLON.PointLight('chandelier', new BABYLON.Vector3(0, 5, 0), scene)
  chandelierLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.8)
  chandelierLight.intensity = 1.5
  chandelierLight.range = 20

  // Diamond glow light (pulses)
  const diamondLight = new BABYLON.PointLight('diamond_light', new BABYLON.Vector3(0, 1.5, -5), scene)
  diamondLight.diffuse = new BABYLON.Color3(0.5, 0.9, 1.0)
  diamondLight.intensity = 2.0
  diamondLight.range = 15

  // ── Room geometry ──
  // Textured materials — stone floor, fabric carpet, dark stone walls
  const floorMat = new BABYLON.StandardMaterial('bed_floor', scene)
  floorMat.diffuseTexture = makeStoneTex(scene, '#4A1A6E')
  floorMat.diffuseTexture.uScale = 4
  floorMat.diffuseTexture.vScale = 4
  floorMat.emissiveColor = new BABYLON.Color3(0.06, 0.02, 0.09)
  floorMat.specularColor = new BABYLON.Color3(0.12, 0.05, 0.18)
  floorMat.specularPower = 48

  const wallMat = new BABYLON.StandardMaterial('bed_wall', scene)
  wallMat.diffuseTexture = makeStoneTex(scene, '#2A0A50')
  wallMat.diffuseTexture.uScale = 3
  wallMat.diffuseTexture.vScale = 3
  wallMat.emissiveColor = new BABYLON.Color3(0.04, 0.01, 0.07)
  wallMat.specularColor = new BABYLON.Color3(0.06, 0.02, 0.1)

  const ceilMat  = toonMat('bed_ceil', '#1A0050', scene, { emissive: 0.1 })

  const carpetMat = new BABYLON.StandardMaterial('bed_carpet', scene)
  carpetMat.diffuseTexture = makeFabricTex(scene, '#CE93D8')
  carpetMat.diffuseTexture.uScale = 3
  carpetMat.diffuseTexture.vScale = 3
  carpetMat.emissiveColor = new BABYLON.Color3(0.1, 0.04, 0.12)
  carpetMat.specularColor = new BABYLON.Color3(0.04, 0.02, 0.06)

  // Floor
  const floor = BABYLON.MeshBuilder.CreateBox('bed_floor', { width: 14, height: 0.3, depth: 14 }, scene)
  floor.position.set(0, -0.15, -1)
  floor.material = floorMat
  floor.receiveShadows = true

  // Carpet
  const carpet = BABYLON.MeshBuilder.CreateBox('bed_carpet', { width: 8, height: 0.05, depth: 8 }, scene)
  carpet.position.set(0, 0.03, -1)
  carpet.material = carpetMat

  // Walls
  BABYLON.MeshBuilder.CreateBox('wall_l', { width: 0.4, height: 9, depth: 14 }, scene)
    .position.set(-7, 4.5, -1)
  BABYLON.MeshBuilder.CreateBox('wall_r', { width: 0.4, height: 9, depth: 14 }, scene)
    .position.set(7, 4.5, -1)
  BABYLON.MeshBuilder.CreateBox('wall_back', { width: 14, height: 9, depth: 0.4 }, scene)
    .position.set(0, 4.5, -8)
  BABYLON.MeshBuilder.CreateBox('wall_front_l', { width: 4.5, height: 9, depth: 0.4 }, scene)
    .position.set(-4.75, 4.5, 6)
  BABYLON.MeshBuilder.CreateBox('wall_front_r', { width: 4.5, height: 9, depth: 0.4 }, scene)
    .position.set(4.75, 4.5, 6)
  scene.meshes.filter(m => m.name.startsWith('wall')).forEach(m => {
    m.material = wallMat
  })

  // Ceiling
  const ceil = BABYLON.MeshBuilder.CreateBox('ceiling', { width: 14, height: 0.4, depth: 14 }, scene)
  ceil.position.set(0, 9.2, -1)
  ceil.material = ceilMat

  // ── Chandelier ──
  const chanBase = BABYLON.MeshBuilder.CreateSphere('chan_base', { diameter: 0.6, segments: 6 }, scene)
  chanBase.position.set(0, 8.5, -1)
  chanBase.material = toonMat('chan_mat', '#FFC107', scene, { emissive: 0.6 })

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const arm = BABYLON.MeshBuilder.CreateCylinder(`chan_arm_${i}`, {
      diameter: 0.08, height: 1.5, tessellation: 5,
    }, scene)
    arm.position.set(Math.cos(angle) * 0.8, 8.2, Math.sin(angle) * 0.8 - 1)
    arm.rotation.z = Math.PI / 2
    arm.rotation.y = angle
    arm.material = toonMat('chan_arm_mat', '#FFC107', scene, { emissive: 0.4 })

    const crystal = BABYLON.MeshBuilder.CreatePolyhedron(`chan_crystal_${i}`, {
      type: 3, size: 0.15,
    }, scene)
    crystal.position.set(Math.cos(angle) * 1.5, 7.8, Math.sin(angle) * 1.5 - 1)
    crystal.material = toonMat(`chan_c_${i}`, '#E1F5FE', scene, { emissive: 0.8 })
  }

  // ── Bed ──
  const bedFrameMat = toonMat('bed_frame', '#4A148C', scene, { emissive: 0.2 })
  const bedSheetMat = toonMat('sheet', '#E1BEE7', scene, { emissive: 0.15 })
  const pillowMat   = toonMat('pillow', '#F3E5F5', scene, { emissive: 0.2 })

  // Bed frame
  const bedFrame = BABYLON.MeshBuilder.CreateBox('bed_frame', { width: 4.5, height: 0.5, depth: 6 }, scene)
  bedFrame.position.set(4, 0.25, -4)
  bedFrame.material = bedFrameMat

  // Mattress
  const mattress = BABYLON.MeshBuilder.CreateBox('mattress', { width: 4.2, height: 0.5, depth: 5.5 }, scene)
  mattress.position.set(4, 0.7, -4)
  mattress.material = bedSheetMat

  // Pillows
  for (const px of [3.1, 4.9]) {
    const pillow = BABYLON.MeshBuilder.CreateBox(`pillow_${px}`, { width: 1.5, height: 0.35, depth: 1.2 }, scene)
    pillow.position.set(px, 1.1, -6.3)
    pillow.material = pillowMat
  }

  // Headboard
  const headboard = BABYLON.MeshBuilder.CreateBox('headboard', { width: 4.5, height: 2.5, depth: 0.3 }, scene)
  headboard.position.set(4, 1.5, -7.1)
  headboard.material = bedFrameMat

  // Bed legs
  for (const [bx, bz] of [[2, -2], [6, -2], [2, -6], [6, -6]]) {
    const leg = BABYLON.MeshBuilder.CreateCylinder(`leg_${bx}_${bz}`, {
      diameter: 0.3, height: 0.5, tessellation: 6,
    }, scene)
    leg.position.set(bx, -0.25, bz - 0.5)
    leg.material = bedFrameMat
  }

  // ── Dresser ──
  const dresser = BABYLON.MeshBuilder.CreateBox('dresser', { width: 3, height: 3, depth: 1.2 }, scene)
  dresser.position.set(-5, 1.5, -4)
  dresser.material = toonMat('dresser_mat', '#6A1B9A', scene, { emissive: 0.15 })

  // Mirror above dresser (glowing frame)
  const mirrorFrame = BABYLON.MeshBuilder.CreateBox('mirror_frame', { width: 2.2, height: 2.8, depth: 0.15 }, scene)
  mirrorFrame.position.set(-5, 4.5, -4)
  mirrorFrame.material = toonMat('mirror_frame_mat', '#FFC107', scene, { emissive: 0.5 })

  const mirror = BABYLON.MeshBuilder.CreateBox('mirror', { width: 1.8, height: 2.4, depth: 0.1 }, scene)
  mirror.position.set(-5, 4.5, -3.97)
  mirror.material = toonMat('mirror_mat', '#E1F5FE', scene, { emissive: 0.4, alpha: 0.7 })

  // ── Window with moonlight ──
  const winFrame = BABYLON.MeshBuilder.CreateBox('win_frame', { width: 3.5, height: 4, depth: 0.3 }, scene)
  winFrame.position.set(0, 4.5, -7.9)
  winFrame.material = toonMat('win_frame_mat', '#4A148C', scene)

  const winGlass = BABYLON.MeshBuilder.CreateBox('win_glass', { width: 3, height: 3.5, depth: 0.1 }, scene)
  winGlass.position.set(0, 4.5, -7.85)
  winGlass.material = toonMat('win_glass', '#1A237E', scene, { emissive: 0.5, alpha: 0.6 })

  // Moon outside window
  const moon = BABYLON.MeshBuilder.CreateSphere('moon', { diameter: 2, segments: 8 }, scene)
  moon.position.set(0, 4.5, -12)
  moon.material = toonMat('moon_mat', '#FFF9C4', scene, { emissive: 0.95 })

  // ── Curtains ──
  const curtainMat = toonMat('curtain', '#7B1FA2', scene, { emissive: 0.15, alpha: 0.9 })
  const curtL = BABYLON.MeshBuilder.CreateBox('curtain_l', { width: 1.2, height: 4.5, depth: 0.15 }, scene)
  curtL.position.set(-2.2, 4.5, -7.8)
  curtL.material = curtainMat
  const curtR = BABYLON.MeshBuilder.CreateBox('curtain_r', { width: 1.2, height: 4.5, depth: 0.15 }, scene)
  curtR.position.set(2.2, 4.5, -7.8)
  curtR.material = curtainMat

  // ── Stars on ceiling (decorative) ──
  for (let i = 0; i < 20; i++) {
    const ceilStar = BABYLON.MeshBuilder.CreatePolyhedron(`ceil_star_${i}`, {
      type: 3, size: 0.08,
    }, scene)
    ceilStar.position.set(
      (Math.random() - 0.5) * 10,
      9.0,
      (Math.random() - 0.5) * 10 - 1
    )
    ceilStar.material = toonMat(`cs_mat_${i}`, '#FFF9C4', scene, { emissive: 0.9 })
    let cst = i * 0.4
    scene.registerBeforeRender(() => {
      cst += scene.getEngine().getDeltaTime() / 1000
      ceilStar.material.emissiveColor.setAll(0.7 + Math.sin(cst * 3) * 0.3)
    })
  }

  // ── Diamond on pedestal ──
  const pedestal = BABYLON.MeshBuilder.CreateCylinder('pedestal', {
    diameterTop: 0.8, diameterBottom: 1.2, height: 1.2, tessellation: 12,
  }, scene)
  pedestal.position.set(0, 0.6, -5.5)
  pedestal.material = toonMat('ped_mat', '#FFC107', scene, { emissive: 0.4 })

  // Pedestal top
  const pedTop = BABYLON.MeshBuilder.CreateCylinder('ped_top', {
    diameterTop: 1.0, diameterBottom: 0.8, height: 0.2, tessellation: 12,
  }, scene)
  pedTop.position.set(0, 1.25, -5.5)
  pedTop.material = toonMat('ped_top_mat', '#FFD700', scene, { emissive: 0.5 })

  // Diamond gem
  const diamond = BABYLON.MeshBuilder.CreatePolyhedron('diamond', {
    type: 3, size: 0.7,
  }, scene)
  diamond.position.set(0, 2.1, -5.5)
  const diamondMat = toonMat('diamond_mat', '#80D8FF', scene, { emissive: 0.9 })
  diamondMat.alpha = 0.88
  diamond.material = diamondMat

  // Diamond glow halo
  const halo = BABYLON.MeshBuilder.CreateTorus('diamond_halo', {
    diameter: 2.2, thickness: 0.12, tessellation: 24,
  }, scene)
  halo.position.set(0, 2.1, -5.5)
  const haloMat = toonMat('halo_mat', '#40C4FF', scene, { emissive: 1.0 })
  haloMat.alpha = 0.5
  halo.material = haloMat

  // Animate diamond
  let diamondT = 0
  let diamondCollected = false
  scene.registerBeforeRender(() => {
    diamondT += scene.getEngine().getDeltaTime() / 1000
    diamond.rotation.y = diamondT * 1.5
    diamond.position.y = 2.1 + Math.sin(diamondT * 2) * 0.12
    halo.rotation.x = diamondT * 0.8
    halo.rotation.z = diamondT * 0.6
    diamondLight.intensity = 1.8 + Math.sin(diamondT * 3) * 0.5
    // Pulse halo size
    halo.scaling.setAll(1 + Math.sin(diamondT * 2) * 0.08)
  })

  // ── Character (async GLTF) ──
  let character = null
  buildCharacter(characterKey, scene).then(char => {
    character = char
    char.root.position.set(0, 0, 5)
    char.root.rotation.y = Math.PI
  })

  // ── Camera — theatrical stage view ──
  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 4.5, 17), scene)
  camera.setTarget(new BABYLON.Vector3(0, 2, 5))
  camera.minZ = 0.1
  camera.fov = 0.9

  // ── Glow layer — high intensity for magical diamond room ──
  const glow = new BABYLON.GlowLayer('glow', scene)
  glow.intensity = 1.0

  // ── Post-processing: bloom + MSAA ──
  const pipeline = new BABYLON.DefaultRenderingPipeline('pipeline', true, scene, [camera])
  pipeline.samples = 4
  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.6
  pipeline.bloomWeight = 0.6
  pipeline.bloomKernel = 64
  pipeline.bloomScale = 0.5

  // ── Moonlight mote particles drifting in from window ──
  const PARTICLE_TEX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAG0lEQVQoU2NkYGD4z8BAAoxqIKaBUQ2kBgIABbYAAfJFuNoAAAAASUVORK5CYII='
  const motes = new BABYLON.ParticleSystem('motes', 40, scene)
  motes.particleTexture = new BABYLON.Texture(PARTICLE_TEX, scene)
  motes.emitter = new BABYLON.Vector3(0, 4, -7)
  motes.minEmitBox = new BABYLON.Vector3(-1.5, -1.5, 0)
  motes.maxEmitBox = new BABYLON.Vector3(1.5, 1.5, 0)
  motes.color1 = new BABYLON.Color4(0.8, 0.95, 1, 0.6)
  motes.color2 = new BABYLON.Color4(0.95, 0.98, 1, 0.4)
  motes.colorDead = new BABYLON.Color4(1, 1, 1, 0)
  motes.minSize = 0.04
  motes.maxSize = 0.12
  motes.minLifeTime = 5
  motes.maxLifeTime = 10
  motes.emitRate = 6
  motes.direction1 = new BABYLON.Vector3(-0.5, 0.5, 1)
  motes.direction2 = new BABYLON.Vector3(0.5, 1.5, 2)
  motes.gravity = new BABYLON.Vector3(0, 0.05, 0)
  motes.start()

  // ── Stars ──
  const stars = BEDROOM_STARS.map((pos, i) =>
    createStar(`bed_${i}`, new BABYLON.Vector3(pos.x, pos.y, pos.z), scene, () => {
      callbacks.onStarCollected()
    })
  )

  // ── Tap to move ──
  let targetPos = null

  scene.onPointerDown = (_evt, pick) => {
    if (pick.hit && pick.pickedMesh && pick.pickedMesh.name === 'bed_floor') {
      targetPos = pick.pickedPoint.clone()
      targetPos.y = 0
      targetPos.x = Math.max(-5.5, Math.min(5.5, targetPos.x))
      targetPos.z = Math.max(-6.5, Math.min(5, targetPos.z))
    }
  }

  const SPEED = 5

  scene.registerBeforeRender(() => {
    if (!character) return   // wait for GLTF

    const dt = scene.getEngine().getDeltaTime() / 1000
    const pos = character.root.position

    if (targetPos) {
      const dir = targetPos.subtract(pos)
      dir.y = 0
      if (dir.length() > 0.25) {
        dir.normalize()
        pos.addInPlace(dir.scale(SPEED * dt))
        character.root.rotation.y = Math.atan2(dir.x, dir.z)
        character.setWalking(true)
      } else {
        targetPos = null
        character.setWalking(false)
      }
    } else {
      character.setWalking(false)
    }
    pos.y = 0

    // Theatrical stage camera
    const STAGE_OFFSET = new BABYLON.Vector3(0, 4.5, 12)
    camera.position = BABYLON.Vector3.Lerp(camera.position, pos.add(STAGE_OFFSET), 0.07)
    camera.setTarget(BABYLON.Vector3.Lerp(
      camera.getTarget(), pos.add(new BABYLON.Vector3(0, 2, 0)), 0.1
    ))

    // Star collection
    stars.forEach(star => {
      if (!star.collected) {
        const d = BABYLON.Vector3.Distance(pos, star.root.position)
        if (d < 1.5) star.collect()
      }
    })

    // Diamond collection
    if (!diamondCollected) {
      const dDiamond = BABYLON.Vector3.Distance(pos, diamond.position)
      if (dDiamond < 2.2) {
        diamondCollected = true
        character.celebrate()
        triggerWin()
      }
    }
  })

  function triggerWin() {
    // Big particle burst
    const particleSystem = new BABYLON.ParticleSystem('win_particles', 300, scene)
    particleSystem.particleTexture = new BABYLON.Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAG0lEQVQoU2NkYGD4z8BAAoxqIKaBUQ2kBgIABbYAAfJFuNoAAAAASUVORK5CYII=',
      scene
    )
    particleSystem.emitter = new BABYLON.Vector3(0, 2, -5.5)
    particleSystem.minEmitBox = new BABYLON.Vector3(-3, 0, -3)
    particleSystem.maxEmitBox = new BABYLON.Vector3(3, 0, 3)
    particleSystem.color1 = new BABYLON.Color4(1, 0.9, 0.2, 1)
    particleSystem.color2 = new BABYLON.Color4(0.8, 0.2, 1, 1)
    particleSystem.colorDead = new BABYLON.Color4(0, 0.5, 1, 0)
    particleSystem.minSize = 0.15
    particleSystem.maxSize = 0.5
    particleSystem.minLifeTime = 1.5
    particleSystem.maxLifeTime = 3.0
    particleSystem.emitRate = 120
    particleSystem.direction1 = new BABYLON.Vector3(-3, 8, -3)
    particleSystem.direction2 = new BABYLON.Vector3(3, 12, 3)
    particleSystem.gravity = new BABYLON.Vector3(0, -5, 0)
    particleSystem.start()

    // Make diamond rise and spin fast
    diamond.material.emissiveColor.setAll(1)
    diamondLight.intensity = 8

    setTimeout(() => {
      callbacks.transitionTo('win')
    }, 1200)
  }

  return {
    scene,
    character,
    dispose() {
      scene.dispose()
    },
  }
}
