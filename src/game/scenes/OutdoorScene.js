import * as BABYLON from '@babylonjs/core'
import { buildCharacter } from '../objects/CharacterMesh'
import {
  createStar, createTree, createFlower, createCastle,
  createRollerCoaster, createCarousel, createGround,
  createBalloons, toonMat, makeStoneTex, makeWoodTex,
} from '../objects/WorldObjects'

// Star positions outside the castle
const OUTDOOR_STARS = [
  { x: -5,  y: 0.8, z: 28 },  // near start
  { x:  4,  y: 0.8, z: 24 },
  { x: -8,  y: 0.8, z: 18 },
  { x:  7,  y: 0.8, z: 14 },
  { x: -12, y: 3.5, z:  8 },  // near coaster
  { x: -10, y: 5.0, z:  2 },  // on coaster hill
  { x:  12, y: 0.8, z:  6 },  // near carousel
  { x:   8, y: 0.8, z: -2 },
]

export function createOutdoorScene(engine, characterKey, callbacks) {
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.38, 0.68, 0.95, 1) // deep sky blue

  // ── Atmospheric fog ──
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP
  scene.fogDensity = 0.006
  scene.fogColor = new BABYLON.Color3(0.82, 0.91, 0.99)

  // ── Sky dome ──
  const skyDome = BABYLON.MeshBuilder.CreateSphere('skyDome', {
    diameter: 300, sideOrientation: BABYLON.Mesh.BACKSIDE, segments: 8,
  }, scene)
  skyDome.isPickable = false
  const skyMat = new BABYLON.StandardMaterial('skyMat', scene)
  skyMat.emissiveColor = new BABYLON.Color3(0.42, 0.72, 0.96)
  skyMat.disableLighting = true
  skyMat.backFaceCulling = false
  skyDome.material = skyMat

  // ── Lighting ──
  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene)
  hemi.intensity = 0.85
  hemi.groundColor = new BABYLON.Color3(0.3, 0.5, 0.3)

  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-1, -2, -1), scene)
  sun.intensity = 0.9
  sun.position = new BABYLON.Vector3(30, 40, 30)

  // Shadow generator — higher res for sharper shadows
  const shadowGen = new BABYLON.ShadowGenerator(1024, sun)
  shadowGen.useBlurExponentialShadowMap = true
  shadowGen.blurScale = 2

  // ── Ground (grass + textured stone path) ──
  const groundMesh = createGround(scene)

  // Overlay a textured stone path on top of the plain ground
  const pathMat = new BABYLON.StandardMaterial('path_mat', scene)
  pathMat.diffuseTexture = makeStoneTex(scene, '#C8B89A')
  pathMat.diffuseTexture.uScale = 4
  pathMat.diffuseTexture.vScale = 20
  pathMat.emissiveColor = new BABYLON.Color3(0.06, 0.05, 0.04)
  pathMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1)
  const path = BABYLON.MeshBuilder.CreateBox('path_surface', { width: 5, height: 0.04, depth: 60 }, scene)
  path.position.set(0, 0.02, 5)
  path.material = pathMat
  path.receiveShadows = true

  // ── Castle (far end) ──
  const { root: castleRoot } = createCastle(scene)
  castleRoot.position.set(0, 0, -22)
  castleRoot.getChildMeshes().forEach(m => shadowGen.addShadowCaster(m))

  // Castle door trigger zone
  const castleDoorPos = new BABYLON.Vector3(0, 0, -17)

  // ── Roller coaster (left) ──
  const coaster = createRollerCoaster(-18, 8, scene)

  // ── Carousel (right) ──
  const carousel = createCarousel(18, 6, scene)

  // ── Trees ──
  const treeData = [
    [-6, 32], [5, 32], [-9, 26], [8, 26], [-11, 20], [9, 20],
    [-14, 12], [12, 12], [-15, 4], [13, 4],
    [-14, -4], [14, -4], [-13, -10], [13, -10],
    [-6, -16], [6, -16], [-4, -20], [4, -20],
    // Along sides of path
    [-4, 30], [4, 30], [-3, 15], [3, 15], [-3, 0], [3, 0],
  ]
  treeData.forEach(([x, z]) => {
    createTree(x, z, scene,
      Math.random() > 0.5 ? '#2E7D32' : '#388E3C',
      3 + Math.random() * 2
    )
  })

  // ── Flowers ──
  const flowerColors = ['#E91E63', '#FF5722', '#FFEB3B', '#9C27B0', '#2196F3']
  for (let i = 0; i < 30; i++) {
    createFlower(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 50 + 5,
      scene,
      flowerColors[i % flowerColors.length]
    )
  }

  // ── Balloons ──
  createBalloons(-3, 25, scene)
  createBalloons(3, 22, scene)
  createBalloons(-8, 15, scene)
  createBalloons(10, 12, scene)
  createBalloons(-5, -5, scene)
  createBalloons(5, -8, scene)

  // ── Lamp posts along path ──
  for (let z = 25; z >= -15; z -= 6) {
    for (const sx of [-3.5, 3.5]) {
      const pole = BABYLON.MeshBuilder.CreateCylinder(`lamp_${sx}_${z}`, {
        diameter: 0.18, height: 4, tessellation: 7,
      }, scene)
      pole.position.set(sx, 2, z)
      pole.material = toonMat(`lamp_mat`, '#546E7A', scene)

      const bulb = BABYLON.MeshBuilder.CreateSphere(`bulb_${sx}_${z}`, {
        diameter: 0.5, segments: 5,
      }, scene)
      bulb.position.set(sx, 4.3, z)
      bulb.material = toonMat(`bulb_mat_${sx}_${z}`, '#FFF9C4', scene, { emissive: 0.9 })
    }
  }

  // ── Character (async GLTF — scene renders immediately, character appears when loaded) ──
  let character = null
  buildCharacter(characterKey, scene).then(char => {
    character = char
    char.root.position.set(0, 0, 30)
    char.root.rotation.y = Math.PI
    char.meshes.forEach(m => shadowGen.addShadowCaster(m))
  })

  // ── Camera — theatrical stage view (directly in front, eye level) ──
  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 4.5, 46), scene)
  camera.setTarget(new BABYLON.Vector3(0, 2, 30))
  camera.minZ = 0.1
  camera.fov = 0.9

  // ── Glow layer (emissive meshes bloom) ──
  const glow = new BABYLON.GlowLayer('glow', scene)
  glow.intensity = 0.55

  // ── Post-processing: bloom + MSAA ──
  const pipeline = new BABYLON.DefaultRenderingPipeline('pipeline', true, scene, [camera])
  pipeline.samples = 4
  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.78
  pipeline.bloomWeight = 0.35
  pipeline.bloomKernel = 64
  pipeline.bloomScale = 0.5

  // ── Ambient sparkle particles (floating dust / magic motes) ──
  const PARTICLE_TEX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAG0lEQVQoU2NkYGD4z8BAAoxqIKaBUQ2kBgIABbYAAfJFuNoAAAAASUVORK5CYII='
  const sparkles = new BABYLON.ParticleSystem('sparkles', 100, scene)
  sparkles.particleTexture = new BABYLON.Texture(PARTICLE_TEX, scene)
  sparkles.emitter = new BABYLON.Vector3(0, 1, 5)
  sparkles.minEmitBox = new BABYLON.Vector3(-22, 0, -25)
  sparkles.maxEmitBox = new BABYLON.Vector3(22, 5, 35)
  sparkles.color1 = new BABYLON.Color4(1, 0.98, 0.7, 0.7)
  sparkles.color2 = new BABYLON.Color4(0.85, 0.97, 1, 0.5)
  sparkles.colorDead = new BABYLON.Color4(1, 1, 1, 0)
  sparkles.minSize = 0.05
  sparkles.maxSize = 0.18
  sparkles.minLifeTime = 5
  sparkles.maxLifeTime = 9
  sparkles.emitRate = 14
  sparkles.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2)
  sparkles.direction2 = new BABYLON.Vector3(0.2, 2.5, 0.2)
  sparkles.gravity = new BABYLON.Vector3(0, -0.06, 0)
  sparkles.start()

  // ── Stars ──
  const stars = OUTDOOR_STARS.map((pos, i) =>
    createStar(i, new BABYLON.Vector3(pos.x, pos.y, pos.z), scene, () => {
      callbacks.onStarCollected()
    })
  )

  // ── Tap to move ──
  let targetPos = null
  const ground = scene.getMeshByName('ground')

  scene.onPointerDown = (evt, pick) => {
    if (pick.hit && pick.pickedMesh && pick.pickedMesh.name === 'ground') {
      targetPos = pick.pickedPoint.clone()
      targetPos.y = 0
    }
  }

  // ── Update loop ──
  const SPEED = 7
  let nearCoaster = false
  let nearCarousel = false
  let nearDoor = false

  scene.registerBeforeRender(() => {
    if (!character) return   // wait for GLTF to load

    const dt = scene.getEngine().getDeltaTime() / 1000
    const pos = character.root.position

    // Move toward target
    if (targetPos) {
      const dir = targetPos.subtract(pos)
      dir.y = 0
      const dist = dir.length()
      if (dist > 0.25) {
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

    // Clamp to ground
    pos.y = 0

    // Theatrical stage camera — in front of character at eye level
    const STAGE_OFFSET = new BABYLON.Vector3(0, 4.5, 16)
    camera.position = BABYLON.Vector3.Lerp(camera.position, pos.add(STAGE_OFFSET), 0.06)
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

    // Proximity checks
    const dCoaster  = BABYLON.Vector3.Distance(pos, coaster.center)
    const dCarousel = BABYLON.Vector3.Distance(pos, carousel.center)
    const dDoor     = BABYLON.Vector3.Distance(pos, castleDoorPos)

    if (dCoaster < 4 !== nearCoaster) {
      nearCoaster = dCoaster < 4
      callbacks.setNearRide(nearCoaster ? 'coaster' : null)
    }
    if (!nearCoaster && dCarousel < 4 !== nearCarousel) {
      nearCarousel = dCarousel < 4
      callbacks.setNearRide(nearCarousel ? 'carousel' : (nearCoaster ? 'coaster' : null))
    }
    if (dDoor < 3.5 !== nearDoor) {
      nearDoor = dDoor < 3.5
      callbacks.setNearCastle(nearDoor)
    }
  })

  return {
    scene,
    character,
    camera,
    coaster,
    carousel,

    enterCastle() {
      callbacks.transitionTo('castle')
    },

    startCoasterRide(onDone) {
      if (character) coaster.playRide(character, camera, onDone)
    },

    startCarouselRide(onDone) {
      if (character) carousel.playRide(character, onDone)
    },

    dispose() {
      scene.dispose()
    },
  }
}
