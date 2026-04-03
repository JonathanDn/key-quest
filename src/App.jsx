import React, { useEffect, useRef, useState } from 'react'
import { useTypingGame } from './hooks/useTypingGame'
import {
  KEYBOARD_ROWS,
  FINGER_COLORS,
  KEY_TO_FINGER,
  codeToLabel,
} from './game/gameData'

const WORLD_META = [
  { world: 1, icon: '🏠', title: 'Home' },
  { world: 2, icon: '☁️', title: 'Up' },
  { world: 3, icon: '🌱', title: 'Down' },
  { world: 4, icon: '🌈', title: 'Mix' },
]

function App() {
  const {
    levels,
    level,
    levelIndex,
    currentTarget,
    nextTargets,
    pressedCode,
    stars,
    message,
    playing,
    complete,
    helperFinger,
    targetColor,
    goToLevel,
    goToNextLevel,
  } = useTypingGame()

  const gameAreaRef = useRef(null)
  const [nextCountdown, setNextCountdown] = useState(null)

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

                <div className="level-progress" aria-label={`Level ${currentLevelInWorld} of ${currentWorldLevels.length}`}>
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

            <div className="message-line">{message}</div>

            <div className="target-area">
              <div
                  className={[
                    'big-target',
                    currentTarget?.code === 'Space' ? 'wide' : '',
                  ].join(' ')}
                  style={{ '--target-color': targetColor }}
              >
                {currentTarget ? codeToLabel[currentTarget.code] : complete ? '🎉' : '▶'}
              </div>

              <div className="helper-bubble">
                {currentTarget ? (
                    <>
                  <span
                      className="finger-dot"
                      style={{ background: FINGER_COLORS[KEY_TO_FINGER[currentTarget.code]] }}
                  />
                      <span>Use {helperFinger}</span>
                    </>
                ) : complete && hasNextLevel && nextCountdown !== null ? (
                    <span>Next in {nextCountdown}s</span>
                ) : complete ? (
                    <span>All done!</span>
                ) : (
                    <span>Watch the glowing key</span>
                )}
              </div>
            </div>

            <div className="queue-row">
              {nextTargets.map((item, index) => (
                  <div
                      key={item.id}
                      className={[
                        'queue-bubble',
                        index === 0 ? 'active' : '',
                        item.code === 'Space' ? 'wide' : '',
                      ].join(' ')}
                      style={{
                        '--bubble-color': FINGER_COLORS[KEY_TO_FINGER[item.code]],
                      }}
                  >
                    {codeToLabel[item.code]}
                  </div>
              ))}
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
                      const isTarget = currentTarget?.code === key.code
                      const isPressed = pressedCode === key.code
                      const isInLevel = level.keys.includes(key.code)
                      const finger = KEY_TO_FINGER[key.code]

                      return (
                          <div
                              key={key.code}
                              className={[
                                'keycap',
                                key.wide ? 'wide' : '',
                                isTarget ? 'target' : '',
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