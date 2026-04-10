import React from 'react'
import {
    KEYBOARD_ROWS,
    FINGER_COLORS,
    KEY_TO_FINGER,
} from '../game/content/keyData'

export function KeyboardStage({ level, ui, pressedCode }) {
    return (
        <section className="keyboard-stage">
            <div className="keyboard">
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div className="keyboard-row" key={`row-${rowIndex}`}>
                        {row.map((key) => {
                            const isTarget = ui.keyboard.targetCodes.includes(key.code)
                            const isComboPart = ui.keyboard.comboCodes.includes(key.code)
                            const isPressed = pressedCode === key.code
                            const isHeld = ui.keyboard.heldKeys.has(key.code)
                            const isInLevel = level.keys.includes(key.code)
                            const finger = KEY_TO_FINGER[key.code]

                            return (
                                <div
                                    key={key.code}
                                    className={[
                                        'keycap',
                                        key.wide ? 'wide' : '',
                                        isTarget ? 'target' : '',
                                        isComboPart ? 'combo-part' : '',
                                        isHeld ? 'held' : '',
                                        isPressed ? 'pressed' : '',
                                        !isInLevel ? 'dimmed' : '',
                                    ].join(' ')}
                                    style={{ '--finger-color': FINGER_COLORS[finger] }}
                                >
                                    <span>{key.label}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </section>
    )
}