import React from 'react'
import { useGameState } from './hooks/useGameState'
import TitleScreen from './components/TitleScreen'
import CharacterSelect from './components/CharacterSelect'
import GameCanvas from './components/GameCanvas'
import WinScreen from './components/WinScreen'

export default function App() {
  const state = useGameState()
  const { phase, fadeOut } = state

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#1a0a3e' }}>

      {/* Babylon 3D canvas — mounted once, scenes swap internally */}
      {(phase === 'outdoor' || phase === 'castle' || phase === 'bedroom') && (
        <GameCanvas state={state} />
      )}

      {/* React UI screens */}
      {phase === 'title' && <TitleScreen state={state} />}
      {phase === 'charSelect' && <CharacterSelect state={state} />}
      {phase === 'win' && <WinScreen state={state} />}

      {/* Global fade overlay for transitions */}
      <div style={{
        position: 'fixed', inset: 0,
        background: '#000',
        opacity: fadeOut ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: fadeOut ? 'all' : 'none',
        zIndex: 9999,
      }} />
    </div>
  )
}
