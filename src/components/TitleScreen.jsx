import React, { useEffect, useRef } from 'react'

export default function TitleScreen({ state }) {
  const { transitionTo } = state
  const starsRef = useRef([])

  useEffect(() => {
    // Generate random star positions once
    starsRef.current = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      dur: Math.random() * 2 + 1.5,
    }))
  }, [])

  return (
    <div style={styles.container}>
      {/* Starfield */}
      <div style={styles.stars}>
        {starsRef.current.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: '#fff',
            animation: `twinkle ${s.dur}s ${s.delay}s infinite alternate`,
            opacity: 0.7,
          }} />
        ))}
      </div>

      {/* Castle silhouette background */}
      <div style={styles.castleSilhouette} />

      {/* Title card */}
      <div style={styles.titleCard}>
        <div style={styles.sparkleRow}>✨ ✨ ✨</div>
        <h1 style={styles.title}>Alien Baby</h1>
        <h1 style={styles.titleLine2}>Adventure</h1>
        <div style={styles.subtitle}>A Magical Castle Journey</div>
        <div style={styles.sparkleRow}>🌟 💎 🌟</div>
      </div>

      {/* Characters preview */}
      <div style={styles.charPreview}>
        <div style={styles.charItem}>
          <div style={{ ...styles.charCircle, background: 'linear-gradient(135deg, #4caf50, #2e7d32)' }}>
            <span style={styles.charEmoji}>🧜‍♀️</span>
          </div>
          <div style={{ ...styles.charName, color: '#69f0ae' }}>Aanya</div>
        </div>
        <div style={styles.charItem}>
          <div style={{ ...styles.charCircle, background: 'linear-gradient(135deg, #2196f3, #0d47a1)' }}>
            <span style={styles.charEmoji}>🧜‍♀️</span>
          </div>
          <div style={{ ...styles.charName, color: '#40c4ff' }}>Meera</div>
        </div>
      </div>

      {/* Start button */}
      <button style={styles.startBtn} onClick={() => transitionTo('charSelect')}>
        <span style={styles.btnIcon}>🏰</span>
        Let's Adventure!
        <span style={styles.btnIcon}>🏰</span>
      </button>

      <div style={styles.hint}>Collect ⭐ stars · Ride the coaster · Find the 💎 diamond!</div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2 } to { opacity: 1 } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
        @keyframes shimmer { 0%,100% { opacity: 1 } 50% { opacity: 0.7 } }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at 50% 30%, #2a0a5e 0%, #0d0021 70%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 20, padding: 20, overflow: 'hidden',
  },
  stars: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  castleSilhouette: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
    background: 'linear-gradient(180deg, transparent 0%, #0a0020 100%)',
    pointerEvents: 'none',
  },
  titleCard: {
    textAlign: 'center', zIndex: 10,
    animation: 'float 3s ease-in-out infinite',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(8px)',
    border: '2px solid rgba(224,64,251,0.4)',
    borderRadius: 28, padding: '24px 40px',
    boxShadow: '0 0 60px rgba(124,77,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 'clamp(36px, 8vw, 64px)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fff 0%, #e040fb 50%, #7c4dff 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: 2, lineHeight: 1.1,
    filter: 'drop-shadow(0 2px 8px rgba(224,64,251,0.6))',
  },
  titleLine2: {
    fontSize: 'clamp(36px, 8vw, 64px)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ffeb3b 0%, #ff9800 50%, #e040fb 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: 2, lineHeight: 1.1,
    filter: 'drop-shadow(0 2px 8px rgba(255,152,0,0.5))',
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 20px)',
    color: '#ce93d8', marginTop: 8, letterSpacing: 1,
  },
  sparkleRow: { fontSize: 'clamp(18px, 4vw, 28px)', margin: '6px 0' },
  charPreview: {
    display: 'flex', gap: 32, zIndex: 10,
    animation: 'float 3.5s ease-in-out 0.5s infinite',
  },
  charItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  charCircle: {
    width: 80, height: 80, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.1)',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  charEmoji: { fontSize: 40 },
  charName: {
    fontSize: 18, fontWeight: 900,
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  startBtn: {
    zIndex: 10,
    background: 'linear-gradient(135deg, #7c4dff, #e040fb)',
    color: '#fff', fontSize: 'clamp(18px, 4vw, 24px)',
    fontWeight: 900, padding: '18px 40px',
    borderRadius: 50, letterSpacing: 1,
    boxShadow: '0 6px 30px rgba(224,64,251,0.5), 0 2px 0 rgba(0,0,0,0.3)',
    animation: 'pulse 1.5s ease-in-out infinite',
    display: 'flex', alignItems: 'center', gap: 12,
    minWidth: 280, justifyContent: 'center',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  btnIcon: { fontSize: 24 },
  hint: {
    zIndex: 10, fontSize: 'clamp(12px, 2.5vw, 15px)',
    color: '#9e9e9e', textAlign: 'center',
  },
}
