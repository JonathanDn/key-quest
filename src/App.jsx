import React, { useEffect, useMemo, useRef } from 'react'
import { useTypingGame } from './hooks/useTypingGame'
import { useStageEffects } from './hooks/useStageEffects'
import { StageHeader } from './components/StageHeader'
import { TargetPanel } from './components/TargetPanel'
import { QueueRow } from './components/QueueRow'
import { ActionRow } from './components/ActionRow'
import { KeyboardStage } from './components/KeyboardStage'
import { getProgressionState } from './game/selectors/progressionSelectors'

function App() {
  const {
    levels,
    level,
    levelIndex,
    pressedCode,
    elapsedTimeMs,
    bestTimeMs,
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
  } = useTypingGame()

  const gameAreaRef = useRef(null)
  const targetAreaRef = useRef(null)
  const targetVisualRef = useRef(null)
  const starCounterRef = useRef(null)
  const worldBadgeRefs = useRef({})
  const levelNodeRefs = useRef({})

  useEffect(() => {
    if (playing) {
      gameAreaRef.current?.focus()
    }
  }, [playing, levelIndex, ui.target.mode])

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

  return (
      <div className="game-shell">
        <div className="game-screen">
          <main className="stage-card" ref={gameAreaRef} tabIndex={-1}>
            <StageHeader
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
            />

            <div className="guidance-row">
              <div className="message-line">{message}</div>
            </div>

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
            />

            <QueueRow queue={ui.queue} dimmed={queueDimmed} />

            <ActionRow
                showNextButton={showNextButton}
                showWorldNextButton={showWorldNextButton}
                showPlayAgainButton={showPlayAgainButton}
                unlockedWorldMeta={progression.unlockedWorldMeta}
                goToNextLevel={goToNextLevel}
                goToLevel={goToLevel}
            />

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

export default App