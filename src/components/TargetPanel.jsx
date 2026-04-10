import React from 'react'

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
                                showLevelBanner,
                                showPortalCard,
                                gameFinished,
                                unlockedWorldMeta,
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

            {showLevelBanner ? (
                <div className="level-complete-banner" aria-hidden="true">
                    <div className="level-complete-badge">🏅</div>
                    <div className="level-complete-copy">
                        <div className="level-complete-title">Level Clear!</div>
                        <div className="level-complete-subtitle">Great job. Ready for the next one?</div>
                    </div>
                </div>
            ) : null}

            {showPortalCard ? (
                <div className="world-portal-card" aria-hidden="true">
                    <div className="world-complete-ring" />
                    <div className="world-complete-key">🗝️</div>

                    <div className="world-complete-title">
                        {gameFinished ? 'Key Quest Complete!' : 'World Complete!'}
                    </div>

                    <div className="world-complete-subtitle">
                        {gameFinished
                            ? 'You finished every world'
                            : `You unlocked ${unlockedWorldMeta?.title}`}
                    </div>

                    <div className="world-complete-next-badge">
            <span className="world-complete-next-icon">
              {gameFinished ? '🏆' : unlockedWorldMeta?.icon}
            </span>
                        <span>
              {gameFinished ? 'All worlds cleared' : unlockedWorldMeta?.title}
            </span>
                    </div>
                </div>
            ) : null}
        </div>
    )
}