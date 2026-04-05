import React, { useEffect, useRef, useState } from 'react'
import { useTypingGame } from './hooks/useTypingGame'
import {
  KEYBOARD_ROWS,
  FINGER_COLORS,
  KEY_TO_FINGER,
} from './game/content/keyData'
import { WORLD_META } from './game/content/worldMeta'

function renderWordChips(text) {
  if (!text) {
    return <span className="word-slot-placeholder">Empty</span>
  }

  return text.split(' ').map((part, index) => (
      <span className="word-chip" key={`${part}-${index}`}>
      {part}
    </span>
  ))
}

function App() {
  const {
    levels,
    level,
    levelIndex,
    pressedCode,
    stars,
    message,
    playing,
    complete,
    targetColor,
    ui,
    successFx,
    goToLevel,
    goToNextLevel,
  } = useTypingGame()

  const gameAreaRef = useRef(null)
  const targetAreaRef = useRef(null)
  const targetVisualRef = useRef(null)
  const starCounterRef = useRef(null)
  const worldBadgeRefs = useRef({})
  const levelNodeRefs = useRef({})

  const [nextCountdown, setNextCountdown] = useState(null)
  const [worldCountdown, setWorldCountdown] = useState(null)
  const [clipboardBurst, setClipboardBurst] = useState(false)
  const [targetBurst, setTargetBurst] = useState(false)
  const [showSuccessBurst, setShowSuccessBurst] = useState(false)
  const [showPraiseChip, setShowPraiseChip] = useState(false)
  const [flyingStar, setFlyingStar] = useState(null)
  const [starPulse, setStarPulse] = useState(false)
  const [levelCompleteFx, setLevelCompleteFx] = useState({ active: false, phase: 'idle' })
  const [levelTravelStars, setLevelTravelStars] = useState([])
  const [showLevelBanner, setShowLevelBanner] = useState(false)
  const [worldCompleteFx, setWorldCompleteFx] = useState({ active: false, phase: 'idle' })
  const [worldTravelStars, setWorldTravelStars] = useState([])
  const [showPortalCard, setShowPortalCard] = useState(false)
  const [showWorldCta, setShowWorldCta] = useState(false)

  const previousClipboardRef = useRef(ui.wordPower.clipboardText)
  const previousTargetRef = useRef(ui.wordPower.targetText)

  useEffect(() => {
    if (playing) {
      gameAreaRef.current?.focus()
    }
  }, [playing, levelIndex, ui.target.mode])

  const currentWorld = level.world
  const currentWorldLevels = levels.filter((entry) => entry.world === currentWorld)
  const worldStartIndex = levels.findIndex((entry) => entry.world === currentWorld)
  const currentLevelInWorld = levelIndex - worldStartIndex + 1
  const hasNextLevel = levelIndex < levels.length - 1
  const nextLevel = hasNextLevel ? levels[levelIndex + 1] : null
  const nextWorld = nextLevel?.world ?? null
  const gameFinished = complete && !hasNextLevel
  const unlockedWorldMeta = WORLD_META.find((entry) => entry.world === nextWorld) ?? null
  const isWorldBoundary = complete && (gameFinished || nextWorld !== currentWorld)
  const isStandardLevelComplete = complete && !isWorldBoundary
  const queueDimmed = levelCompleteFx.active || worldCompleteFx.active

  useEffect(() => {
    if (!ui.showWordPowerBoard) {
      previousClipboardRef.current = ui.wordPower.clipboardText
      previousTargetRef.current = ui.wordPower.targetText
      setClipboardBurst(false)
      setTargetBurst(false)
      return
    }

    let clipboardTimeout
    let targetTimeout

    if (previousClipboardRef.current !== ui.wordPower.clipboardText) {
      setClipboardBurst(true)
      clipboardTimeout = window.setTimeout(() => {
        setClipboardBurst(false)
      }, 450)
    }

    if (previousTargetRef.current !== ui.wordPower.targetText) {
      setTargetBurst(true)
      targetTimeout = window.setTimeout(() => {
        setTargetBurst(false)
      }, 450)
    }

    previousClipboardRef.current = ui.wordPower.clipboardText
    previousTargetRef.current = ui.wordPower.targetText

    return () => {
      window.clearTimeout(clipboardTimeout)
      window.clearTimeout(targetTimeout)
    }
  }, [ui.showWordPowerBoard, ui.wordPower.clipboardText, ui.wordPower.targetText])

  useEffect(() => {
    if (!successFx.id) {
      return
    }

    setShowSuccessBurst(true)
    setShowPraiseChip(true)
    setStarPulse(true)

    const targetRect = targetVisualRef.current?.getBoundingClientRect()
    const starRect = starCounterRef.current?.getBoundingClientRect()

    if (targetRect && starRect) {
      const startX = targetRect.left + targetRect.width / 2
      const startY = targetRect.top + targetRect.height / 2
      const endX = starRect.left + starRect.width / 2
      const endY = starRect.top + starRect.height / 2

      setFlyingStar({
        id: successFx.id,
        startX,
        startY,
        deltaX: endX - startX,
        deltaY: endY - startY,
      })
    } else {
      setFlyingStar(null)
    }

    const burstTimeout = window.setTimeout(() => setShowSuccessBurst(false), 320)
    const praiseTimeout = window.setTimeout(() => setShowPraiseChip(false), 520)
    const starTimeout = window.setTimeout(() => setFlyingStar(null), 520)
    const pulseTimeout = window.setTimeout(() => setStarPulse(false), 300)

    return () => {
      window.clearTimeout(burstTimeout)
      window.clearTimeout(praiseTimeout)
      window.clearTimeout(starTimeout)
      window.clearTimeout(pulseTimeout)
    }
  }, [successFx.id])

  function spawnLevelTravelStars() {
    const targetRect = targetAreaRef.current?.getBoundingClientRect()
    const nodeRect = levelNodeRefs.current[level.id]?.getBoundingClientRect()

    if (!targetRect || !nodeRect) {
      setLevelTravelStars([])
      return
    }

    const startX = targetRect.left + targetRect.width / 2
    const startY = targetRect.top + targetRect.height * 0.44
    const endX = nodeRect.left + nodeRect.width / 2
    const endY = nodeRect.top + nodeRect.height / 2

    const configs = [
      { glyph: '⭐', offsetX: -36, offsetY: 12, launchX: -18, launchY: -48, endX: -8, endY: -4, delay: 0, size: 1.14 },
      { glyph: '✨', offsetX: 0, offsetY: -20, launchX: 0, launchY: -58, endX: 0, endY: -10, delay: 80, size: 1.0 },
      { glyph: '⭐', offsetX: 38, offsetY: 8, launchX: 18, launchY: -48, endX: 8, endY: -2, delay: 160, size: 1.1 },
    ]

    setLevelTravelStars(
        configs.map((config, index) => {
          const starStartX = startX + config.offsetX
          const starStartY = startY + config.offsetY
          const starEndX = endX + config.endX
          const starEndY = endY + config.endY

          return {
            id: `level-${levelIndex}-${index}`,
            glyph: config.glyph,
            startX: starStartX,
            startY: starStartY,
            launchX: config.launchX,
            launchY: config.launchY,
            deltaX: starEndX - starStartX,
            deltaY: starEndY - starStartY,
            delay: config.delay,
            size: config.size,
          }
        })
    )
  }

  function spawnWorldTravelStars() {
    const targetRect = targetAreaRef.current?.getBoundingClientRect()
    const badgeRect = worldBadgeRefs.current[currentWorld]?.getBoundingClientRect()

    if (!targetRect || !badgeRect) {
      setWorldTravelStars([])
      return
    }

    const startX = targetRect.left + targetRect.width / 2
    const startY = targetRect.top + targetRect.height * 0.42
    const endX = badgeRect.left + badgeRect.width / 2
    const endY = badgeRect.top + badgeRect.height / 2

    const configs = [
      { glyph: '⭐', offsetX: -84, offsetY: 16, launchX: -28, launchY: -54, endX: -18, endY: -8, delay: 0, size: 1.28 },
      { glyph: '✨', offsetX: -36, offsetY: -26, launchX: -12, launchY: -68, endX: 6, endY: -14, delay: 70, size: 1.08 },
      { glyph: '⭐', offsetX: 0, offsetY: 28, launchX: 0, launchY: -74, endX: -4, endY: 8, delay: 130, size: 1.34 },
      { glyph: '✨', offsetX: 38, offsetY: -18, launchX: 16, launchY: -62, endX: 14, endY: -10, delay: 190, size: 1.08 },
      { glyph: '⭐', offsetX: 86, offsetY: 10, launchX: 28, launchY: -54, endX: 22, endY: 2, delay: 250, size: 1.2 },
    ]

    setWorldTravelStars(
        configs.map((config, index) => {
          const starStartX = startX + config.offsetX
          const starStartY = startY + config.offsetY
          const starEndX = endX + config.endX
          const starEndY = endY + config.endY

          return {
            id: `world-${levelIndex}-${currentWorld}-${index}`,
            glyph: config.glyph,
            startX: starStartX,
            startY: starStartY,
            launchX: config.launchX,
            launchY: config.launchY,
            deltaX: starEndX - starStartX,
            deltaY: starEndY - starStartY,
            delay: config.delay,
            size: config.size,
          }
        })
    )
  }

  useEffect(() => {
    if (complete) {
      return
    }

    setLevelCompleteFx({ active: false, phase: 'idle' })
    setLevelTravelStars([])
    setShowLevelBanner(false)
    setWorldCompleteFx({ active: false, phase: 'idle' })
    setWorldTravelStars([])
    setShowPortalCard(false)
    setShowWorldCta(false)
    setNextCountdown(null)
    setWorldCountdown(null)
  }, [complete, levelIndex])

  useEffect(() => {
    if (!isStandardLevelComplete) {
      return
    }

    setLevelCompleteFx({ active: true, phase: 'burst' })
    setLevelTravelStars([])
    setShowLevelBanner(false)

    const trailTimer = window.setTimeout(() => {
      setLevelCompleteFx({ active: true, phase: 'trail' })
      setShowLevelBanner(true)
      spawnLevelTravelStars()
    }, 180)

    const readyTimer = window.setTimeout(() => {
      setLevelCompleteFx({ active: true, phase: 'ready' })
    }, 900)

    return () => {
      window.clearTimeout(trailTimer)
      window.clearTimeout(readyTimer)
    }
  }, [isStandardLevelComplete, level.id, levelIndex])

  useEffect(() => {
    if (!isWorldBoundary) {
      return
    }

    setWorldCompleteFx({ active: true, phase: 'burst' })
    setWorldTravelStars([])
    setShowPortalCard(false)
    setShowWorldCta(false)

    const burstTimer = window.setTimeout(() => {
      setWorldCompleteFx({ active: true, phase: 'travel' })
      spawnWorldTravelStars()
    }, 220)

    const portalTimer = window.setTimeout(() => {
      setWorldCompleteFx({ active: true, phase: 'portal' })
      setWorldTravelStars([])
      setShowPortalCard(true)
    }, 920)

    const readyTimer = window.setTimeout(() => {
      setWorldCompleteFx({ active: true, phase: 'ready' })
      setShowWorldCta(true)
    }, 1500)

    return () => {
      window.clearTimeout(burstTimer)
      window.clearTimeout(portalTimer)
      window.clearTimeout(readyTimer)
    }
  }, [isWorldBoundary, currentWorld, levelIndex])

  useEffect(() => {
    if (!complete || !hasNextLevel || isWorldBoundary) {
      setNextCountdown(null)
      return
    }

    setNextCountdown(5)

    const timeoutId = window.setTimeout(() => {
      goToNextLevel()
    }, 5000)

    const intervalId = window.setInterval(() => {
      setNextCountdown((value) => {
        if (value === null) {
          return null
        }

        return value > 1 ? value - 1 : 1
      })
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [complete, hasNextLevel, isWorldBoundary, goToNextLevel])

  useEffect(() => {
    if (!showWorldCta || !hasNextLevel || !isWorldBoundary) {
      setWorldCountdown(null)
      return
    }

    setWorldCountdown(4)

    const timeoutId = window.setTimeout(() => {
      goToNextLevel()
    }, 4000)

    const intervalId = window.setInterval(() => {
      setWorldCountdown((value) => {
        if (value === null) {
          return null
        }

        return value > 1 ? value - 1 : 1
      })
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [showWorldCta, hasNextLevel, isWorldBoundary, goToNextLevel])

  const showNextButton = complete && hasNextLevel && !isWorldBoundary
  const showWorldNextButton = hasNextLevel && isWorldBoundary && showWorldCta
  const showPlayAgainButton = gameFinished && showWorldCta

  useEffect(() => {
    const canUseEnter = showNextButton || showWorldNextButton || showPlayAgainButton

    if (!canUseEnter) {
      return
    }

    function onKeyDown(event) {
      if (event.code !== 'Enter' && event.code !== 'NumpadEnter') {
        return
      }

      event.preventDefault()

      if (showNextButton || showWorldNextButton) {
        goToNextLevel()
        return
      }

      if (showPlayAgainButton) {
        goToLevel(0)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showNextButton, showWorldNextButton, showPlayAgainButton, goToNextLevel, goToLevel])

  return (
      <div className="game-shell">
        <div className="game-screen">
          <main className="stage-card" ref={gameAreaRef} tabIndex={-1}>
            <div className="top-bar">
              <div className="mini-pill top-bar-context-pill">
                {level.title} · {currentLevelInWorld}/{currentWorldLevels.length}
              </div>

              <div className="progress-map">
                <div className="world-map" aria-label={`World ${currentWorld}`}>
                  {WORLD_META.map((entry) => {
                    const isPortalPhase =
                        worldCompleteFx.phase === 'portal' || worldCompleteFx.phase === 'ready'
                    const isTravelPhase = worldCompleteFx.phase === 'travel'
                    const isDone =
                        entry.world < currentWorld ||
                        (entry.world === currentWorld && isWorldBoundary && isPortalPhase)
                    const isCurrent = entry.world === currentWorld && !isDone
                    const isCharge = entry.world === currentWorld && isTravelPhase
                    const isLockIn =
                        entry.world === currentWorld && isWorldBoundary && isPortalPhase
                    const isUnlockPulse =
                        !gameFinished &&
                        entry.world === nextWorld &&
                        (worldCompleteFx.phase === 'portal' || worldCompleteFx.phase === 'ready')

                    return (
                        <div
                            key={entry.world}
                            ref={(node) => {
                              if (node) {
                                worldBadgeRefs.current[entry.world] = node
                              }
                            }}
                            className={[
                              'world-badge',
                              isDone ? 'done' : '',
                              isCurrent ? 'current' : '',
                              isCharge ? 'charge' : '',
                              isLockIn ? 'lock-in' : '',
                              isUnlockPulse ? 'unlock-pulse' : '',
                            ].join(' ')}
                        >
                          <span>{entry.icon}</span>
                          <span>{entry.title}</span>
                        </div>
                    )
                  })}
                </div>

                <div
                    className="level-progress"
                    aria-label={`Level ${currentLevelInWorld} of ${currentWorldLevels.length}`}
                >
                  <div className="level-trail">
                    {currentWorldLevels.map((entry, index) => {
                      const isFinalNode = index === currentLevelInWorld - 1
                      const lockInNode =
                          isWorldBoundary &&
                          isFinalNode &&
                          (worldCompleteFx.phase === 'portal' || worldCompleteFx.phase === 'ready')
                      const celebrateWorldNode =
                          isWorldBoundary &&
                          isFinalNode &&
                          (worldCompleteFx.phase === 'burst' || worldCompleteFx.phase === 'travel')
                      const celebrateLevelNode =
                          isStandardLevelComplete &&
                          isFinalNode &&
                          levelCompleteFx.active
                      const isDone = index < currentLevelInWorld - 1 || lockInNode
                      const isCurrent = isFinalNode && !isDone

                      return (
                          <React.Fragment key={entry.id}>
                            {index > 0 ? (
                                <span
                                    className={[
                                      'trail-segment',
                                      index < currentLevelInWorld ? 'done' : '',
                                      celebrateLevelNode ? 'level-trail-pop' : '',
                                    ].join(' ')}
                                />
                            ) : null}

                            <span
                                ref={(node) => {
                                  if (node) {
                                    levelNodeRefs.current[entry.id] = node
                                  }
                                }}
                                className={[
                                  'level-node',
                                  isDone ? 'done' : '',
                                  isCurrent ? 'current' : '',
                                  celebrateWorldNode ? 'celebrate' : '',
                                  celebrateLevelNode ? 'level-clear-pulse' : '',
                                ].join(' ')}
                            >
                          {isDone ? '★' : ''}
                        </span>
                          </React.Fragment>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div
                  ref={starCounterRef}
                  className={[
                    'mini-pill',
                    'top-bar-pill',
                    starPulse ? 'star-counter-pop' : '',
                  ].join(' ')}
              >
                ⭐ {stars}
              </div>
            </div>

            <div className="guidance-row">
              <div className="message-line">{message}</div>
            </div>

            <div
                className={[
                  'target-area',
                  levelCompleteFx.active ? 'level-complete-mode' : '',
                  worldCompleteFx.active ? 'world-complete-mode' : '',
                  `level-phase-${levelCompleteFx.phase}`,
                  `world-phase-${worldCompleteFx.phase}`,
                ].join(' ')}
                ref={targetAreaRef}
            >
              <div
                  ref={targetVisualRef}
                  className={[
                    'target-visual',
                    showSuccessBurst ? 'success-burst' : '',
                  ].join(' ')}
                  style={{ '--target-color': successFx.color || targetColor }}
              >
                {showPraiseChip && successFx.praise ? (
                    <div className="success-praise-chip">{successFx.praise}</div>
                ) : null}

                <div className="success-sparkle-ring" aria-hidden="true" />

                <div className="success-sparkles" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                {ui.showWordPowerBoard ? (
                    <div className="word-power-stage" style={{ '--target-color': targetColor }}>
                      <div className="word-power-header">
                        <div className="word-power-task-pill">{ui.wordPower.taskLabel}</div>
                        <div className="word-power-action-badge">
                          {ui.wordPower.actionLabel}
                        </div>
                      </div>

                      <div className="word-power-lab">
                        <div className={ui.wordPower.highlightSource ? 'word-zone source active' : 'word-zone source'}>
                          <div className="word-zone-label">Copy from</div>
                          <div className="word-zone-slot">
                            {renderWordChips(ui.wordPower.sourceText)}
                          </div>
                        </div>

                        <div className="word-flow-arrow" aria-hidden="true">
                          →
                        </div>

                        <div
                            className={[
                              'word-zone',
                              'clipboard',
                              ui.wordPower.highlightClipboard ? 'active' : '',
                              clipboardBurst ? 'burst' : '',
                            ].join(' ')}
                        >
                          <div className="word-zone-label">Clipboard</div>
                          <div className="word-zone-slot clipboard-slot">
                            {renderWordChips(ui.wordPower.clipboardText)}
                          </div>
                        </div>

                        <div className="word-flow-arrow" aria-hidden="true">
                          →
                        </div>

                        <div
                            className={[
                              'word-zone',
                              'target',
                              ui.wordPower.highlightTarget ? 'active' : '',
                              targetBurst ? 'burst' : '',
                            ].join(' ')}
                        >
                          <div className="word-zone-label">Paste here</div>
                          <div className="word-zone-slot target-slot">
                            {renderWordChips(ui.wordPower.targetText)}
                          </div>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div
                        className={[
                          'big-target',
                          ui.target.isWide ? 'wide' : '',
                          ui.target.mode === 'combo' ? 'combo' : '',
                          ui.target.mode === 'textStep' ? 'text-step' : '',
                        ].join(' ')}
                        style={{ '--target-color': targetColor }}
                    >
                      {ui.target.mode === 'combo' ? (
                          <div className="combo-target">
                            {ui.target.comboChips.map((chip, index) => (
                                <React.Fragment key={chip.code}>
                                  {index > 0 ? <span className="combo-plus">+</span> : null}
                                  <span className={chip.held ? 'combo-chip held' : 'combo-chip'}>
                            {chip.label}
                          </span>
                                </React.Fragment>
                            ))}
                          </div>
                      ) : ui.target.mode === 'textStep' ? (
                          <div className="word-target">
                            <span className="word-done">{ui.target.stepDoneText}</span>
                            <span className="word-current">{ui.target.stepCurrentChar}</span>
                            <span className="word-upcoming">{ui.target.stepUpcomingText}</span>
                          </div>
                      ) : (
                          ui.target.label
                      )}
                    </div>
                )}
              </div>

              {showLevelBanner ? (
                  <div className="level-complete-banner" aria-hidden="true">
                    <div className="level-complete-badge">🏅</div>
                    <div className="level-complete-copy">
                      <div className="level-complete-title">Level Clear!</div>
                      <div className="level-complete-subtitle">Great job. Ready for the next one?</div>
                    </div>
                  </div>
              ) : null}

              {showPortalCard ? (
                  <div className="world-portal-card" aria-hidden="true">
                    <div className="world-complete-ring" />
                    <div className="world-complete-key">🗝️</div>

                    <div className="world-complete-title">
                      {gameFinished ? 'Key Quest Complete!' : 'World Complete!'}
                    </div>

                    <div className="world-complete-subtitle">
                      {gameFinished
                          ? 'You finished every world'
                          : `You unlocked ${unlockedWorldMeta?.title}`}
                    </div>

                    <div className="world-complete-next-badge">
                  <span className="world-complete-next-icon">
                    {gameFinished ? '🏆' : unlockedWorldMeta?.icon}
                  </span>
                      <span>
                    {gameFinished ? 'All worlds cleared' : unlockedWorldMeta?.title}
                  </span>
                    </div>
                  </div>
              ) : null}
            </div>

            <div className={['queue-row', queueDimmed ? 'complete-dim' : ''].join(' ')}>
              {ui.queue.map((item) => (
                  <div
                      key={item.id}
                      className={[
                        'queue-bubble',
                        item.isActive ? 'active' : '',
                        item.isWide ? 'wide' : '',
                        item.isCombo ? 'combo' : '',
                      ].join(' ')}
                      style={{ '--bubble-color': item.color }}
                  >
                    {item.label}
                  </div>
              ))}
            </div>

            <div className="action-row">
              {showNextButton ? (
                  <button className="soft-button" onClick={goToNextLevel}>
                    Next now{nextCountdown !== null ? ` (${nextCountdown})` : ''}
                  </button>
              ) : null}

              {showWorldNextButton ? (
                  <button className="big-button world-enter-button" onClick={goToNextLevel}>
                    Enter {unlockedWorldMeta?.title}
                    {worldCountdown !== null ? ` (${worldCountdown})` : ''}
                  </button>
              ) : null}

              {showPlayAgainButton ? (
                  <button className="big-button world-enter-button" onClick={() => goToLevel(0)}>
                    Play again
                  </button>
              ) : null}
            </div>

            {flyingStar ? (
                <div
                    className="flying-reward-star"
                    style={{
                      '--start-x': `${flyingStar.startX}px`,
                      '--start-y': `${flyingStar.startY}px`,
                      '--fly-x': `${flyingStar.deltaX}px`,
                      '--fly-y': `${flyingStar.deltaY}px`,
                    }}
                    aria-hidden="true"
                >
                  ⭐
                </div>
            ) : null}

            {levelTravelStars.map((star) => (
                <div
                    key={star.id}
                    className="level-travel-star"
                    style={{
                      '--start-x': `${star.startX}px`,
                      '--start-y': `${star.startY}px`,
                      '--launch-x': `${star.launchX}px`,
                      '--launch-y': `${star.launchY}px`,
                      '--fly-x': `${star.deltaX}px`,
                      '--fly-y': `${star.deltaY}px`,
                      '--star-size': `${star.size}rem`,
                      animationDelay: `${star.delay}ms`,
                    }}
                    aria-hidden="true"
                >
                  {star.glyph}
                </div>
            ))}

            {worldTravelStars.map((star) => (
                <div
                    key={star.id}
                    className="world-travel-star"
                    style={{
                      '--start-x': `${star.startX}px`,
                      '--start-y': `${star.startY}px`,
                      '--launch-x': `${star.launchX}px`,
                      '--launch-y': `${star.launchY}px`,
                      '--fly-x': `${star.deltaX}px`,
                      '--fly-y': `${star.deltaY}px`,
                      '--star-size': `${star.size}rem`,
                      animationDelay: `${star.delay}ms`,
                    }}
                    aria-hidden="true"
                >
                  {star.glyph}
                </div>
            ))}
          </main>

          <section className="keyboard-stage">
            <div className="keyboard">
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                  <div className="keyboard-row" key={`row-${rowIndex}`}>
                    {row.map((key) => {
                      const isTarget = ui.keyboard.targetCodes.includes(key.code)
                      const isComboPart = ui.keyboard.comboCodes.includes(key.code)
                      const isPressed = pressedCode === key.code
                      const isHeld = ui.keyboard.heldKeys.has(key.code)
                      const isInLevel = level.keys.includes(key.code)
                      const finger = KEY_TO_FINGER[key.code]

                      return (
                          <div
                              key={key.code}
                              className={[
                                'keycap',
                                key.wide ? 'wide' : '',
                                isTarget ? 'target' : '',
                                isComboPart ? 'combo-part' : '',
                                isHeld ? 'held' : '',
                                isPressed ? 'pressed' : '',
                                !isInLevel ? 'dimmed' : '',
                              ].join(' ')}
                              style={{ '--finger-color': FINGER_COLORS[finger] }}
                          >
                            <span>{key.label}</span>
                          </div>
                      )
                    })}
                  </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  )
}

export default App