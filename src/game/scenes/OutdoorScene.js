import * as BABYLON from '@babylonjs/core'
import { buildCharacter } from '../objects/CharacterMesh'
import {
  createStar, createTree, createFlower, createCastle,
  createRollerCoaster, createCarousel, createGround,
  createBalloons, toonMat,
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
  scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.98, 1) // sky blue

  // ── Lighting ──
  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene)
  hemi.intensity = 0.85
  hemi.groundColor = new BABYLON.Color3(0.3, 0.5, 0.3)

  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-1, -2, -1), scene)
  sun.intensity = 0.7
  sun.position = new BABYLON.Vector3(30, 40, 30)

  // Shadow generator
  const shadowGen = new BABYLON.ShadowGenerator(512, sun)
  shadowGen.useBlurExponentialShadowMap = true

  // ── Ground ──
  createGround(scene)

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

  // ── Character ──
  const character = buildCharacter(characterKey, scene)
  character.root.position.set(0, 0, 30)
  character.meshes.forEach(m => shadowGen.addShadowCaster(m))

  // ── Camera ──
  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 8, 38), scene)
  camera.setTarget(new BABYLON.Vector3(0, 1, 28))
  camera.minZ = 0.1

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

    // Camera follow (smooth third-person)
    const behind = new BABYLON.Vector3(
      pos.x - Math.sin(character.root.rotation.y) * 10,
      pos.y + 7,
      pos.z - Math.cos(character.root.rotation.y) * 10
    )
    camera.position = BABYLON.Vector3.Lerp(camera.position, behind, 0.06)
    camera.setTarget(BABYLON.Vector3.Lerp(
      camera.getTarget(), pos.add(new BABYLON.Vector3(0, 1.5, 0)), 0.1
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
      coaster.playRide(character, camera, onDone)
    },

    startCarouselRide(onDone) {
      carousel.playRide(character, onDone)
    },

    dispose() {
      scene.dispose()
    },
  }
}
