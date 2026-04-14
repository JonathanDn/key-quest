import React, { useEffect, useMemo, useState } from 'react'
import { WORLD_META } from '../game/content/worldMeta'
import { getLevelLeaderboard } from '../lib/globalLeaderboard'

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

function getCurrentLevelDescriptor(levels, currentLevelId) {
    if (!currentLevelId) {
        return null
    }

    const currentLevel = levels.find((entry) => entry.id === currentLevelId)

    if (!currentLevel) {
        return null
    }

    const worldLevels = levels.filter((entry) => entry.world === currentLevel.world)
    const levelIndex = worldLevels.findIndex((entry) => entry.id === currentLevelId)
    const worldMeta = WORLD_META.find((entry) => entry.world === currentLevel.world)

    return {
        id: currentLevel.id,
        world: currentLevel.world,
        worldTitle: worldMeta?.title ?? `World ${currentLevel.world}`,
        icon: worldMeta?.icon ?? '🌍',
        levelLabel: `Level ${levelIndex + 1}`,
    }
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

function GlobalLeaderboardView({
                                   currentLevelDescriptor,
                                   loading,
                                   error,
                                   topRows,
                                   currentUserRow,
                               }) {
    if (!currentLevelDescriptor) {
        return (
            <div className="leaderboard-empty">
                No level selected yet.
            </div>
        )
    }

    return (
        <div className="leaderboard-global-content">
            <div className="leaderboard-global-card">
                <div className="leaderboard-global-card-title-row">
                    <span className="leaderboard-world-icon" aria-hidden="true">
                        {currentLevelDescriptor.icon}
                    </span>
                    <div className="leaderboard-global-card-copy">
                        <div className="leaderboard-global-card-title">
                            {currentLevelDescriptor.worldTitle} World
                        </div>
                        <div className="leaderboard-global-card-subtitle">
                            {currentLevelDescriptor.levelLabel} · Global top scores
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="leaderboard-empty">Loading global leaderboard…</div>
            ) : null}

            {!loading && error ? (
                <div className="leaderboard-empty">{error}</div>
            ) : null}

            {!loading && !error && !topRows.length ? (
                <div className="leaderboard-empty">
                    No global scores yet for this level.
                </div>
            ) : null}

            {!loading && !error && topRows.length ? (
                <div className="leaderboard-global-list">
                    {topRows.map((row) => (
                        <div
                            key={`${row.row_kind}-${row.user_id}-${row.rank}`}
                            className={[
                                'leaderboard-global-row',
                                row.is_current_user ? 'current-user' : '',
                            ].join(' ')}
                        >
                            <span className="leaderboard-global-rank">#{row.rank}</span>
                            <span className="leaderboard-global-name">{row.nickname}</span>
                            <span className="leaderboard-global-time">
                                {formatElapsedTime(row.best_time_ms)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}

            {!loading && !error && currentUserRow && currentUserRow.row_kind === 'self' ? (
                <div className="leaderboard-global-self-card">
                    <div className="leaderboard-global-self-title">Your rank</div>
                    <div className="leaderboard-global-row current-user">
                        <span className="leaderboard-global-rank">#{currentUserRow.rank}</span>
                        <span className="leaderboard-global-name">{currentUserRow.nickname}</span>
                        <span className="leaderboard-global-time">
                            {formatElapsedTime(currentUserRow.best_time_ms)}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export function LeaderboardModal({
                                     isOpen,
                                     onClose,
                                     playerName,
                                     levels,
                                     bestTimesByLevelId,
                                     currentLevelId,
                                 }) {
    const worldSections = useMemo(
        () => buildWorldSections(levels, bestTimesByLevelId),
        [levels, bestTimesByLevelId],
    )

    const currentLevelDescriptor = useMemo(
        () => getCurrentLevelDescriptor(levels, currentLevelId),
        [levels, currentLevelId],
    )

    const [expandedWorlds, setExpandedWorlds] = useState({})
    const [activeTab, setActiveTab] = useState('my_bests')
    const [globalLoading, setGlobalLoading] = useState(false)
    const [globalError, setGlobalError] = useState('')
    const [globalTopRows, setGlobalTopRows] = useState([])
    const [globalCurrentUserRow, setGlobalCurrentUserRow] = useState(null)

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

    useEffect(() => {
        if (!isOpen || activeTab !== 'global' || !currentLevelId) {
            return
        }

        let isMounted = true

        async function loadGlobalLeaderboard() {
            setGlobalLoading(true)
            setGlobalError('')

            try {
                const result = await getLevelLeaderboard({
                    levelId: currentLevelId,
                    limit: 10,
                })

                if (!isMounted) {
                    return
                }

                setGlobalTopRows(result.topRows)
                setGlobalCurrentUserRow(result.currentUserRow)
            } catch (error) {
                if (!isMounted) {
                    return
                }

                setGlobalTopRows([])
                setGlobalCurrentUserRow(null)
                setGlobalError(error?.message || 'Could not load global leaderboard.')
            } finally {
                if (isMounted) {
                    setGlobalLoading(false)
                }
            }
        }

        loadGlobalLeaderboard()

        return () => {
            isMounted = false
        }
    }, [isOpen, activeTab, currentLevelId])

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
                    <GlobalLeaderboardView
                        currentLevelDescriptor={currentLevelDescriptor}
                        loading={globalLoading}
                        error={globalError}
                        topRows={globalTopRows}
                        currentUserRow={globalCurrentUserRow}
                    />
                )}
            </section>
        </div>
    )
}