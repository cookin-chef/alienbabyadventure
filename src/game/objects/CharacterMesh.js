/**
 * CharacterMesh.js — Loads a rigged GLTF character (HVGirl) from the
 * Babylon.js public CDN, then layers on character-specific accessories
 * (crown, gems, antenna tips).
 *
 * Returns a Promise that resolves to the character controller object,
 * matching the same interface the scenes expect:
 *   { root, meshes, setWalking(bool), celebrate(), dispose() }
 */
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

// Character-specific accessory colours
const CONFIGS = {
  aanya: { gemColor: '#69F0AE', antColor: '#00E5FF' },
  meera: { gemColor: '#40C4FF', antColor: '#FF80AB' },
}

// ── Public CDN (Babylon.js official playground assets) ─────────────────────
const MODEL_BASE = 'https://assets.babylonjs.com/meshes/'
const MODEL_FILE = 'HVGirl.glb'

// ── Gold material (shared between crown parts) ──────────────────────────────
function goldMat(scene) {
  const mat = new BABYLON.StandardMaterial('gold_mat_' + Math.random(), scene)
  mat.diffuseColor  = new BABYLON.Color3(1, 0.84, 0.0)
  mat.emissiveColor = new BABYLON.Color3(0.45, 0.34, 0.0)
  mat.specularColor = new BABYLON.Color3(1, 0.9, 0.3)
  mat.specularPower = 128
  return mat
}

// ── Build crown + antenna accessories ──────────────────────────────────────
function buildAccessories(cfg, scene) {
  const node = new BABYLON.TransformNode('crown_node', scene)
  const gm   = goldMat(scene)

  // Band
  const band = BABYLON.MeshBuilder.CreateCylinder('c_band', {
    diameterTop: 0.17, diameterBottom: 0.19, height: 0.05, tessellation: 20,
  }, scene)
  band.material = gm
  band.parent = node

  // Spikes
  ;[
    { x: 0,     z: 0,    h: 0.12 },
    { x: -0.058, z: 0.05, h: 0.08 },
    { x:  0.058, z: 0.05, h: 0.08 },
  ].forEach(({ x, z, h }, i) => {
    const sp = BABYLON.MeshBuilder.CreateCylinder(`c_sp_${i}`, {
      diameterTop: 0, diameterBottom: 0.026, height: h, tessellation: 5,
    }, scene)
    sp.position.set(x, h / 2 + 0.025, z)
    sp.material = gm
    sp.parent = node
  })

  // Gems
  ;[
    { x: 0,      z: 0.088, c: cfg.gemColor },
    { x: -0.063, z: 0.052, c: '#FF80AB' },
    { x:  0.063, z: 0.052, c: '#FF80AB' },
  ].forEach(({ x, z, c }, i) => {
    const gem = BABYLON.MeshBuilder.CreateSphere(`c_gem_${i}`, {
      diameter: 0.034, segments: 5,
    }, scene)
    gem.position.set(x, 0.032, z)
    const mat = new BABYLON.StandardMaterial(`c_gem_mat_${i}`, scene)
    mat.diffuseColor  = BABYLON.Color3.FromHexString(c)
    mat.emissiveColor = BABYLON.Color3.FromHexString(c)
    gem.material = mat
    gem.parent = node
  })

  // Antenna tips (pulse via emissive sine wave)
  ;[-1, 1].forEach(side => {
    const tip = BABYLON.MeshBuilder.CreateSphere(`ant_tip_${side}`, {
      diameter: 0.042, segments: 5,
    }, scene)
    tip.position.set(side * 0.094, 0.21, 0)
    const mat = new BABYLON.StandardMaterial(`ant_mat_${side}`, scene)
    mat.diffuseColor  = BABYLON.Color3.FromHexString(cfg.antColor)
    mat.emissiveColor = BABYLON.Color3.FromHexString(cfg.antColor)
    tip.material = mat
    tip.parent = node

    let gt = side < 0 ? 0 : 1.2
    scene.registerBeforeRender(() => {
      gt += scene.getEngine().getDeltaTime() / 1000
      mat.emissiveColor.setAll(0.7 + Math.sin(gt * 3) * 0.3)
    })
  })

  return node
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function buildCharacter(characterKey, scene) {
  const cfg = CONFIGS[characterKey] || CONFIGS.aanya

  // Load GLTF from Babylon CDN
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    null, MODEL_BASE, MODEL_FILE, scene,
  )

  const root = result.meshes[0]
  root.scaling.setAll(0.042)   // ≈ 2.1 world units tall
  root.name = 'char_root'

  // Enable shadow receiving on all submeshes
  result.meshes.forEach(m => { m.receiveShadows = true })

  // ── Animations ──
  const animGroups = result.animationGroups
  animGroups.forEach(a => a.stop())
  const idle    = animGroups.find(a => a.name === 'Idle')    ?? animGroups[0]
  const walking = animGroups.find(a => a.name === 'Walking') ?? animGroups[1]
  const samba   = animGroups.find(a => a.name === 'Samba')   ?? animGroups[2]
  idle?.start(true)
  let currentAnim = idle

  // ── Crown + accessories (world-scale, not parented to scaled mesh) ──
  const crown = buildAccessories(cfg, scene)
  scene.registerBeforeRender(() => {
    crown.position.set(root.position.x, root.position.y + 2.2, root.position.z)
    crown.rotation.y = root.rotation.y
  })

  // ── Interface ──────────────────────────────────────────────────────────────

  function setWalking(isWalking) {
    const next = isWalking ? walking : idle
    if (next && next !== currentAnim) {
      currentAnim?.stop()
      next.start(true)
      currentAnim = next
    }
  }

  function celebrate() {
    if (!samba) return
    currentAnim?.stop()
    samba.start(false)
    currentAnim = samba
    samba.onAnimationGroupEndObservable.addOnce(() => {
      idle?.start(true)
      currentAnim = idle
    })
  }

  function dispose() {
    result.meshes.forEach(m => m.dispose())
    animGroups.forEach(a => a.dispose())
    crown.getChildMeshes().forEach(m => m.dispose())
    crown.dispose()
  }

  return {
    root,
    // Only return meshes that have actual geometry (skip TransformNodes)
    get meshes() { return result.meshes.filter(m => m.getTotalVertices && m.getTotalVertices() > 0) },
    setWalking,
    celebrate,
    dispose,
  }
}
