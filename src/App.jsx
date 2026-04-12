import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTypingGame } from './hooks/useTypingGame'
import { useStageEffects } from './hooks/useStageEffects'
import { StageHeader } from './components/StageHeader'
import { LeaderboardModal } from './components/LeaderboardModal'
import { TargetPanel } from './components/TargetPanel'
import { QueueRow } from './components/QueueRow'
import { KeyboardStage } from './components/KeyboardStage'
import { getProgressionState } from './game/selectors/progressionSelectors'
import {
  loadLastPlayerNameFromStorage,
  normalizePlayerName,
  saveLastPlayerNameToStorage,
} from './game/session/gameSession'

function GameExperience({ playerName }) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)

  const {
    levels,
    level,
    levelIndex,
    pressedCode,
    elapsedTimeMs,
    bestTimeMs,
    bestTimesByLevelId,
    sessionAttemptTimes,
    isNewBestTime,
    message,
    playing,
    complete,
    targetColor,
    ui,
    successFx,
    goToLevel,
    goToNextLevel,
  } = useTypingGame(playerName, isLeaderboardOpen)

  const gameAreaRef = useRef(null)
  const targetAreaRef = useRef(null)
  const targetVisualRef = useRef(null)
  const starCounterRef = useRef(null)
  const worldBadgeRefs = useRef({})
  const levelNodeRefs = useRef({})

  useEffect(() => {
    if (playing && !isLeaderboardOpen) {
      gameAreaRef.current?.focus()
    }
  }, [playing, levelIndex, ui.target.mode, isLeaderboardOpen])

  useEffect(() => {
    if (!isLeaderboardOpen) {
      return undefined
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setIsLeaderboardOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isLeaderboardOpen])

  const progression = useMemo(
      () =>
          getProgressionState({
            levels,
            level,
            levelIndex,
            complete,
          }),
      [levels, level, levelIndex, complete],
  )

  const effects = useStageEffects({
    ui,
    successFx,
    complete,
    level,
    levelIndex,
    currentWorld: progression.currentWorld,
    isWorldBoundary: progression.isWorldBoundary,
    isStandardLevelComplete: progression.isStandardLevelComplete,
    targetAreaRef,
    targetVisualRef,
    starCounterRef,
    worldBadgeRefs,
    levelNodeRefs,
  })

  const showNextButton =
      complete && progression.hasNextLevel && !progression.isWorldBoundary
  const showWorldNextButton =
      progression.hasNextLevel && progression.isWorldBoundary && effects.showWorldCta
  const showPlayAgainButton = progression.gameFinished && effects.showWorldCta
  const queueDimmed = effects.levelCompleteFx.active || effects.worldCompleteFx.active

  const levelSummary = complete
      ? {
        currentRunTimeMs: elapsedTimeMs,
        bestTimeMs,
        sessionAttemptTimes,
        isNewBestTime,
      }
      : null

  const summaryActionLabel = showNextButton
      ? 'Next level'
      : showWorldNextButton
          ? `Enter ${progression.unlockedWorldMeta?.title}`
          : showPlayAgainButton
              ? 'Play again'
              : ''

  const summaryActionButtonClassName = showNextButton
      ? 'soft-button'
      : 'big-button world-enter-button'

  const handleSummaryAction = showPlayAgainButton
      ? () => goToLevel(0)
      : goToNextLevel

  function toggleLeaderboard() {
    setIsLeaderboardOpen((currentValue) => !currentValue)
  }

  return (
      <div className="game-shell">
        <div className="game-screen">
          <main className="stage-card" ref={gameAreaRef} tabIndex={-1}>
            <StageHeader
                playerName={playerName}
                level={level}
                elapsedTimeMs={elapsedTimeMs}
                bestTimeMs={bestTimeMs}
                currentWorld={progression.currentWorld}
                currentWorldLevels={progression.currentWorldLevels}
                currentLevelInWorld={progression.currentLevelInWorld}
                nextWorld={progression.nextWorld}
                gameFinished={progression.gameFinished}
                isWorldBoundary={progression.isWorldBoundary}
                isStandardLevelComplete={progression.isStandardLevelComplete}
                worldCompleteFx={effects.worldCompleteFx}
                levelCompleteFx={effects.levelCompleteFx}
                starPulse={effects.starPulse}
                starCounterRef={starCounterRef}
                worldBadgeRefs={worldBadgeRefs}
                levelNodeRefs={levelNodeRefs}
                isLeaderboardOpen={isLeaderboardOpen}
                onToggleLeaderboard={toggleLeaderboard}
            />

            <LeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
                playerName={playerName}
                levels={levels}
                bestTimesByLevelId={bestTimesByLevelId}
            />

            {!complete ? (
                <div className="guidance-row">
                  <div className="message-line">{message}</div>
                </div>
            ) : null}

            <TargetPanel
                refTargetArea={targetAreaRef}
                refTargetVisual={targetVisualRef}
                ui={ui}
                targetColor={targetColor}
                successFx={successFx}
                showSuccessBurst={effects.showSuccessBurst}
                showPraiseChip={effects.showPraiseChip}
                clipboardBurst={effects.clipboardBurst}
                targetBurst={effects.targetBurst}
                levelCompleteFx={effects.levelCompleteFx}
                worldCompleteFx={effects.worldCompleteFx}
                showLevelSummary={effects.showLevelSummary}
                showPortalCard={effects.showPortalCard}
                gameFinished={progression.gameFinished}
                unlockedWorldMeta={progression.unlockedWorldMeta}
                levelSummary={levelSummary}
                summaryActionLabel={summaryActionLabel}
                summaryActionButtonClassName={summaryActionButtonClassName}
                onSummaryAction={summaryActionLabel ? handleSummaryAction : undefined}
            />

            <QueueRow queue={ui.queue} dimmed={queueDimmed} />

            {effects.flyingStar ? (
                <div
                    className="flying-reward-star"
                    style={{
                      '--start-x': `${effects.flyingStar.startX}px`,
                      '--start-y': `${effects.flyingStar.startY}px`,
                      '--fly-x': `${effects.flyingStar.deltaX}px`,
                      '--fly-y': `${effects.flyingStar.deltaY}px`,
                    }}
                    aria-hidden="true"
                >
                  ⭐
                </div>
            ) : null}

            {effects.levelTravelStars.map((star) => (
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

            {effects.worldTravelStars.map((star) => (
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

          <KeyboardStage
              level={level}
              ui={ui}
              pressedCode={pressedCode}
          />
        </div>
      </div>
  )
}

function App() {
  const [draftPlayerName, setDraftPlayerName] = useState(() => loadLastPlayerNameFromStorage())
  const [activePlayerName, setActivePlayerName] = useState(() => loadLastPlayerNameFromStorage())
  const [nameError, setNameError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const normalizedPlayerName = normalizePlayerName(draftPlayerName)

    if (!normalizedPlayerName) {
      setNameError('Please type your name or nickname.')
      return
    }

    saveLastPlayerNameToStorage(normalizedPlayerName)
    setNameError('')
    setActivePlayerName(normalizedPlayerName)
  }

  if (!activePlayerName) {
    return (
        <div className="game-shell">
          <section className="launch-card" aria-labelledby="launch-title">
            <div className="launch-card-badge">⭐ Score Keeper</div>

            <div className="launch-card-copy">
              <h1 className="launch-card-title" id="launch-title">Who is playing today?</h1>
              <p className="launch-card-text">
                Type a name or nickname before the game starts.
              </p>
              <p className="launch-card-subtext">
                That name will match the best scores saved on this device.
              </p>
            </div>

            <form className="launch-form" onSubmit={handleSubmit}>
              <label className="launch-label" htmlFor="player-name-input">
                Name or nickname
              </label>

              <input
                  id="player-name-input"
                  className="launch-input"
                  type="text"
                  value={draftPlayerName}
                  onChange={(event) => {
                    setDraftPlayerName(event.target.value)
                    if (nameError) {
                      setNameError('')
                    }
                  }}
                  placeholder="Type a name"
                  maxLength={24}
                  autoFocus
              />

              {nameError ? <div className="launch-error">{nameError}</div> : null}

              <button className="big-button launch-button" type="submit">
                Start game
              </button>
            </form>
          </section>
        </div>
    )
  }

  return <GameExperience playerName={activePlayerName} />
}

export default App