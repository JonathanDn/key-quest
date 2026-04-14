import {
    FINGER_COLORS,
    KEY_TO_FINGER,
    codeToLabel,
} from '../content/keyData'

function pickNonRepeatingPrompt(pool, previousPrompt) {
    if (!pool.length) {
        return ''
    }

    if (pool.length === 1) {
        return pool[0]
    }

    let nextPrompt = pool[Math.floor(Math.random() * pool.length)]

    while (nextPrompt === previousPrompt) {
        nextPrompt = pool[Math.floor(Math.random() * pool.length)]
    }

    return nextPrompt
}

function charToCode(char) {
    if (char === ' ') {
        return 'Space'
    }

    if (/^[a-z]$/i.test(char)) {
        return `Key${char.toUpperCase()}`
    }

    if (char === ',') {
        return 'Comma'
    }

    if (char === '.') {
        return 'Period'
    }

    if (char === ';') {
        return 'Semicolon'
    }

    if (char === '/') {
        return 'Slash'
    }

    throw new Error(`Unsupported prompt character: ${char}`)
}

export const promptEngine = {
    createRound(level) {
        const promptCount = level.promptCount ?? 3
        const targets = []
        let previousPrompt = null

        for (let promptIndex = 0; promptIndex < promptCount; promptIndex += 1) {
            const promptText = pickNonRepeatingPrompt(level.promptPool, previousPrompt)
            previousPrompt = promptText

            Array.from(promptText).forEach((char, charIndex) => {
                targets.push({
                    type: 'single',
                    code: charToCode(char),
                    id: `${level.id}-prompt-${promptIndex}-char-${charIndex}-${Math.random().toString(16).slice(2)}`,
                    stepText: promptText,
                    stepCharIndex: charIndex,
                    stepId: `${level.id}-prompt-${promptIndex}`,
                })
            })
        }

        return targets
    },

    getGuidance(target) {
        if (!target?.stepText) {
            return ''
        }

        return `Type "${target.stepText}"`
    },

    getView() {
        return {
            taskLabel: '',
            sourceText: '',
            clipboardText: '',
            targetText: '',
        }
    },

    getTargetColor(target) {
        if (!target) {
            return '#ffffff'
        }

        return FINGER_COLORS[KEY_TO_FINGER[target.code]] ?? '#ffffff'
    },

    shouldPreventDefault() {
        return false
    },

    handleKeyDown({ target, normalizedCode }) {
        if (!target) {
            return { type: 'none' }
        }

        if (normalizedCode === target.code) {
            return { type: 'success' }
        }

        return {
            type: 'message',
            message: `Try ${codeToLabel[target.code] ?? target.code}`,
            failure: true,
        }
    },
}
