import React from 'react'

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

function renderWordChips(text) {
    if (!text) {
        return <span className="word-slot-placeholder">Empty</span>
    }

    return text.split(' ').map((part, index) => (
        <span className="word-chip" key={`${part}-${index}`}>
            {part}
        </span>
    ))
}

function LevelSummaryCard({
                              levelSummary,
                              variant = 'level',
                              compact = false,
                              actionLabel = '',
                              actionButtonClassName = 'soft-button',
                              onAction,
                              unlockedWorldMeta,
                              gameFinished = false,
                          }) {
    if (!levelSummary) {
        return null
    }

    const { currentRunTimeMs, bestTimeMs, sessionAttemptTimes, isNewBestTime } = levelSummary
    const visibleAttempts = sessionAttemptTimes.slice(-5)
    const firstVisibleIndex = sessionAttemptTimes.length - visibleAttempts.length
    const isWorldSummary = variant === 'world'

    const title = isWorldSummary
        ? (gameFinished ? 'Key Quest Complete!' : 'World Complete!')
        : 'Level Clear!'

    const subtitle = isWorldSummary
        ? (gameFinished ? 'You finished every world.' : `You unlocked ${unlockedWorldMeta?.title}.`)
        : 'See this run before you move on.'

    return (
        <div
            className={[
                'level-summary-card',
                compact ? 'compact' : '',
                isWorldSummary ? 'world-summary' : '',
            ].join(' ')}
        >
            <div className="level-summary-header">
                <div className="level-summary-title-row">
                    {!isWorldSummary ? (
                        <div className="level-summary-icon">🏅</div>
                    ) : null}

                    <div>
                        <div className="level-summary-title">{title}</div>
                        <div className="level-summary-subtitle">{subtitle}</div>
                    </div>
                </div>

                {!isWorldSummary && isNewBestTime ? (
                    <div className="level-summary-best-badge">✨ New best!</div>
                ) : null}
            </div>

            <div className="level-summary-stats">
                <div className="level-summary-stat">
                    <span className="level-summary-label">This run</span>
                    <span className="level-summary-value">{formatElapsedTime(currentRunTimeMs)}</span>
                </div>

                <div className="level-summary-stat">
                    <span className="level-summary-label">Best</span>
                    <span className="level-summary-value">{formatElapsedTime(bestTimeMs ?? currentRunTimeMs)}</span>
                </div>
            </div>

            {!isWorldSummary ? (
                <div className="level-summary-attempts">
                    <div className="level-summary-attempts-label">This session</div>
                    <div className="level-summary-attempt-chips">
                        {visibleAttempts.map((timeMs, index) => {
                            const actualIndex = firstVisibleIndex + index
                            const isLatest = actualIndex === sessionAttemptTimes.length - 1
                            const isBest = typeof bestTimeMs === 'number' && timeMs === bestTimeMs

                            return (
                                <span
                                    key={`${timeMs}-${actualIndex}`}
                                    className={[
                                        'level-summary-attempt-chip',
                                        isLatest ? 'latest' : '',
                                        isBest ? 'best' : '',
                                    ].join(' ')}
                                >
                                    {formatElapsedTime(timeMs)}
                                </span>
                            )
                        })}
                    </div>
                </div>
            ) : null}

            {actionLabel && onAction ? (
                <div className="level-summary-actions">
                    <button
                        type="button"
                        className={[actionButtonClassName, 'level-summary-action'].join(' ')}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </button>
                </div>
            ) : null}
        </div>
    )
}

export function TargetPanel({
                                refTargetArea,
                                refTargetVisual,
                                ui,
                                targetColor,
                                successFx,
                                showSuccessBurst,
                                showPraiseChip,
                                clipboardBurst,
                                targetBurst,
                                levelCompleteFx,
                                worldCompleteFx,
                                showLevelSummary,
                                showPortalCard,
                                gameFinished,
                                unlockedWorldMeta,
                                levelSummary,
                                summaryActionLabel,
                                summaryActionButtonClassName,
                                onSummaryAction,
                            }) {
    return (
        <div
            className={[
                'target-area',
                levelCompleteFx.active ? 'level-complete-mode' : '',
                worldCompleteFx.active ? 'world-complete-mode' : '',
                `level-phase-${levelCompleteFx.phase}`,
                `world-phase-${worldCompleteFx.phase}`,
            ].join(' ')}
            ref={refTargetArea}
        >
            <div
                ref={refTargetVisual}
                className={[
                    'target-visual',
                    showSuccessBurst ? 'success-burst' : '',
                ].join(' ')}
                style={{ '--target-color': successFx.color || targetColor }}
            >
                {showPraiseChip && successFx.praise ? (
                    <div className="success-praise-chip">{successFx.praise}</div>
                ) : null}

                <div className="success-sparkle-ring" aria-hidden="true" />

                <div className="success-sparkles" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                {ui.showWordPowerBoard ? (
                    <div className="word-power-stage" style={{ '--target-color': targetColor }}>
                        <div className="word-power-header">
                            <div className="word-power-task-pill">{ui.wordPower.taskLabel}</div>
                            <div className="word-power-action-badge">{ui.wordPower.actionLabel}</div>
                        </div>

                        <div className="word-power-lab">
                            <div className={ui.wordPower.highlightSource ? 'word-zone source active' : 'word-zone source'}>
                                <div className="word-zone-label">Copy from</div>
                                <div className="word-zone-slot">
                                    {renderWordChips(ui.wordPower.sourceText)}
                                </div>
                            </div>

                            <div className="word-flow-arrow" aria-hidden="true">
                                →
                            </div>

                            <div
                                className={[
                                    'word-zone',
                                    'clipboard',
                                    ui.wordPower.highlightClipboard ? 'active' : '',
                                    clipboardBurst ? 'burst' : '',
                                ].join(' ')}
                            >
                                <div className="word-zone-label">Clipboard</div>
                                <div className="word-zone-slot clipboard-slot">
                                    {renderWordChips(ui.wordPower.clipboardText)}
                                </div>
                            </div>

                            <div className="word-flow-arrow" aria-hidden="true">
                                →
                            </div>

                            <div
                                className={[
                                    'word-zone',
                                    'target',
                                    ui.wordPower.highlightTarget ? 'active' : '',
                                    targetBurst ? 'burst' : '',
                                ].join(' ')}
                            >
                                <div className="word-zone-label">Paste here</div>
                                <div className="word-zone-slot target-slot">
                                    {renderWordChips(ui.wordPower.targetText)}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={[
                            'big-target',
                            ui.target.isWide ? 'wide' : '',
                            ui.target.mode === 'combo' ? 'combo' : '',
                            ui.target.mode === 'textStep' ? 'text-step' : '',
                        ].join(' ')}
                        style={{ '--target-color': targetColor }}
                    >
                        {ui.target.mode === 'combo' ? (
                            <div className="combo-target">
                                {ui.target.comboChips.map((chip, index) => (
                                    <React.Fragment key={chip.code}>
                                        {index > 0 ? <span className="combo-plus">+</span> : null}
                                        <span className={chip.held ? 'combo-chip held' : 'combo-chip'}>
                                            {chip.label}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : ui.target.mode === 'textStep' ? (
                            <div className="word-target">
                                <span className="word-done">{ui.target.stepDoneText}</span>
                                <span className="word-current">{ui.target.stepCurrentChar}</span>
                                <span className="word-upcoming">{ui.target.stepUpcomingText}</span>
                            </div>
                        ) : (
                            ui.target.label
                        )}
                    </div>
                )}
            </div>

            {showLevelSummary ? (
                <LevelSummaryCard
                    levelSummary={levelSummary}
                    variant="level"
                    actionLabel={summaryActionLabel}
                    actionButtonClassName={summaryActionButtonClassName}
                    onAction={onSummaryAction}
                />
            ) : null}

            {showPortalCard ? (
                <div className="world-portal-card">
                    <div className="world-complete-ring" aria-hidden="true" />

                    <LevelSummaryCard
                        levelSummary={levelSummary}
                        variant="world"
                        compact
                        actionLabel={summaryActionLabel}
                        actionButtonClassName={summaryActionButtonClassName}
                        onAction={onSummaryAction}
                        unlockedWorldMeta={unlockedWorldMeta}
                        gameFinished={gameFinished}
                    />
                </div>
            ) : null}
        </div>
    )
}