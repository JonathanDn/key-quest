import {
    FINGER_COLORS,
    KEY_TO_FINGER,
    codeToLabel,
} from '../content/keyData'

function getTargetSignature(target) {
    if (target.type === 'combo') {
        return `combo:${target.codes.join('+')}`
    }

    return `single:${target.code}`
}

function pickNonRepeatingTarget(pool, previousSignature) {
    if (!pool.length) {
        return null
    }

    if (pool.length === 1) {
        return pool[0]
    }

    let nextTarget = pool[Math.floor(Math.random() * pool.length)]
    let nextSignature = getTargetSignature(nextTarget)

    while (nextSignature === previousSignature) {
        nextTarget = pool[Math.floor(Math.random() * pool.length)]
        nextSignature = getTargetSignature(nextTarget)
    }

    return nextTarget
}

export const singleKeyEngine = {
    createRound(level) {
        const round = []
        let previousSignature = null

        if (level.targets?.length) {
            for (let index = 0; index < level.roundSize; index += 1) {
                const target = pickNonRepeatingTarget(level.targets, previousSignature)

                round.push({
                    ...target,
                    id: `${level.id}-${index}-${Math.random().toString(16).slice(2)}`,
                })

                previousSignature = getTargetSignature(target)
            }

            return round
        }

        for (let index = 0; index < level.roundSize; index += 1) {
            const keyPool = level.keys.map((code) => ({ type: 'single', code }))
            const target = pickNonRepeatingTarget(keyPool, previousSignature)

            round.push({
                ...target,
                id: `${level.id}-${index}-${Math.random().toString(16).slice(2)}`,
            })

            previousSignature = getTargetSignature(target)
        }

        return round
    },

    getGuidance(target) {
        if (!target) {
            return ''
        }

        if (target.type === 'combo') {
            return target.helper ?? target.label ?? ''
        }

        return `Tap ${codeToLabel[target.code] ?? target.code}`
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

        if (target.type === 'combo') {
            return FINGER_COLORS[KEY_TO_FINGER[target.triggerCode]] ?? '#ffffff'
        }

        return FINGER_COLORS[KEY_TO_FINGER[target.code]] ?? '#ffffff'
    },

    shouldPreventDefault(target, normalizedCode) {
        return Boolean(
            target?.type === 'combo' &&
            target.codes.includes(normalizedCode),
        )
    },

    handleKeyDown({ target, normalizedCode, pressedKeys }) {
        if (!target) {
            return { type: 'none' }
        }

        if (target.type === 'single') {
            if (normalizedCode === target.code) {
                return { type: 'success' }
            }

            return {
                type: 'message',
                message: `Try ${codeToLabel[target.code] ?? target.code}`,
                failure: true,
            }
        }

        const allCodesDown = target.codes.every((code) => pressedKeys.has(code))
        const isTriggerPress = normalizedCode === target.triggerCode
        const isPartOfCombo = target.codes.includes(normalizedCode)

        if (allCodesDown && isTriggerPress) {
            return {
                type: 'success',
                successMessage: target.successMessage ?? target.powerName ?? null,
            }
        }

        if (isPartOfCombo) {
            return {
                type: 'message',
                message: target.helper ?? target.label ?? '',
            }
        }

        return {
            type: 'message',
            message: `Try ${target.label}`,
            failure: true,
        }
    },
}
