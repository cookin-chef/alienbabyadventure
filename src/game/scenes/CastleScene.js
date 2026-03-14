import * as BABYLON from '@babylonjs/core'
import { buildCharacter } from '../objects/CharacterMesh'
import { createStar, toonMat } from '../objects/WorldObjects'

// 5 stars inside the castle hallway
const CASTLE_STARS = [
  { x: -4, y: 1.2, z: 6  },
  { x:  4, y: 1.2, z: 3  },
  { x: -3, y: 2.0, z: -2 },
  { x:  3, y: 1.2, z: -6 },
  { x:  0, y: 1.5, z: -10 },
]

export function createCastleScene(engine, characterKey, callbacks) {
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.12, 0.06, 0.22, 1)

  // ── Lighting ──
  const ambient = new BABYLON.HemisphericLight('amb', new BABYLON.Vector3(0, 1, 0), scene)
  ambient.intensity = 0.5
  ambient.groundColor = new BABYLON.Color3(0.1, 0.05, 0.15)

  // Torch lights along hallway
  const torchColors = [
    new BABYLON.Color3(1, 0.6, 0.2),
    new BABYLON.Color3(0.9, 0.4, 0.8),
    new BABYLON.Color3(0.4, 0.7, 1.0),
  ]
  const torchPosns = [
    [-3.5, 2.5,  4], [3.5, 2.5,  4],
    [-3.5, 2.5, -2], [3.5, 2.5, -2],
    [-3.5, 2.5, -8], [3.5, 2.5, -8],
  ]
  torchPosns.forEach(([x, y, z], i) => {
    const light = new BABYLON.PointLight(`torch_${i}`, new BABYLON.Vector3(x, y, z), scene)
    light.diffuse = torchColors[i % torchColors.length]
    light.intensity = 0.8
    light.range = 8
    // Flicker
    let ft = i * 0.7
    scene.registerBeforeRender(() => {
      ft += scene.getEngine().getDeltaTime() / 1000
      light.intensity = 0.7 + Math.sin(ft * 7 + i) * 0.15
    })
  })

  // ── Hallway geometry ──
  const wallMat  = toonMat('hall_wall', '#3E2723', scene, { emissive: 0.08 })
  const floorMat = toonMat('hall_floor', '#FAFAFA', scene, { emissive: 0.06 })
  const ceilMat  = toonMat('hall_ceil', '#4A148C', scene, { emissive: 0.12 })
  const carpetMat = toonMat('carpet', '#B71C1C', scene, { emissive: 0.1 })
  const colMat   = toonMat('column', '#F5F5DC', scene, { emissive: 0.1 })
  const doorMat  = toonMat('bed_door', '#6A1B9A', scene, { emissive: 0.25 })

  // Floor
  const floor = BABYLON.MeshBuilder.CreateBox('hall_floor', { width: 10, height: 0.3, depth: 22 }, scene)
  floor.position.set(0, -0.15, -4)
  floor.material = floorMat
  floor.receiveShadows = true

  // Carpet runner
  const carpet = BABYLON.MeshBuilder.CreateBox('carpet', { width: 3, height: 0.05, depth: 20 }, scene)
  carpet.position.set(0, 0.02, -4)
  carpet.material = carpetMat

  // Walls
  const wallL = BABYLON.MeshBuilder.CreateBox('wall_l', { width: 0.5, height: 8, depth: 22 }, scene)
  wallL.position.set(-5, 4, -4)
  wallL.material = wallMat

  const wallR = BABYLON.MeshBuilder.CreateBox('wall_r', { width: 0.5, height: 8, depth: 22 }, scene)
  wallR.position.set(5, 4, -4)
  wallR.material = wallMat

  const wallBack = BABYLON.MeshBuilder.CreateBox('wall_back', { width: 10, height: 8, depth: 0.5 }, scene)
  wallBack.position.set(0, 4, -15.25)
  wallBack.material = wallMat

  // Ceiling
  const ceiling = BABYLON.MeshBuilder.CreateBox('ceiling', { width: 10, height: 0.4, depth: 22 }, scene)
  ceiling.position.set(0, 8.2, -4)
  ceiling.material = ceilMat

  // Arch ceiling details
  for (let z = 4; z >= -12; z -= 4) {
    const arch = BABYLON.MeshBuilder.CreateTorus(`arch_${z}`, {
      diameter: 9, thickness: 0.5, tessellation: 18, arc: 0.5,
    }, scene)
    arch.position.set(0, 8, z)
    arch.rotation.z = Math.PI
    arch.material = toonMat(`arch_mat_${z}`, '#7C4DFF', scene, { emissive: 0.3 })
  }

  // Columns
  for (const side of [-3.8, 3.8]) {
    for (let z = 4; z >= -12; z -= 4) {
      const col = BABYLON.MeshBuilder.CreateCylinder(`col_${side}_${z}`, {
        diameter: 0.7, height: 8, tessellation: 10,
      }, scene)
      col.position.set(side, 4, z)
      col.material = colMat

      // Column base
      const base = BABYLON.MeshBuilder.CreateBox(`col_base_${side}_${z}`, {
        width: 1, height: 0.4, depth: 1,
      }, scene)
      base.position.set(side, 0.2, z)
      base.material = colMat

      // Column capital
      const cap = BABYLON.MeshBuilder.CreateBox(`col_cap_${side}_${z}`, {
        width: 1, height: 0.4, depth: 1,
      }, scene)
      cap.position.set(side, 8.0, z)
      cap.material = colMat
    }
  }

  // Torch holders (glowing sconces)
  torchPosns.forEach(([tx, ty, tz], i) => {
    const holder = BABYLON.MeshBuilder.CreateBox(`sconce_${i}`, {
      width: 0.4, height: 0.4, depth: 0.2,
    }, scene)
    holder.position.set(tx, ty, tz)
    holder.material = toonMat(`sconce_mat`, '#795548', scene)

    const flame = BABYLON.MeshBuilder.CreateSphere(`flame_${i}`, {
      diameter: 0.35, segments: 4,
    }, scene)
    flame.position.set(tx, ty + 0.3, tz)
    flame.material = toonMat(`flame_mat_${i}`, '#FF9800', scene, { emissive: 0.9 })

    let flameT = i * 0.8
    scene.registerBeforeRender(() => {
      flameT += scene.getEngine().getDeltaTime() / 1000
      flame.scaling.set(
        1 + Math.sin(flameT * 9) * 0.15,
        1 + Math.sin(flameT * 7) * 0.2,
        1 + Math.sin(flameT * 8 + 1) * 0.15
      )
    })
  })

  // Tapestries on walls
  const tapColors = ['#7C4DFF', '#E040FB', '#00E5FF', '#69F0AE']
  for (let i = 0; i < 4; i++) {
    const tap = BABYLON.MeshBuilder.CreateBox(`tap_${i}`, {
      width: 1.8, height: 2.5, depth: 0.1,
    }, scene)
    const side = i % 2 === 0 ? -4.8 : 4.8
    tap.position.set(side, 4.5, 2 - i * 4)
    tap.material = toonMat(`tap_mat_${i}`, tapColors[i], scene, { emissive: 0.3 })
  }

  // Bedroom door (back wall)
  const bedDoor = BABYLON.MeshBuilder.CreateBox('bed_door', { width: 3.5, height: 5, depth: 0.4 }, scene)
  bedDoor.position.set(0, 2.5, -15)
  bedDoor.material = doorMat

  const bedDoorArch = BABYLON.MeshBuilder.CreateTorus('bed_door_arch', {
    diameter: 3.5, thickness: 0.45, tessellation: 14, arc: 0.5,
  }, scene)
  bedDoorArch.position.set(0, 5.1, -15)
  bedDoorArch.rotation.z = Math.PI
  bedDoorArch.material = doorMat

  // Glow on door
  const doorGlow = new BABYLON.PointLight('door_glow', new BABYLON.Vector3(0, 3, -14.5), scene)
  doorGlow.diffuse = new BABYLON.Color3(0.8, 0.3, 1)
  doorGlow.intensity = 1.0
  doorGlow.range = 8
  let doorGlowT = 0
  scene.registerBeforeRender(() => {
    doorGlowT += scene.getEngine().getDeltaTime() / 1000
    doorGlow.intensity = 0.8 + Math.sin(doorGlowT * 2) * 0.3
  })

  // ── Character ──
  const character = buildCharacter(characterKey, scene)
  character.root.position.set(0, 0, 7)
  character.root.rotation.y = Math.PI // face into hallway

  // ── Camera ──
  // Start at isometric offset from character start pos (0, 0, 7)
  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(12, 18, 19), scene)
  camera.setTarget(new BABYLON.Vector3(0, 1, 7))
  camera.minZ = 0.1

  // ── Stars ──
  const stars = CASTLE_STARS.map((pos, i) =>
    createStar(`castle_${i}`, new BABYLON.Vector3(pos.x, pos.y, pos.z), scene, () => {
      callbacks.onStarCollected()
    })
  )

  // ── Tap to move ──
  let targetPos = null
  const groundMesh = scene.getMeshByName('hall_floor')

  scene.onPointerDown = (_evt, pick) => {
    if (pick.hit && pick.pickedMesh && pick.pickedMesh.name === 'hall_floor') {
      targetPos = pick.pickedPoint.clone()
      targetPos.y = 0
      // Clamp to hallway bounds
      targetPos.x = Math.max(-4, Math.min(4, targetPos.x))
      targetPos.z = Math.max(-14, Math.min(6, targetPos.z))
    }
  }

  const SPEED = 6
  let nearBedroom = false

  scene.registerBeforeRender(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000
    const pos = character.root.position

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
    pos.y = 0

    // Camera follow (isometric fixed angle)
    const ISO_OFFSET = new BABYLON.Vector3(12, 18, 12)
    camera.position = BABYLON.Vector3.Lerp(camera.position, pos.add(ISO_OFFSET), 0.07)
    camera.setTarget(BABYLON.Vector3.Lerp(
      camera.getTarget(), pos.add(new BABYLON.Vector3(0, 1, 0)), 0.1
    ))

    // Star collection
    stars.forEach(star => {
      if (!star.collected) {
        const d = BABYLON.Vector3.Distance(pos, star.root.position)
        if (d < 1.5) star.collect()
      }
    })

    // Near bedroom door
    const dDoor = Math.abs(pos.z - (-14.5))
    if (dDoor < 3 !== nearBedroom) {
      nearBedroom = dDoor < 3
      callbacks.setNearExit(nearBedroom)
    }
  })

  return {
    scene,
    character,
    enterBedroom() {
      callbacks.transitionTo('bedroom')
    },
    dispose() {
      scene.dispose()
    },
  }
}
