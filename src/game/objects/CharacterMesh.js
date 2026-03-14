import * as BABYLON from '@babylonjs/core'

const CONFIGS = {
  aanya: {
    dressColor: new BABYLON.Color3(0.22, 0.55, 0.24),
    skinColor:  new BABYLON.Color3(0.65, 0.85, 0.65),
    wigColor:   new BABYLON.Color3(0.83, 0.18, 0.18),
    tailColor:  new BABYLON.Color3(0.0,  0.90, 1.0),
    outlineColor: new BABYLON.Color3(0.1, 0.3, 0.1),
  },
  meera: {
    dressColor: new BABYLON.Color3(0.13, 0.59, 0.95),
    skinColor:  new BABYLON.Color3(0.65, 0.85, 0.65),
    wigColor:   new BABYLON.Color3(0.91, 0.12, 0.39),
    tailColor:  new BABYLON.Color3(0.0,  0.90, 1.0),
    outlineColor: new BABYLON.Color3(0.05, 0.2, 0.4),
  },
}

function mat(name, color, scene, emissive = 0.25) {
  const m = new BABYLON.StandardMaterial(name, scene)
  m.diffuseColor = color
  m.emissiveColor = color.scale(emissive)
  m.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05)
  return m
}

function outline(mesh, width = 0.04) {
  mesh.renderOutline = true
  mesh.outlineColor = new BABYLON.Color3(0.05, 0.02, 0.1)
  mesh.outlineWidth = width
}

export function buildCharacter(characterKey, scene) {
  const cfg = CONFIGS[characterKey] || CONFIGS.aanya
  const root = new BABYLON.TransformNode('character_root', scene)

  // ── Tail (bottom) ──
  const tail = BABYLON.MeshBuilder.CreateCylinder('tail', {
    diameterTop: 0.35, diameterBottom: 0.55, height: 0.9,
    tessellation: 12,
  }, scene)
  tail.position.y = 0.45
  tail.material = mat('tail_mat', cfg.tailColor, scene)
  outline(tail)
  tail.parent = root

  // Tail fin
  const fin = BABYLON.MeshBuilder.CreateBox('fin', { width: 0.7, height: 0.15, depth: 0.25 }, scene)
  fin.position.y = 0.05
  fin.scaling.z = 0.6
  fin.material = mat('fin_mat', cfg.tailColor.scale(0.8), scene)
  outline(fin, 0.03)
  fin.parent = root

  // ── Dress body ──
  const dress = BABYLON.MeshBuilder.CreateCylinder('dress', {
    diameterTop: 0.55, diameterBottom: 0.85, height: 0.8,
    tessellation: 12,
  }, scene)
  dress.position.y = 1.25
  dress.material = mat('dress_mat', cfg.dressColor, scene)
  outline(dress)
  dress.parent = root

  // ── Head ──
  const head = BABYLON.MeshBuilder.CreateSphere('head', {
    diameter: 0.65, segments: 10,
  }, scene)
  head.position.y = 2.05
  head.material = mat('skin_mat', cfg.skinColor, scene)
  outline(head)
  head.parent = root

  // ── Wig ──
  const wig = BABYLON.MeshBuilder.CreateSphere('wig', {
    diameter: 0.62, segments: 8, arc: 0.55,
  }, scene)
  wig.position.y = 2.35
  wig.rotation.x = Math.PI
  wig.material = mat('wig_mat', cfg.wigColor, scene)
  outline(wig, 0.03)
  wig.parent = root

  // Wig sides (puffs)
  for (const side of [-1, 1]) {
    const puff = BABYLON.MeshBuilder.CreateSphere('puff', {
      diameter: 0.28, segments: 6,
    }, scene)
    puff.position.set(side * 0.25, 2.2, 0)
    puff.material = mat('puff_mat', cfg.wigColor, scene)
    outline(puff, 0.025)
    puff.parent = root
  }

  // ── Eyes ──
  for (const side of [-1, 1]) {
    const eyeWhite = BABYLON.MeshBuilder.CreateSphere('eyeW', {
      diameter: 0.18, segments: 6,
    }, scene)
    eyeWhite.position.set(side * 0.17, 2.08, 0.27)
    eyeWhite.material = mat('eye_white', new BABYLON.Color3(1, 1, 1), scene, 0.5)
    eyeWhite.parent = root

    const pupil = BABYLON.MeshBuilder.CreateSphere('pupil', {
      diameter: 0.11, segments: 6,
    }, scene)
    pupil.position.set(side * 0.17, 2.07, 0.3)
    pupil.material = mat('pupil_mat', new BABYLON.Color3(0.08, 0.06, 0.18), scene, 0.2)
    pupil.parent = root

    // Eye shine
    const shine = BABYLON.MeshBuilder.CreateSphere('shine', {
      diameter: 0.04, segments: 4,
    }, scene)
    shine.position.set(side * 0.14, 2.1, 0.32)
    shine.material = mat('shine_mat', new BABYLON.Color3(1, 1, 1), scene, 1)
    shine.parent = root
  }

  // ── Antennae ──
  for (const side of [-1, 1]) {
    const stick = BABYLON.MeshBuilder.CreateCylinder('ant', {
      diameter: 0.04, height: 0.35, tessellation: 6,
    }, scene)
    stick.position.set(side * 0.18, 2.55, 0)
    stick.rotation.z = side * 0.3
    stick.material = mat('ant_mat', cfg.skinColor, scene)
    stick.parent = root

    const tip = BABYLON.MeshBuilder.CreateSphere('antTip', {
      diameter: 0.1, segments: 5,
    }, scene)
    tip.position.set(side * 0.24, 2.75, 0)
    tip.material = mat('antTip_mat', new BABYLON.Color3(1, 0.5, 0.67), scene, 0.6)
    outline(tip, 0.02)
    tip.parent = root
  }

  // Blush
  for (const side of [-1, 1]) {
    const blush = BABYLON.MeshBuilder.CreateSphere('blush', {
      diameter: 0.14, segments: 5,
    }, scene)
    blush.position.set(side * 0.24, 2.0, 0.26)
    const bm = mat('blush_mat', new BABYLON.Color3(1, 0.5, 0.67), scene, 0.5)
    bm.alpha = 0.45
    blush.material = bm
    blush.parent = root
  }

  // ── Collect all meshes ──
  const meshes = root.getChildMeshes()

  // Shadow for all
  meshes.forEach(m => {
    m.receiveShadows = true
  })

  // ── Walk bob animation ──
  let walkTime = 0
  let isWalking = false
  let walkBob = 0

  root.getScene().registerBeforeRender(() => {
    if (isWalking) {
      walkTime += root.getScene().getEngine().getDeltaTime() / 1000
      walkBob = Math.sin(walkTime * 8) * 0.06
      root.position.y = walkBob
    } else {
      walkBob = 0
      root.position.y = BABYLON.Scalar.Lerp(root.position.y, 0, 0.15)
    }
  })

  return {
    root,
    meshes,
    setWalking: (v) => { isWalking = v },

    // Celebration spin
    celebrate() {
      let t = 0
      const id = root.getScene().registerBeforeRender(() => {
        t += root.getScene().getEngine().getDeltaTime() / 1000
        root.rotation.y = t * 4
        root.position.y = Math.abs(Math.sin(t * 6)) * 0.4
        if (t > 2.5) {
          root.getScene().unregisterBeforeRender(id)
          root.rotation.y = 0
          root.position.y = 0
        }
      })
    },
  }
}
