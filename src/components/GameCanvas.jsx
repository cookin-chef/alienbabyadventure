import React, { useEffect, useRef, useCallback } from 'react'
import { Engine } from '@babylonjs/core'
import { createOutdoorScene } from '../game/scenes/OutdoorScene'
import { createCastleScene } from '../game/scenes/CastleScene'
import { createBedroomScene } from '../game/scenes/BedroomScene'

export default function GameCanvas({ state }) {
  const {
    phase, character,
    collectStar, setNearRide, setNearCastle, setNearExit,
    isRiding, setIsRiding, transitionTo,
  } = state

  const canvasRef   = useRef(null)
  const engineRef   = useRef(null)
  const sceneRef    = useRef(null)  // current active scene object

  // ── Bootstrap Babylon engine once ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    })
    engineRef.current = engine

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)
    engine.runRenderLoop(() => {
      if (sceneRef.current?.scene) {
        sceneRef.current.scene.render()
      }
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.stopRenderLoop()
      sceneRef.current?.dispose()
      engine.dispose()
    }
  }, [])

  // ── Callbacks passed to scenes ─────────────────────────────────────────────
  const makeCallbacks = useCallback(() => ({
    onStarCollected: collectStar,
    setNearRide,
    setNearCastle,
    setNearExit,
    transitionTo,
  }), [collectStar, setNearRide, setNearCastle, setNearExit, transitionTo])

  // ── Load / swap scene when phase changes ────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    // Dispose previous scene
    if (sceneRef.current) {
      sceneRef.current.dispose()
      sceneRef.current = null
    }
    setNearRide(null)
    setNearCastle(false)
    setNearExit(false)

    const cb = makeCallbacks()

    if (phase === 'outdoor') {
      sceneRef.current = createOutdoorScene(engine, character, cb)
    } else if (phase === 'castle') {
      sceneRef.current = createCastleScene(engine, character, cb)
    } else if (phase === 'bedroom') {
      sceneRef.current = createBedroomScene(engine, character, cb)
    }
  }, [phase, character]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle ride button press ────────────────────────────────────────────────
  function handleRide() {
    if (!sceneRef.current || isRiding) return
    setIsRiding(true)
    setNearRide(null)

    const { nearRide } = state
    if (nearRide === 'coaster') {
      sceneRef.current.startCoasterRide?.(() => {
        setIsRiding(false)
        collectStar()
        collectStar() // 2 bonus stars for riding
      })
    } else if (nearRide === 'carousel') {
      sceneRef.current.startCarouselRide?.(() => {
        setIsRiding(false)
        collectStar()
        collectStar()
      })
    }
  }

  function handleEnterCastle() {
    sceneRef.current?.enterCastle?.()
  }

  function handleEnterBedroom() {
    sceneRef.current?.enterBedroom?.()
  }

  const { nearRide, nearCastle, nearExit } = state

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
        onContextMenu={e => e.preventDefault()}
      />

      {/* HUD overlay */}
      <HUD state={state} />

      {/* Prompt buttons */}
      {nearRide && !isRiding && (
        <PromptBtn
          icon={nearRide === 'coaster' ? '🎢' : '🎠'}
          label={nearRide === 'coaster' ? 'Ride the Coaster!' : 'Ride the Carousel!'}
          onClick={handleRide}
          color="#E040FB"
        />
      )}
      {nearCastle && phase === 'outdoor' && (
        <PromptBtn
          icon="🏰"
          label="Enter the Castle!"
          onClick={handleEnterCastle}
          color="#7C4DFF"
        />
      )}
      {nearExit && phase === 'castle' && (
        <PromptBtn
          icon="🚪"
          label="Enter the Bedroom!"
          onClick={handleEnterBedroom}
          color="#AB47BC"
        />
      )}

      {/* Riding banner */}
      {isRiding && (
        <div style={styles.ridingBanner}>
          🎢 Wheee! Hold on tight! 🎢
        </div>
      )}
    </div>
  )
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function HUD({ state }) {
  const { stars, totalStars, phase } = state

  const phaseLabel = {
    outdoor: '🌳 Theme Park',
    castle:  '🏰 Castle Hallway',
    bedroom: '💎 Royal Bedroom',
  }[phase] || ''

  return (
    <div style={styles.hud}>
      {/* Stars */}
      <div style={styles.starCounter}>
        <span style={{ fontSize: 28 }}>⭐</span>
        <span style={styles.starNum}>{stars}</span>
        <span style={styles.starTotal}>/{totalStars}</span>
      </div>

      {/* Location */}
      <div style={styles.location}>{phaseLabel}</div>

      {/* Hint */}
      <div style={styles.hint}>Tap the ground to walk</div>
    </div>
  )
}

// ── Prompt Button ─────────────────────────────────────────────────────────────

function PromptBtn({ icon, label, onClick, color }) {
  return (
    <button
      style={{ ...styles.promptBtn, background: color, boxShadow: `0 6px 30px ${color}80` }}
      onClick={onClick}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={styles.promptLabel}>{label}</span>
    </button>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  hud: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
    pointerEvents: 'none',
    gap: 12,
  },
  starCounter: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'rgba(0,0,0,0.4)', borderRadius: 30,
    padding: '6px 14px', backdropFilter: 'blur(6px)',
    border: '1.5px solid rgba(255,235,59,0.3)',
  },
  starNum: {
    fontSize: 24, fontWeight: 900, color: '#FFD700',
    textShadow: '0 2px 6px rgba(255,193,7,0.6)',
  },
  starTotal: { fontSize: 16, color: '#FFF9C4', opacity: 0.8 },
  location: {
    fontSize: 'clamp(12px, 3vw, 16px)', color: '#fff', fontWeight: 700,
    textShadow: '0 2px 6px rgba(0,0,0,0.6)', textAlign: 'center', flex: 1,
  },
  hint: {
    fontSize: 'clamp(10px, 2.5vw, 13px)', color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  promptBtn: {
    position: 'absolute', bottom: 40, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 12,
    color: '#fff', fontWeight: 900,
    fontSize: 'clamp(16px, 4vw, 20px)',
    padding: '16px 32px', borderRadius: 50,
    minWidth: 260, justifyContent: 'center',
    animation: 'promptPulse 1s ease-in-out infinite',
    zIndex: 100,
  },
  promptLabel: { letterSpacing: 0.5 },
  ridingBanner: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    color: '#fff', fontSize: 'clamp(20px, 5vw, 32px)',
    fontWeight: 900, padding: '20px 40px', borderRadius: 20,
    border: '2px solid rgba(255,255,255,0.2)',
    animation: 'promptPulse 0.8s ease-in-out infinite',
    pointerEvents: 'none', zIndex: 200,
  },
}
