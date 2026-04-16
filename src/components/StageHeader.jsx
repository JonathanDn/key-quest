import React from 'react'
import { WORLD_META } from '../game/content/worldMeta'

const TROPHY_ICON_SRC = '/trophy.png'

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

export function StageHeader({
                                playerName,
                                draftPlayerName,
                                levels,
                                level,
                                elapsedTimeMs,
                                bestTimeMs,
                                successStreak,
                                bestSuccessStreak,
                                currentWorld,
                                currentWorldLevels,
                                currentLevelInWorld,
                                nextWorld,
                                gameFinished,
                                isWorldBoundary,
                                isStandardLevelComplete,
                                worldCompleteFx,
                                levelCompleteFx,
                                starPulse,
                                starCounterRef,
                                worldBadgeRefs,
                                levelNodeRefs,
                                isLeaderboardOpen,
                                onToggleLeaderboard,
                                highestUnlockedLevelIndex,
                                onSelectLevel,
                                isEditingPlayerName,
                                isSavingPlayerName,
                                didSavePlayerName,
                                playerNameError,
                                onStartEditingPlayerName,
                                onDraftPlayerNameChange,
                                onSavePlayerName,
                                onCancelEditingPlayerName,
                            }) {
    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <button
                    type="button"
                    className={[
                        'scoreboard-toggle',
                        isLeaderboardOpen ? 'active' : '',
                    ].join(' ')}
                    aria-label={isLeaderboardOpen ? 'Close my leaderboard' : 'Open my leaderboard'}
                    aria-pressed={isLeaderboardOpen}
                    onClick={onToggleLeaderboard}
                >
                    <img
                        src={TROPHY_ICON_SRC}
                        alt=""
                        className="scoreboard-toggle-icon"
                        draggable="false"
                        aria-hidden="true"
                    />
                </button>

                <div
                    className={[
                        'mini-pill',
                        'top-bar-context-pill',
                        'top-bar-context-stack',
                        isEditingPlayerName ? 'editing' : '',
                    ].join(' ')}
                >
                    {isEditingPlayerName ? (
                        <form className="top-bar-player-edit-form" onSubmit={onSavePlayerName}>
                            <label className="sr-only" htmlFor="in-game-player-name-input">
                                Nickname
                            </label>
                            <input
                                id="in-game-player-name-input"
                                className="top-bar-player-edit-input"
                                type="text"
                                value={draftPlayerName}
                                onChange={(event) => onDraftPlayerNameChange(event.target.value)}
                                placeholder="Type a nickname"
                                maxLength={24}
                                autoFocus
                            />
                            <div className="top-bar-player-edit-actions">
                                <button
                                    type="submit"
                                    className="top-bar-player-edit-action"
                                    disabled={isSavingPlayerName}
                                >
                                    {isSavingPlayerName ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    className="top-bar-player-edit-action secondary"
                                    onClick={onCancelEditingPlayerName}
                                    disabled={isSavingPlayerName}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="top-bar-context-player-row">
                            {playerName ? (
                                <span
                                    className={[
                                        'top-bar-context-player',
                                        didSavePlayerName ? 'saved' : '',
                                    ].join(' ')}
                                >
                                    {playerName}
                                </span>
                            ) : null}
                            {didSavePlayerName ? (
                                <span className="top-bar-player-save-indicator" aria-live="polite">
                                    Saved ✓
                                </span>
                            ) : null}
                            <button
                                type="button"
                                className="top-bar-player-edit-toggle"
                                onClick={onStartEditingPlayerName}
                                aria-label="Edit nickname"
                                title="Edit nickname"
                            >
                                ✏️
                            </button>
                        </div>
                    )}
                    {playerNameError ? (
                        <span className="top-bar-player-edit-error">{playerNameError}</span>
                    ) : null}
                    <span className="top-bar-context-level">
                        {level.title} · {currentLevelInWorld}/{currentWorldLevels.length}
                    </span>
                </div>
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
                        const isLockIn = entry.world === currentWorld && isWorldBoundary && isPortalPhase
                        const isUnlockPulse =
                            !gameFinished &&
                            entry.world === nextWorld &&
                            (worldCompleteFx.phase === 'portal' || worldCompleteFx.phase === 'ready')
                        const worldAnchorLevelIndex = levels.findIndex((levelEntry) => levelEntry.world === entry.world)
                        const isWorldUnlocked =
                            worldAnchorLevelIndex >= 0 && worldAnchorLevelIndex <= highestUnlockedLevelIndex

                        return (
                            <button
                                key={entry.world}
                                type="button"
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
                                disabled={!isWorldUnlocked}
                                onClick={() => {
                                    if (isWorldUnlocked) {
                                        onSelectLevel(worldAnchorLevelIndex)
                                    }
                                }}
                            >
                                <span>{entry.icon}</span>
                                <span>{entry.title}</span>
                            </button>
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
                            const isUnlocked = entry.index <= highestUnlockedLevelIndex

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

                                    <button
                                        type="button"
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
                                        disabled={!isUnlocked}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                onSelectLevel(entry.index)
                                            }
                                        }}
                                    >
                                        {isDone ? '★' : ''}
                                    </button>
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="top-bar-right-stack">
                <div className="mini-pill top-bar-pill">
                    ⏱ {formatElapsedTime(elapsedTimeMs)}
                    {typeof bestTimeMs === 'number' ? ` · Best ${formatElapsedTime(bestTimeMs)}` : ''}
                </div>

                <div
                    ref={starCounterRef}
                    className={[
                        'mini-pill',
                        'top-bar-pill',
                        starPulse ? 'star-counter-pop' : '',
                    ].join(' ')}
                >
                    {`🔥 ${successStreak}`}
                    {bestSuccessStreak > 0 ? ` · Max ${bestSuccessStreak}` : ''}
                </div>
            </div>
        </div>
    )
}
