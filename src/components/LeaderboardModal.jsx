import React, { useEffect, useMemo, useState } from 'react'
import { WORLD_META } from '../game/content/worldMeta'
import { GlobalLeaderboardSection } from './GlobalLeaderboardSection'

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

function buildWorldSections(levels, bestTimesByLevelId) {
    const baseSections = WORLD_META.map((worldMeta) => {
        const worldLevels = levels.filter((entry) => entry.world === worldMeta.world)

        return {
            ...worldMeta,
            levels: worldLevels.map((entry, index) => ({
                id: entry.id,
                levelLabel: `Level ${index + 1}`,
                bestTimeMs: bestTimesByLevelId[entry.id] ?? null,
            })),
        }
    })

    let previousWorldComplete = true

    return baseSections.map((section, index) => {
        const hasAnyScore = section.levels.some((entry) => typeof entry.bestTimeMs === 'number')
        const worldComplete =
            section.levels.length > 0 &&
            section.levels.every((entry) => typeof entry.bestTimeMs === 'number')

        const unlocked =
            index === 0 ||
            hasAnyScore ||
            previousWorldComplete

        previousWorldComplete = worldComplete

        return {
            ...section,
            unlocked,
        }
    })
}

function ChevronIcon({ collapsed }) {
    return (
        <svg
            className={[
                'leaderboard-world-toggle-icon',
                collapsed ? 'collapsed' : '',
            ].join(' ')}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5.5 7.5L10 12L14.5 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function LeaderboardModal({
                                     isOpen,
                                     onClose,
                                     playerName,
                                     levels,
                                     bestTimesByLevelId,
                                     currentLevelId,
                                     globalTopByLevelId,
                                 }) {
    const worldSections = useMemo(
        () => buildWorldSections(levels, bestTimesByLevelId),
        [levels, bestTimesByLevelId],
    )

    const [expandedWorlds, setExpandedWorlds] = useState({})
    const [activeTab, setActiveTab] = useState('my_bests')

    useEffect(() => {
        setExpandedWorlds((previousValue) => {
            const nextValue = {}

            worldSections.forEach((section) => {
                if (!section.unlocked) {
                    return
                }

                nextValue[section.world] = previousValue[section.world] ?? true
            })

            return nextValue
        })
    }, [worldSections])

    if (!isOpen) {
        return null
    }

    const allLevelRows = worldSections.flatMap((section) => section.levels)
    const clearedLevelsCount = allLevelRows.filter(
        (entry) => typeof entry.bestTimeMs === 'number',
    ).length
    const worldsUnlockedCount = worldSections.filter((section) => section.unlocked).length
    const hasScores = clearedLevelsCount > 0

    function toggleWorld(worldNumber) {
        setExpandedWorlds((previousValue) => ({
            ...previousValue,
            [worldNumber]: !previousValue[worldNumber],
        }))
    }

    return (
        <div
            className="leaderboard-backdrop"
            onClick={onClose}
        >
            <section
                className="leaderboard-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="leaderboard-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="leaderboard-header">
                    <div className="leaderboard-title-group">
                        <h2 className="leaderboard-title" id="leaderboard-title">
                            Scoreboard
                        </h2>
                        <p className="leaderboard-subtitle">
                            Private bests and global rankings
                        </p>
                    </div>

                    <button
                        type="button"
                        className="leaderboard-close"
                        aria-label="Close my leaderboard"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="leaderboard-tab-row">
                    <button
                        type="button"
                        className={[
                            'leaderboard-tab',
                            activeTab === 'my_bests' ? 'active' : '',
                        ].join(' ')}
                        onClick={() => setActiveTab('my_bests')}
                    >
                        My Bests
                    </button>

                    <button
                        type="button"
                        className={[
                            'leaderboard-tab',
                            activeTab === 'global' ? 'active' : '',
                        ].join(' ')}
                        onClick={() => setActiveTab('global')}
                    >
                        Global
                    </button>
                </div>

                {activeTab === 'my_bests' ? (
                    <>
                        <div className="leaderboard-summary">
                            <div className="leaderboard-summary-pill">
                                <span className="leaderboard-summary-label">Player</span>
                                <span className="leaderboard-summary-value">{playerName}</span>
                            </div>

                            <div className="leaderboard-summary-pill">
                                <span className="leaderboard-summary-label">Cleared</span>
                                <span className="leaderboard-summary-value">
                  {clearedLevelsCount}/{allLevelRows.length}
                </span>
                            </div>

                            <div className="leaderboard-summary-pill">
                                <span className="leaderboard-summary-label">Worlds unlocked</span>
                                <span className="leaderboard-summary-value">
                  {worldsUnlockedCount}/{worldSections.length}
                </span>
                            </div>
                        </div>

                        {!hasScores ? (
                            <div className="leaderboard-empty">
                                No scores yet. Finish a level to save your best time.
                            </div>
                        ) : null}

                        <div className="leaderboard-sections">
                            {worldSections.map((section) => {
                                const isExpanded = Boolean(expandedWorlds[section.world])

                                return (
                                    <div
                                        className={[
                                            'leaderboard-world-section',
                                            section.unlocked ? 'unlocked' : 'locked',
                                            section.unlocked && !isExpanded ? 'collapsed' : '',
                                        ].join(' ')}
                                        key={section.world}
                                    >
                                        <div className="leaderboard-world-header">
                                            <div className="leaderboard-world-title-row">
                        <span className="leaderboard-world-icon" aria-hidden="true">
                          {section.icon}
                        </span>
                                                <span className="leaderboard-world-title">
                          {section.title} World
                        </span>
                                            </div>

                                            <div className="leaderboard-world-actions">
                                                {section.unlocked ? (
                                                    <button
                                                        type="button"
                                                        className="leaderboard-world-toggle"
                                                        aria-expanded={isExpanded}
                                                        aria-label={
                                                            isExpanded
                                                                ? `Collapse ${section.title} World`
                                                                : `Expand ${section.title} World`
                                                        }
                                                        onClick={() => toggleWorld(section.world)}
                                                    >
                                                        <ChevronIcon collapsed={!isExpanded} />
                                                    </button>
                                                ) : (
                                                    <span
                                                        className="leaderboard-world-lock"
                                                        role="img"
                                                        aria-label="Locked"
                                                        title="Locked"
                                                    >
                            🔒
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        {section.unlocked && isExpanded ? (
                                            <div className="leaderboard-level-list">
                                                {section.levels.map((entry) => (
                                                    <div className="leaderboard-level-row" key={entry.id}>
                            <span className="leaderboard-level-label">
                              {entry.levelLabel}
                            </span>

                                                        <span
                                                            className={[
                                                                'leaderboard-level-time',
                                                                typeof entry.bestTimeMs === 'number' ? '' : 'empty',
                                                            ].join(' ')}
                                                        >
                              {typeof entry.bestTimeMs === 'number'
                                  ? formatElapsedTime(entry.bestTimeMs)
                                  : '—'}
                            </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <GlobalLeaderboardSection
                        levels={levels}
                        bestTimesByLevelId={bestTimesByLevelId}
                        currentLevelId={currentLevelId}
                        globalTopByLevelId={globalTopByLevelId}
                    />
                )}
            </section>
        </div>
    )
}