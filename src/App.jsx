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
  const targetVisualRef = useRef(null)
  const starCounterRef = useRef(null)

  const [nextCountdown, setNextCountdown] = useState(null)
  const [clipboardBurst, setClipboardBurst] = useState(false)
  const [targetBurst, setTargetBurst] = useState(false)
  const [showSuccessBurst, setShowSuccessBurst] = useState(false)
  const [showPraiseChip, setShowPraiseChip] = useState(false)
  const [flyingStar, setFlyingStar] = useState(null)
  const [starPulse, setStarPulse] = useState(false)

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
  const gameFinished = complete && !hasNextLevel

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

  useEffect(() => {
    if (!complete || !hasNextLevel) {
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
  }, [complete, hasNextLevel, goToNextLevel])

  const showNextButton = complete && hasNextLevel
  const showPlayAgainButton = gameFinished

  useEffect(() => {
    if (!showNextButton) {
      return
    }

    function onKeyDown(event) {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault()
        goToNextLevel()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showNextButton, goToNextLevel])

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
                  {WORLD_META.map((entry) => (
                      <div
                          key={entry.world}
                          className={[
                            'world-badge',
                            entry.world < currentWorld ? 'done' : '',
                            entry.world === currentWorld ? 'current' : '',
                          ].join(' ')}
                      >
                        <span>{entry.icon}</span>
                        <span>{entry.title}</span>
                      </div>
                  ))}
                </div>

                <div
                    className="level-progress"
                    aria-label={`Level ${currentLevelInWorld} of ${currentWorldLevels.length}`}
                >
                  <div className="level-trail">
                    {currentWorldLevels.map((entry, index) => {
                      const isDone = index < currentLevelInWorld - 1
                      const isCurrent = index === currentLevelInWorld - 1

                      return (
                          <React.Fragment key={entry.id}>
                            {index > 0 ? (
                                <span
                                    className={[
                                      'trail-segment',
                                      index < currentLevelInWorld ? 'done' : '',
                                    ].join(' ')}
                                />
                            ) : null}

                            <span
                                className={[
                                  'level-node',
                                  isDone ? 'done' : '',
                                  isCurrent ? 'current' : '',
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

            <div className="target-area">
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
            </div>

            <div className="queue-row">
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
                    Next now
                    {nextCountdown !== null ? ` (${nextCountdown})` : ''}
                  </button>
              ) : null}

              {showPlayAgainButton ? (
                  <button className="big-button" onClick={() => goToLevel(0)}>
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