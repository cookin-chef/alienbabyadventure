import { useState, useCallback } from 'react'

export function useGameState() {
  const [phase, setPhase] = useState('title')
  // 'title' | 'charSelect' | 'outdoor' | 'castle' | 'bedroom' | 'win'

  const [character, setCharacter] = useState(null) // 'aanya' | 'meera'
  const [stars, setStars] = useState(0)
  const [totalStars] = useState(16)
  const [nearRide, setNearRide] = useState(null)   // null | 'coaster' | 'carousel'
  const [nearCastle, setNearCastle] = useState(false)
  const [nearExit, setNearExit] = useState(false)
  const [isRiding, setIsRiding] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const collectStar = useCallback(() => {
    setStars(s => s + 1)
  }, [])

  const transitionTo = useCallback((newPhase, delay = 600) => {
    setFadeOut(true)
    setTimeout(() => {
      setPhase(newPhase)
      setFadeOut(false)
    }, delay)
  }, [])

  return {
    phase, setPhase,
    character, setCharacter,
    stars, totalStars, collectStar,
    nearRide, setNearRide,
    nearCastle, setNearCastle,
    nearExit, setNearExit,
    isRiding, setIsRiding,
    fadeOut, transitionTo,
  }
}
