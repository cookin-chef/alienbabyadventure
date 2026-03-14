import React, { useEffect, useRef } from 'react'

export default function WinScreen({ state }) {
  const { character, stars, totalStars, transitionTo } = state
  const confettiRef = useRef([])

  useEffect(() => {
    confettiRef.current = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#ff5252','#ff9800','#ffeb3b','#69f0ae','#40c4ff','#e040fb','#fff'][i % 7],
      size: Math.random() * 12 + 6,
      delay: Math.random() * 2,
      dur: Math.random() * 2 + 2.5,
      spin: Math.random() * 720 - 360,
      shape: i % 3, // 0=circle, 1=rect, 2=triangle
    }))
  }, [])

  const charName = character === 'aanya' ? 'Aanya' : 'Meera'

  return (
    <div style={styles.container}>
      {/* Confetti */}
      {confettiRef.current.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: `${c.x}%`, top: -20,
          width: c.size,
          height: c.shape === 1 ? c.size * 0.4 : c.size,
          borderRadius: c.shape === 0 ? '50%' : c.shape === 1 ? 2 : 0,
          background: c.color,
          clipPath: c.shape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
          animation: `confettiFall ${c.dur}s ${c.delay}s infinite linear`,
        }} />
      ))}

      {/* Main content */}
      <div style={styles.content}>
        {/* Big diamond */}
        <div style={styles.diamond}>💎</div>

        <div style={styles.youFound}>You found it!</div>

        <h1 style={styles.title}>
          The Magic Diamond!
        </h1>

        <div style={styles.charBadge}>
          <span style={{ fontSize: 48 }}>🧜‍♀️</span>
          <div>
            <div style={styles.charName}>{charName} wins! 🎉</div>
            <div style={styles.charSub}>Amazing adventure, little hero!</div>
          </div>
        </div>

        <div style={styles.starsBox}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <span style={styles.starsText}>{stars} stars collected!</span>
          <span style={{ fontSize: 28 }}>⭐</span>
        </div>

        <div style={styles.message}>
          🌟 You explored the theme park,<br />
          🎢 rode the roller coaster,<br />
          🏰 entered the magical castle,<br />
          💎 and found the diamond bedroom!
        </div>

        <button style={styles.playAgainBtn} onClick={() => transitionTo('title')}>
          🎮 Play Again!
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--spin, 360deg)); opacity: 0.6; }
        }
        @keyframes diamondSpin {
          0%   { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 20px #40c4ff); }
          50%  { transform: scale(1.15) rotate(15deg); filter: drop-shadow(0 0 40px #e040fb); }
          100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 20px #40c4ff); }
        }
        @keyframes titlePop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: translateY(40px); opacity: 0; }
          60% { transform: translateY(-8px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); box-shadow: 0 6px 30px rgba(224,64,251,0.5); }
          50% { transform: scale(1.04); box-shadow: 0 10px 50px rgba(224,64,251,0.8); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at 50% 30%, #1a0050 0%, #0a0020 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, padding: '24px 20px', zIndex: 10,
    maxWidth: 500, width: '100%',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    border: '2px solid rgba(224,64,251,0.3)',
    borderRadius: 32,
    boxShadow: '0 0 80px rgba(124,77,255,0.3)',
  },
  diamond: {
    fontSize: 'clamp(72px, 18vw, 120px)',
    animation: 'diamondSpin 2s ease-in-out infinite',
    lineHeight: 1,
  },
  youFound: {
    fontSize: 'clamp(16px, 4vw, 22px)', color: '#ce93d8',
    fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(28px, 7vw, 48px)', fontWeight: 900, textAlign: 'center',
    background: 'linear-gradient(135deg, #ffeb3b, #e040fb, #7c4dff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 8px rgba(224,64,251,0.4))',
    animation: 'titlePop 0.6s cubic-bezier(.34,1.56,.64,1) both',
  },
  charBadge: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'rgba(255,255,255,0.08)', borderRadius: 20,
    padding: '12px 24px',
    animation: 'bounceIn 0.6s 0.3s ease-out both',
  },
  charName: {
    fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#fff',
  },
  charSub: { fontSize: 14, color: '#ce93d8' },
  starsBox: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,235,59,0.1)', border: '2px solid rgba(255,235,59,0.3)',
    borderRadius: 20, padding: '10px 24px',
  },
  starsText: {
    fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#ffeb3b',
  },
  message: {
    fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#e0e0e0',
    lineHeight: 2, textAlign: 'center',
  },
  playAgainBtn: {
    background: 'linear-gradient(135deg, #7c4dff, #e040fb)',
    color: '#fff', fontSize: 'clamp(18px, 4vw, 22px)',
    fontWeight: 900, padding: '16px 40px',
    borderRadius: 50, letterSpacing: 1,
    boxShadow: '0 6px 30px rgba(224,64,251,0.5)',
    animation: 'pulse 1.5s ease-in-out infinite',
    minWidth: 220,
  },
}
