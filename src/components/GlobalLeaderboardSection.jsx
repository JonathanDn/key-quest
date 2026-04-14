import React, { useEffect, useMemo, useState } from 'react'
import '../styles/global-leaderboard.css'
import { WORLD_META } from '../game/content/worldMeta'

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

function buildGlobalWorldSections(levels, bestTimesByLevelId) {
    const baseSections = WORLD_META.map((worldMeta) => {
        const worldLevels = levels.filter((entry) => entry.world === worldMeta.world)

        return {
            ...worldMeta,
            levels: worldLevels.map((entry, index) => ({
                id: entry.id,
                levelLabel: `Level ${index + 1}`,
            })),
        }
    }).filter((section) => section.levels.length > 0)

    let previousWorldComplete = true

    return baseSections.map((section, index) => {
        const worldComplete =
            section.levels.length > 0 &&
            section.levels.every(
                (entry) => typeof bestTimesByLevelId[entry.id] === 'number',
            )

        const unlocked =
            index === 0 ||
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

export function GlobalLeaderboardSection({
                                             levels,
                                             bestTimesByLevelId,
                                             currentLevelId,
                                             globalTopByLevelId,
                                         }) {
    const worldSections = useMemo(
        () => buildGlobalWorldSections(levels, bestTimesByLevelId),
        [levels, bestTimesByLevelId],
    )

    const [expandedWorlds, setExpandedWorlds] = useState({})

    useEffect(() => {
        setExpandedWorlds((previousValue) => {
            const nextValue = {}

            worldSections.forEach((section) => {
                nextValue[section.world] =
                    previousValue[section.world] ??
                    (section.unlocked && section.levels.some((entry) => entry.id === currentLevelId))
            })

            return nextValue
        })
    }, [worldSections, currentLevelId])

    function toggleWorld(worldNumber) {
        const section = worldSections.find((entry) => entry.world === worldNumber)

        if (!section?.unlocked) {
            return
        }

        setExpandedWorlds((previousValue) => ({
            ...previousValue,
            [worldNumber]: !previousValue[worldNumber],
        }))
    }

    function getPreviewText(levelId) {
        const topRow = globalTopByLevelId?.[levelId] ?? null

        if (!topRow) {
            return '—'
        }

        return `${topRow.nickname} · ${formatElapsedTime(topRow.best_time_ms)}`
    }

    return (
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
                                    <div
                                        className={[
                                            'leaderboard-level-row',
                                            'leaderboard-global-static-row',
                                            currentLevelId === entry.id ? 'current-level' : '',
                                        ].join(' ')}
                                        key={entry.id}
                                    >
                    <span className="leaderboard-level-label">
                      {entry.levelLabel}
                    </span>

                                        <span
                                            className={[
                                                'leaderboard-global-static-value',
                                                getPreviewText(entry.id) === '—' ? 'empty' : '',
                                            ].join(' ')}
                                        >
                      {getPreviewText(entry.id)}
                    </span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}