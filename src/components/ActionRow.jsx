import React from 'react'

export function ActionRow({
                              showNextButton,
                              showWorldNextButton,
                              showPlayAgainButton,
                              unlockedWorldMeta,
                              goToNextLevel,
                              goToLevel,
                          }) {
    return (
        <div className="action-row">
            {showNextButton ? (
                <button className="soft-button" onClick={goToNextLevel}>
                    Next level
                </button>
            ) : null}

            {showWorldNextButton ? (
                <button className="big-button world-enter-button" onClick={goToNextLevel}>
                    Enter {unlockedWorldMeta?.title}
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