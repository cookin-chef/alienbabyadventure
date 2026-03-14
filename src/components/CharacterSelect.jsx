import React, { useState } from 'react'

const CHARACTERS = [
  {
    key: 'aanya',
    name: 'Aanya',
    emoji: '🧜‍♀️',
    color: '#4caf50',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #1b5e20 100%)',
    glow: 'rgba(76,175,80,0.5)',
    dress: 'Green dress',
    hair: 'Red wig',
    power: '❄️ Ice Princess',
    desc: 'Brave and adventurous!\nLoves exploring castles.',
    bg: 'linear-gradient(160deg, #1b5e20 0%, #0d2818 100%)',
  },
  {
    key: 'meera',
    name: 'Meera',
    emoji: '🧜‍♀️',
    color: '#2196f3',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
    glow: 'rgba(33,150,243,0.5)',
    dress: 'Blue dress',
    hair: 'Pink wig',
    power: '❄️ Ice Sorceress',
    desc: 'Sweet and curious!\nFinds the best treasures.',
    bg: 'linear-gradient(160deg, #0d47a1 0%, #050e30 100%)',
  },
]

export default function CharacterSelect({ state }) {
  const { setCharacter, transitionTo } = state
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)

  function choose(key) {
    setSelected(key)
    setCharacter(key)
    setTimeout(() => transitionTo('outdoor'), 800)
  }

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bg} />

      <h2 style={styles.title}>Choose Your Hero!</h2>
      <p style={styles.sub}>Pick who goes on today's adventure 🌟</p>

      <div style={styles.cards}>
        {CHARACTERS.map((c) => {
          const isSelected = selected === c.key
          const isHovered = hovered === c.key

          return (
            <button
              key={c.key}
              style={{
                ...styles.card,
                background: c.bg,
                border: isSelected
                  ? `4px solid ${c.color}`
                  : isHovered
                  ? `3px solid rgba(255,255,255,0.4)`
                  : '3px solid rgba(255,255,255,0.12)',
                transform: isSelected
                  ? 'scale(1.06) translateY(-8px)'
                  : isHovered
                  ? 'scale(1.03) translateY(-4px)'
                  : 'scale(1)',
                boxShadow: isSelected
                  ? `0 16px 60px ${c.glow}, 0 0 0 2px ${c.color}40`
                  : isHovered
                  ? '0 10px 40px rgba(0,0,0,0.4)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
              }}
              onClick={() => choose(c.key)}
              onMouseEnter={() => setHovered(c.key)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(c.key)}
              onTouchEnd={() => setHovered(null)}
            >
              {/* Emoji character */}
              <div style={{ fontSize: 'clamp(64px, 12vw, 96px)', lineHeight: 1, marginBottom: 8 }}>
                {c.emoji}
              </div>

              {/* Name */}
              <div style={{ ...styles.cardName, color: c.color }}>
                {c.name}
              </div>

              {/* Tags */}
              <div style={styles.tags}>
                <span style={{ ...styles.tag, borderColor: c.color + '80', color: c.color }}>
                  {c.dress}
                </span>
                <span style={{ ...styles.tag, borderColor: c.color + '80', color: c.color }}>
                  {c.hair}
                </span>
              </div>

              {/* Power */}
              <div style={styles.power}>{c.power}</div>

              {/* Description */}
              <div style={styles.desc}>
                {c.desc.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>

              {/* Select indicator */}
              {isSelected && (
                <div style={{ ...styles.selectedBadge, background: c.color }}>
                  ✓ Selected!
                </div>
              )}
            </button>
          )
        })}
      </div>

      <p style={styles.hint}>Tap your hero to start the adventure!</p>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes glow { 0%,100% { opacity: 0.7 } 50% { opacity: 1 } }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at 50% 20%, #2a0a5e 0%, #0a0020 100%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, padding: '20px 16px',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124,77,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(224,64,251,0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  title: {
    fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900,
    background: 'linear-gradient(135deg, #fff 0%, #e040fb 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    textAlign: 'center', zIndex: 1,
  },
  sub: {
    fontSize: 'clamp(13px, 3vw, 18px)', color: '#ce93d8',
    textAlign: 'center', zIndex: 1,
  },
  cards: {
    display: 'flex', gap: 'clamp(12px, 3vw, 28px)',
    zIndex: 1, flexWrap: 'wrap', justifyContent: 'center',
  },
  card: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    padding: 'clamp(16px, 3vw, 28px) clamp(20px, 4vw, 36px)',
    borderRadius: 28,
    width: 'clamp(160px, 38vw, 240px)',
    cursor: 'pointer',
    transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, border-color 0.2s',
    position: 'relative',
    backdropFilter: 'blur(8px)',
  },
  cardName: {
    fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900,
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  tag: {
    fontSize: 11, fontWeight: 700, padding: '3px 10px',
    borderRadius: 20, border: '1.5px solid',
    background: 'rgba(255,255,255,0.06)',
  },
  power: {
    fontSize: 'clamp(12px, 2.5vw, 15px)', color: '#80d8ff',
    fontWeight: 700, background: 'rgba(0,229,255,0.1)',
    padding: '4px 12px', borderRadius: 20,
  },
  desc: {
    fontSize: 'clamp(11px, 2vw, 13px)', color: '#e0e0e0',
    textAlign: 'center', lineHeight: 1.5, opacity: 0.8,
  },
  selectedBadge: {
    position: 'absolute', bottom: -14,
    padding: '4px 16px', borderRadius: 20,
    color: '#fff', fontSize: 13, fontWeight: 900,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    animation: 'float 1s ease-in-out infinite',
  },
  hint: {
    fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#757575',
    zIndex: 1, textAlign: 'center',
  },
}
