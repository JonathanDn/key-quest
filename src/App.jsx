import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useBestTimeSync } from './hooks/useBestTimeSync'
import { useTypingGame } from './hooks/useTypingGame'
import { useStageEffects } from './hooks/useStageEffects'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { useGlobalLeaderboardPreload } from './hooks/useGlobalLeaderboardPreload'
import { getMyProfile, saveMyProfile } from './lib/profile'
import { getMyBestTimes } from './lib/remoteBestTimes'
import { StageHeader } from './components/StageHeader'
import { LeaderboardModal } from './components/LeaderboardModal'
import { TargetPanel } from './components/TargetPanel'
import { QueueRow } from './components/QueueRow'
import { KeyboardStage } from './components/KeyboardStage'
import { getProgressionState } from './game/selectors/progressionSelectors'
import { normalizePlayerName } from './game/session/gameSession'

function GameExperience({ playerName, userId, cloudBestTimes }) {
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
  } = useTypingGame(playerName, isLeaderboardOpen, cloudBestTimes)

  const { topByLevelId: globalTopByLevelId } = useGlobalLeaderboardPreload(
      levels,
      Boolean(userId),
  )

  const gameAreaRef = useRef(null)
  const targetAreaRef = useRef(null)
  const targetVisualRef = useRef(null)
  const starCounterRef = useRef(null)
  const worldBadgeRefs = useRef({})
  const levelNodeRefs = useRef({})

  useBestTimeSync({
    userId,
    bestTimesByLevelId,
    cloudBestTimes,
  })

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
                currentLevelId={level.id}
                globalTopByLevelId={globalTopByLevelId}
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

function getSuggestedPlayerNameFromUser(user) {
  const metadataName = normalizePlayerName(
      user?.user_metadata?.display_name ??
      user?.user_metadata?.name ??
      '',
  )

  if (metadataName) {
    return metadataName
  }

  const emailPrefix = (user?.email ?? '').split('@')[0] ?? ''
  return normalizePlayerName(emailPrefix)
}

function App() {
  const {
    user,
    loading: authLoading,
    isSignedIn,
    signUpWithPassword,
    signInWithPassword,
    signOut,
  } = useSupabaseAuth()

  const [draftPlayerName, setDraftPlayerName] = useState('')
  const [activePlayerName, setActivePlayerName] = useState('')
  const [cloudBestTimes, setCloudBestTimes] = useState({})
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [nameError, setNameError] = useState('')

  const [authMode, setAuthMode] = useState('sign_in')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAccountData() {
      if (!isSignedIn || !user?.id) {
        setDraftPlayerName('')
        setActivePlayerName('')
        setCloudBestTimes({})
        setProfileError('')
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      setProfileError('')

      try {
        const [profile, bestTimesByLevelId] = await Promise.all([
          getMyProfile(user.id),
          getMyBestTimes(user.id),
        ])

        if (!isMounted) {
          return
        }

        const profileNickname = normalizePlayerName(profile?.nickname ?? '')
        const suggestedPlayerName = getSuggestedPlayerNameFromUser(user)

        setCloudBestTimes(bestTimesByLevelId ?? {})

        if (profileNickname) {
          setDraftPlayerName(profileNickname)
          setActivePlayerName(profileNickname)
        } else {
          setDraftPlayerName(suggestedPlayerName)
          setActivePlayerName('')
        }

        if (user.email) {
          setAuthEmail(user.email)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setCloudBestTimes({})
        setActivePlayerName('')
        setProfileError(error?.message || 'Could not load your account data.')
      } finally {
        if (isMounted) {
          setProfileLoading(false)
        }
      }
    }

    loadAccountData()

    return () => {
      isMounted = false
    }
  }, [isSignedIn, user])

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedPlayerName = normalizePlayerName(draftPlayerName)

    if (!normalizedPlayerName) {
      setNameError('Please type your nickname before you play.')
      return
    }

    if (!user?.id) {
      setNameError('You must be signed in first.')
      return
    }

    try {
      setNameError('')
      setProfileError('')

      const savedProfile = await saveMyProfile({
        userId: user.id,
        nickname: normalizedPlayerName,
      })

      const nextNickname = normalizePlayerName(savedProfile.nickname)

      setDraftPlayerName(nextNickname)
      setActivePlayerName(nextNickname)
    } catch (error) {
      setNameError(error?.message || 'Could not save your nickname.')
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()

    const normalizedEmail = authEmail.trim()

    if (!normalizedEmail) {
      setAuthError('Please type your email.')
      setAuthMessage('')
      return
    }

    if (!authPassword) {
      setAuthError('Please type your password.')
      setAuthMessage('')
      return
    }

    try {
      setAuthError('')
      setAuthMessage('')

      if (authMode === 'sign_in') {
        await signInWithPassword(normalizedEmail, authPassword)
      } else {
        await signUpWithPassword(normalizedEmail, authPassword)
        setAuthMessage('Account created. You are now signed in.')
      }
    } catch (error) {
      setAuthMessage('')
      setAuthError(error?.message || 'Could not complete authentication.')
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setDraftPlayerName('')
      setActivePlayerName('')
      setCloudBestTimes({})
      setProfileError('')
      setAuthMessage('')
      setAuthError('')
      setNameError('')
      setAuthPassword('')
    } catch (error) {
      setAuthError(error?.message || 'Could not sign out right now.')
    }
  }

  if (activePlayerName) {
    return (
        <GameExperience
            playerName={activePlayerName}
            userId={user?.id ?? null}
            cloudBestTimes={cloudBestTimes}
        />
    )
  }

  if (authLoading) {
    return (
        <div className="game-shell">
          <section className="launch-card" aria-labelledby="launch-title">
            <div className="launch-card-badge account">☁️ Loading</div>

            <div className="launch-card-copy">
              <h1 className="launch-card-title" id="launch-title">Checking your account…</h1>
              <p className="launch-card-text">
                One moment while Key Quest checks your sign-in.
              </p>
            </div>
          </section>
        </div>
    )
  }

  if (!isSignedIn) {
    return (
        <div className="game-shell">
          <section className="launch-card" aria-labelledby="launch-title">
            <div className="launch-card-badge">☁️ Sign In</div>

            <div className="launch-card-copy">
              <h1 className="launch-card-title" id="launch-title">
                {authMode === 'sign_in' ? 'Sign in and play' : 'Create your account'}
              </h1>
              <p className="launch-card-text">
                {authMode === 'sign_in'
                    ? 'Sign in with your email and password to enter Key Quest.'
                    : 'Create an account with your email and password to enter Key Quest.'}
              </p>
              <p className="launch-card-subtext">
                After sign-in, you will choose your nickname if your account does not have one yet.
              </p>
            </div>

            <div className="launch-auth-mode-row">
              <button
                  type="button"
                  className={[
                    'launch-auth-mode-button',
                    authMode === 'sign_in' ? 'active' : '',
                  ].join(' ')}
                  onClick={() => {
                    setAuthMode('sign_in')
                    setAuthError('')
                    setAuthMessage('')
                  }}
              >
                Sign in
              </button>

              <button
                  type="button"
                  className={[
                    'launch-auth-mode-button',
                    authMode === 'sign_up' ? 'active' : '',
                  ].join(' ')}
                  onClick={() => {
                    setAuthMode('sign_up')
                    setAuthError('')
                    setAuthMessage('')
                  }}
              >
                Create account
              </button>
            </div>

            <form className="launch-auth-form" onSubmit={handleAuthSubmit}>
              <label className="launch-label" htmlFor="auth-email-input">
                Email
              </label>

              <input
                  id="auth-email-input"
                  className="launch-input"
                  type="email"
                  value={authEmail}
                  onChange={(event) => {
                    setAuthEmail(event.target.value)
                    if (authError) {
                      setAuthError('')
                    }
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
              />

              <label className="launch-label" htmlFor="auth-password-input">
                Password
              </label>

              <input
                  id="auth-password-input"
                  className="launch-input"
                  type="password"
                  value={authPassword}
                  onChange={(event) => {
                    setAuthPassword(event.target.value)
                    if (authError) {
                      setAuthError('')
                    }
                  }}
                  placeholder="Type your password"
                  autoComplete={authMode === 'sign_in' ? 'current-password' : 'new-password'}
              />

              {authError ? <div className="launch-error">{authError}</div> : null}
              {authMessage ? <div className="launch-success">{authMessage}</div> : null}

              <button className="big-button launch-button" type="submit">
                {authMode === 'sign_in' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </section>
        </div>
    )
  }

  if (profileLoading) {
    return (
        <div className="game-shell">
          <section className="launch-card" aria-labelledby="launch-title">
            <div className="launch-card-badge account">☁️ Account Ready</div>

            <div className="launch-card-copy">
              <h1 className="launch-card-title" id="launch-title">Loading your profile…</h1>
              <p className="launch-card-text">
                One moment while Key Quest checks your nickname and best scores.
              </p>
            </div>
          </section>
        </div>
    )
  }

  return (
      <div className="game-shell">
        <section className="launch-card" aria-labelledby="launch-title">
          <div className="launch-card-badge account">☁️ Account Ready</div>

          <div className="launch-card-copy">
            <h1 className="launch-card-title" id="launch-title">Pick your nickname</h1>
            <p className="launch-card-text">
              You are signed in. Choose the nickname you want to use in the game.
            </p>
            <p className="launch-card-subtext">
              Returning signed-in players with a saved nickname will skip this screen automatically.
            </p>
          </div>

          <div className="launch-status">
            <div className="launch-status-row">
              <div className="launch-status-copy">
                <div className="launch-status-label">Signed in as</div>
                <div className="launch-status-value">{user?.email}</div>
              </div>

              <button
                  type="button"
                  className="launch-inline-button"
                  onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>

          <form className="launch-form" onSubmit={handleSubmit}>
            <label className="launch-label" htmlFor="player-name-input">
              Nickname
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
                placeholder="Type a nickname"
                maxLength={24}
                autoFocus
            />

            {profileError ? <div className="launch-error">{profileError}</div> : null}
            {nameError ? <div className="launch-error">{nameError}</div> : null}

            <button className="big-button launch-button" type="submit">
              Save nickname and play
            </button>
          </form>
        </section>
      </div>
  )
}

export default App