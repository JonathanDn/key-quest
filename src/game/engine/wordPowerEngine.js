import {
    FINGER_COLORS,
    KEY_TO_FINGER,
} from '../content/keyData'

export const wordPowerEngine = {
    createRound(level) {
        return (level.missions ?? []).map((mission, index) => ({
            ...mission,
            id: `${level.id}-mission-${index}-${Math.random().toString(16).slice(2)}`,
        }))
    },

    getGuidance(target) {
        if (!target) {
            return ''
        }

        return target.taskLabel ?? target.helper ?? target.label ?? ''
    },

    getView(target) {
        return {
            taskLabel: target?.taskLabel ?? '',
            sourceText: target?.sourceText ?? '',
            clipboardText: target?.clipboardText ?? '',
            targetText: target?.targetText ?? '',
        }
    },

    getTargetColor(target) {
        if (!target) {
            return '#ffffff'
        }

        return FINGER_COLORS[KEY_TO_FINGER[target.triggerCode]] ?? '#ffffff'
    },

    shouldPreventDefault(target, normalizedCode) {
        return Boolean(target?.codes?.includes(normalizedCode))
    },

    handleKeyDown({ target, normalizedCode, pressedKeys, currentView }) {
        if (!target) {
            return { type: 'none' }
        }

        const allCodesDown = target.codes.every((code) => pressedKeys.has(code))
        const isTriggerPress = normalizedCode === target.triggerCode
        const isPartOfCombo = target.codes.includes(normalizedCode)

        if (allCodesDown && isTriggerPress) {
            return {
                type: 'success',
                successMessage: target.successMessage ?? target.powerName ?? null,
                nextView: target.afterState
                    ? { ...currentView, ...target.afterState }
                    : currentView,
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
        }
    },
}