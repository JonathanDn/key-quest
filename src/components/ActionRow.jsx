import React from 'react'

export function ActionRow({
                              showNextButton,
                              showWorldNextButton,
                              showPlayAgainButton,
                              nextCountdown,
                              worldCountdown,
                              unlockedWorldMeta,
                              goToNextLevel,
                              goToLevel,
                          }) {
    return (
        <div className="action-row">
            {showNextButton ? (
                <button className="soft-button" onClick={goToNextLevel}>
                    Next now{nextCountdown !== null ? ` (${nextCountdown})` : ''}
                </button>
            ) : null}

            {showWorldNextButton ? (
                <button className="big-button world-enter-button" onClick={goToNextLevel}>
                    Enter {unlockedWorldMeta?.title}
                    {worldCountdown !== null ? ` (${worldCountdown})` : ''}
                </button>
            ) : null}

            {showPlayAgainButton ? (
                <button className="big-button world-enter-button" onClick={() => goToLevel(0)}>
                    Play again
                </button>
            ) : null}
        </div>
    )
}