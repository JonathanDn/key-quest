import React, { useEffect, useRef, useState } from 'react'
import { useTypingGame } from './hooks/useTypingGame'
import {
  KEYBOARD_ROWS,
  FINGER_COLORS,
  KEY_TO_FINGER,
  codeToLabel,
} from './game/gameData'

const WORLD_META = [
  { world: 1, icon: '🏠', title: 'Basics' },
  { world: 2, icon: '🖐️', title: 'Fingers' },
  { world: 3, icon: '📖', title: 'Words' },
  { world: 4, icon: '✨', title: 'Power Keys' },
  { world: 5, icon: '📝', title: 'Word Powers' },
]

const WIDE_DISPLAY_CODES = new Set(['Space', 'ControlLeft'])

function renderTargetLabel(target) {
  if (!target) {
    return ''
  }

  if (target.type === 'combo') {
    return target.label
  }

  return codeToLabel[target.code] ?? target.code
}

function renderQueueLabel(target) {
  if (!target) {
    return ''
  }

  if (target.type === 'combo') {
    return target.shortLabel ?? target.label
  }

  return codeToLabel[target.code] ?? target.code
}

function renderVisibleChar(char) {
  if (char === ' ') {
    return '␣'
  }

  return char
}

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
    currentTarget,
    nextTargets,
    pressedCode,
    pressedKeys,
    stars,
    message,
    playing,
    complete,
    helperText,
    targetColor,
    wordPowerState,
    goToLevel,
    goToNextLevel,
  } = useTypingGame()

  const gameAreaRef = useRef(null)
  const [nextCountdown, setNextCountdown] = useState(null)
  const [clipboardBurst, setClipboardBurst] = useState(false)
  const [targetBurst, setTargetBurst] = useState(false)
  const previousClipboardRef = useRef(wordPowerState?.clipboardText ?? '')
  const previousTargetRef = useRef(wordPowerState?.targetText ?? '')

  useEffect(() => {
    if (playing) {
      gameAreaRef.current?.focus()
    }
  }, [playing, currentTarget])

  const currentWorld = level.world
  const currentWorldLevels = levels.filter((entry) => entry.world === currentWorld)
  const worldStartIndex = levels.findIndex((entry) => entry.world === currentWorld)
  const currentLevelInWorld = levelIndex - worldStartIndex + 1
  const hasNextLevel = levelIndex < levels.length - 1
  const gameFinished = complete && !hasNextLevel
  const isComboTarget = currentTarget?.type === 'combo'
  const isTextStepTarget = Boolean(currentTarget?.stepText)
  const showWordPowerBoard = level.playMode === 'wordPowers'
  const isWideTarget =
      isComboTarget || isTextStepTarget || WIDE_DISPLAY_CODES.has(currentTarget?.code)
  const heldKeys = new Set(pressedKeys)

  const currentStepText = currentTarget?.stepText ?? ''
  const currentStepCharIndex = currentTarget?.stepCharIndex ?? 0
  const stepDoneText = currentStepText.slice(0, currentStepCharIndex)
  const stepCurrentChar = currentStepText.charAt(currentStepCharIndex)
  const stepUpcomingText = currentStepText.slice(currentStepCharIndex + 1)

  const wordPowerAction = currentTarget?.powerName ?? ''
  const highlightSource = showWordPowerBoard && wordPowerAction === 'Copy Power'
  const highlightClipboard =
      showWordPowerBoard &&
      (wordPowerAction === 'Copy Power' || wordPowerAction === 'Paste Power')
  const highlightTarget =
      showWordPowerBoard &&
      (wordPowerAction === 'Paste Power' || wordPowerAction === 'Undo Power')

  useEffect(() => {
    if (!showWordPowerBoard) {
      previousClipboardRef.current = wordPowerState?.clipboardText ?? ''
      previousTargetRef.current = wordPowerState?.targetText ?? ''
      setClipboardBurst(false)
      setTargetBurst(false)
      return
    }

    let clipboardTimeout
    let targetTimeout

    if (previousClipboardRef.current !== (wordPowerState?.clipboardText ?? '')) {
      setClipboardBurst(true)
      clipboardTimeout = window.setTimeout(() => {
        setClipboardBurst(false)
      }, 450)
    }

    if (previousTargetRef.current !== (wordPowerState?.targetText ?? '')) {
      setTargetBurst(true)
      targetTimeout = window.setTimeout(() => {
        setTargetBurst(false)
      }, 450)
    }

    previousClipboardRef.current = wordPowerState?.clipboardText ?? ''
    previousTargetRef.current = wordPowerState?.targetText ?? ''

    return () => {
      window.clearTimeout(clipboardTimeout)
      window.clearTimeout(targetTimeout)
    }
  }, [showWordPowerBoard, wordPowerState])

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

              <div className="mini-pill top-bar-pill">⭐ {stars}</div>
            </div>

            <div className="guidance-row">
              <div className="message-line">{message}</div>
            </div>

            <div className="target-area">
              {showWordPowerBoard ? (
                  <div className="word-power-stage" style={{ '--target-color': targetColor }}>
                    <div className="word-power-header">
                      <div className="word-power-task-pill">{wordPowerState.taskLabel}</div>
                      <div className="word-power-action-badge">
                        {renderTargetLabel(currentTarget)}
                      </div>
                    </div>

                    <div className="word-power-lab">
                      <div className={highlightSource ? 'word-zone source active' : 'word-zone source'}>
                        <div className="word-zone-label">Copy from</div>
                        <div className="word-zone-slot">
                          {renderWordChips(wordPowerState.sourceText)}
                        </div>
                      </div>

                      <div className="word-flow-arrow" aria-hidden="true">
                        →
                      </div>

                      <div
                          className={[
                            'word-zone',
                            'clipboard',
                            highlightClipboard ? 'active' : '',
                            clipboardBurst ? 'burst' : '',
                          ].join(' ')}
                      >
                        <div className="word-zone-label">Clipboard</div>
                        <div className="word-zone-slot clipboard-slot">
                          {renderWordChips(wordPowerState.clipboardText)}
                        </div>
                      </div>

                      <div className="word-flow-arrow" aria-hidden="true">
                        →
                      </div>

                      <div
                          className={[
                            'word-zone',
                            'target',
                            highlightTarget ? 'active' : '',
                            targetBurst ? 'burst' : '',
                          ].join(' ')}
                      >
                        <div className="word-zone-label">Paste here</div>
                        <div className="word-zone-slot target-slot">
                          {renderWordChips(wordPowerState.targetText)}
                        </div>
                      </div>
                    </div>

                  </div>
              ) : (
                  <>
                    <div
                        className={[
                          'big-target',
                          isWideTarget ? 'wide' : '',
                          isComboTarget ? 'combo' : '',
                          isTextStepTarget ? 'text-step' : '',
                        ].join(' ')}
                        style={{ '--target-color': targetColor }}
                    >
                      {currentTarget ? (
                          isComboTarget ? (
                              <div className="combo-target">
                                {currentTarget.codes.map((code, index) => (
                                    <React.Fragment key={code}>
                                      {index > 0 ? <span className="combo-plus">+</span> : null}
                                      <span className={heldKeys.has(code) ? 'combo-chip held' : 'combo-chip'}>
                              {codeToLabel[code] ?? code}
                            </span>
                                    </React.Fragment>
                                ))}
                              </div>
                          ) : isTextStepTarget ? (
                              <div className="word-target">
                                <span className="word-done">{stepDoneText}</span>
                                <span className="word-current">{renderVisibleChar(stepCurrentChar)}</span>
                                <span className="word-upcoming">{stepUpcomingText}</span>
                              </div>
                          ) : (
                              renderTargetLabel(currentTarget)
                          )
                      ) : complete ? (
                          '🎉'
                      ) : (
                          '▶'
                      )}
                    </div>
                  </>
              )}
            </div>

            <div className="queue-row">
              {nextTargets.map((item, index) => {
                const isComboItem = item.type === 'combo'

                return (
                    <div
                        key={item.id}
                        className={[
                          'queue-bubble',
                          index === 0 ? 'active' : '',
                          isComboItem || WIDE_DISPLAY_CODES.has(item.code) ? 'wide' : '',
                          isComboItem ? 'combo' : '',
                        ].join(' ')}
                        style={{
                          '--bubble-color':
                              item.type === 'combo'
                                  ? FINGER_COLORS[KEY_TO_FINGER[item.triggerCode]]
                                  : FINGER_COLORS[KEY_TO_FINGER[item.code]],
                        }}
                    >
                      {renderQueueLabel(item)}
                    </div>
                )
              })}
            </div>

            <div className="action-row">
              {showNextButton ? (
                  <button className="soft-button" onClick={goToNextLevel}>
                    Next now
                  </button>
              ) : null}

              {showPlayAgainButton ? (
                  <button className="big-button" onClick={() => goToLevel(0)}>
                    Play again
                  </button>
              ) : null}
            </div>
          </main>

          <section className="keyboard-stage">
            <div className="keyboard">
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                  <div className="keyboard-row" key={`row-${rowIndex}`}>
                    {row.map((key) => {
                      const isTarget =
                          currentTarget?.type === 'single' && currentTarget.code === key.code
                      const isPressed = pressedCode === key.code
                      const isInLevel = level.keys.includes(key.code)
                      const finger = KEY_TO_FINGER[key.code]
                      const isComboPart =
                          currentTarget?.type === 'combo' &&
                          currentTarget.codes.includes(key.code)
                      const isHeld = heldKeys.has(key.code)

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