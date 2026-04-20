import React, { useEffect, useMemo, useState } from 'react'
import { createAlphaQuestLevels, ALPHA_QUEST_WORLDS } from './data/levels'

const PROGRESS_KEY = 'alphaQuest:progress'

function readProgress() {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    if (!raw) {
      return { highestUnlockedLevelIndex: 0 }
    }

    const parsed = JSON.parse(raw)
    return {
      highestUnlockedLevelIndex: Number(parsed?.highestUnlockedLevelIndex) || 0,
    }
  } catch {
    return { highestUnlockedLevelIndex: 0 }
  }
}

function saveProgress(highestUnlockedLevelIndex) {
  window.localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({
      highestUnlockedLevelIndex,
      updatedAt: Date.now(),
    }),
  )
}

export function AlphaQuestExperience({ playerName, onExitToHub }) {
  const levels = useMemo(() => createAlphaQuestLevels(), [])
  const [levelIndex, setLevelIndex] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [correctTaps, setCorrectTaps] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [feedback, setFeedback] = useState('Find the target letter.')
  const [selectedOption, setSelectedOption] = useState(null)
  const [showLevelSummary, setShowLevelSummary] = useState(false)
  const [showWorldSummary, setShowWorldSummary] = useState(false)
  const [highestUnlockedLevelIndex, setHighestUnlockedLevelIndex] = useState(0)

  useEffect(() => {
    const stored = readProgress()
    setHighestUnlockedLevelIndex(stored.highestUnlockedLevelIndex)
    setLevelIndex(Math.min(stored.highestUnlockedLevelIndex, levels.length - 1))
  }, [levels])

  const level = levels[levelIndex]
  const round = level.rounds[roundIndex]
  const accuracy = totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 100

  const isLastRound = roundIndex >= level.rounds.length - 1
  const isLastLevel = levelIndex >= levels.length - 1
  const nextLevel = levels[levelIndex + 1]
  const isWorldBoundary = nextLevel && nextLevel.worldId !== level.worldId

  useEffect(() => {
    if (showLevelSummary || showWorldSummary) {
      return
    }

    setFeedback(`Find ${round.target}`)
  }, [round.target, showLevelSummary, showWorldSummary])

  function handleOptionTap(letter) {
    if (showLevelSummary || showWorldSummary) {
      return
    }

    setSelectedOption(letter)
    setTotalTaps((value) => value + 1)

    if (letter === round.target) {
      setFeedback('Great job!')
      setScore((value) => value + 10)
      setStreak((value) => value + 1)
      setCorrectTaps((value) => value + 1)

      window.setTimeout(() => {
        setSelectedOption(null)

        if (isLastRound) {
          if (!isLastLevel) {
            const newHighest = Math.max(highestUnlockedLevelIndex, levelIndex + 1)
            setHighestUnlockedLevelIndex(newHighest)
            saveProgress(newHighest)
          }

          if (isWorldBoundary || isLastLevel) {
            setShowWorldSummary(true)
          } else {
            setShowLevelSummary(true)
          }

          return
        }

        setRoundIndex((value) => value + 1)
      }, 400)
    } else {
      setFeedback(`Nice try. Find ${round.target}`)
      setStreak(0)
      window.setTimeout(() => setSelectedOption(null), 260)
    }
  }

  function goToNextLevel() {
    setShowLevelSummary(false)
    setShowWorldSummary(false)

    if (isLastLevel) {
      setLevelIndex(0)
      setRoundIndex(0)
      setScore(0)
      setStreak(0)
      setCorrectTaps(0)
      setTotalTaps(0)
      setFeedback('Find the target letter.')
      return
    }

    setLevelIndex((value) => value + 1)
    setRoundIndex(0)
  }

  const currentWorldProgress = ALPHA_QUEST_WORLDS.findIndex((world) => world.id === level.worldId) + 1

  return (
    <div className="game-shell alpha-quest-shell">
      <div className="game-screen alpha-quest-screen">
        <main className="stage-card alpha-quest-card">
          <header className="alpha-quest-header">
            <div>
              <div className="launch-card-badge account">✨ Alpha Quest</div>
              <h1 className="alpha-quest-title">Find the letter</h1>
              <div className="mini-pill alpha-quest-player-pill">
                <span className="alpha-quest-player-label">Player:</span>
                <span className="alpha-quest-player-value">{playerName}</span>
              </div>
            </div>

            <button type="button" className="launch-inline-button" onClick={onExitToHub}>
              Back to hub
            </button>
          </header>

          <div className="alpha-quest-stats">
            <div><span>World</span><strong>{currentWorldProgress}</strong></div>
            <div><span>Level</span><strong>{level.levelNumber}</strong></div>
            <div><span>Score</span><strong>{score}</strong></div>
            <div><span>Streak</span><strong>{streak}</strong></div>
            <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
          </div>

          {!showLevelSummary && !showWorldSummary ? (
            <>
              <section className="alpha-target-panel" aria-live="polite">
                <p className="alpha-target-prompt">Find {round.target}</p>
                <div className="alpha-target-letter">{round.target}</div>
                <p className="alpha-feedback">{feedback}</p>
              </section>

              <section className="alpha-field" aria-label="Letter field">
                {round.options.map((letter, index) => {
                  const isCorrect = selectedOption === letter && letter === round.target
                  const isWrong = selectedOption === letter && letter !== round.target

                  return (
                    <button
                      type="button"
                      key={`${letter}-${index}`}
                      className={[
                        'alpha-letter-tile',
                        isCorrect ? 'correct' : '',
                        isWrong ? 'wrong' : '',
                      ].join(' ')}
                      onClick={() => handleOptionTap(letter)}
                    >
                      {letter}
                    </button>
                  )
                })}
              </section>
            </>
          ) : null}

          {showLevelSummary ? (
            <section className="alpha-summary-card" aria-live="polite">
              <h2>Level complete!</h2>
              <p>Score: {score} · Streak: {streak} · Accuracy: {accuracy}%</p>
              <button type="button" className="big-button" onClick={goToNextLevel}>
                Next level
              </button>
            </section>
          ) : null}

          {showWorldSummary ? (
            <section className="alpha-summary-card" aria-live="polite">
              <h2>{isLastLevel ? 'Alpha Quest complete!' : `${level.worldTitle} complete!`}</h2>
              <p>Score: {score} · Streak: {streak} · Accuracy: {accuracy}%</p>
              <button type="button" className="big-button" onClick={goToNextLevel}>
                {isLastLevel ? 'Play again' : 'Enter next world'}
              </button>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}
