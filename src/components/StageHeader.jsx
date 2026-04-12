import React from 'react'
import { WORLD_META } from '../game/content/worldMeta'

const TROPHY_ICON_SRC = '/trophy.png'

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

export function StageHeader({
                                playerName,
                                level,
                                elapsedTimeMs,
                                bestTimeMs,
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

                <div className="mini-pill top-bar-context-pill top-bar-context-stack">
                    {playerName ? (
                        <span className="top-bar-context-player">{playerName}</span>
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
                ⏱ {formatElapsedTime(elapsedTimeMs)}
                {typeof bestTimeMs === 'number' ? ` · Best ${formatElapsedTime(bestTimeMs)}` : ''}
            </div>
        </div>
    )
}