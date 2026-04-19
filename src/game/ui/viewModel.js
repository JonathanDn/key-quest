import {
    FINGER_COLORS,
    KEY_TO_FINGER,
    codeToLabel,
} from '../content/keyData'

const WIDE_DISPLAY_CODES = new Set(['Space', 'ControlLeft'])

function renderVisibleChar(char) {
    if (char === ' ') {
        return '␣'
    }

    return char
}

function getTargetLabel(target) {
    if (!target) {
        return ''
    }

    if (target.type === 'combo') {
        return target.label
    }

    return codeToLabel[target.code] ?? target.code
}

function getQueueLabel(target) {
    if (!target) {
        return ''
    }

    if (target.type === 'combo') {
        return target.shortLabel ?? target.label
    }

    return codeToLabel[target.code] ?? target.code
}

function buildTargetView(currentTarget, pressedKeys, complete) {
    if (!currentTarget) {
        return {
            mode: complete ? 'complete' : 'idle',
            label: complete ? '' : '▶',
            isWide: false,
            comboChips: [],
            stepDoneText: '',
            stepCurrentChar: '',
            stepUpcomingText: '',
        }
    }

    if (currentTarget.type === 'combo') {
        return {
            mode: 'combo',
            label: currentTarget.label,
            isWide: true,
            comboChips: currentTarget.codes.map((code) => ({
                code,
                label: codeToLabel[code] ?? code,
                held: pressedKeys.has(code),
            })),
            stepDoneText: '',
            stepCurrentChar: '',
            stepUpcomingText: '',
        }
    }

    if (currentTarget.stepText) {
        const currentStepText = currentTarget.stepText
        const currentStepCharIndex = currentTarget.stepCharIndex ?? 0

        return {
            mode: 'textStep',
            label: '',
            isWide: true,
            comboChips: [],
            stepDoneText: currentStepText.slice(0, currentStepCharIndex),
            stepCurrentChar: renderVisibleChar(currentStepText.charAt(currentStepCharIndex)),
            stepUpcomingText: currentStepText.slice(currentStepCharIndex + 1),
        }
    }

    return {
        mode: 'single',
        label: getTargetLabel(currentTarget),
        isWide: WIDE_DISPLAY_CODES.has(currentTarget.code),
        comboChips: [],
        stepDoneText: '',
        stepCurrentChar: '',
        stepUpcomingText: '',
    }
}

function buildQueueView(nextTargets) {
    return nextTargets.map((item, index) => ({
        id: item.id,
        label: getQueueLabel(item),
        isWide: item.type === 'combo' || WIDE_DISPLAY_CODES.has(item.code),
        isCombo: item.type === 'combo',
        isActive: index === 0,
        color:
            item.type === 'combo'
                ? FINGER_COLORS[KEY_TO_FINGER[item.triggerCode]]
                : FINGER_COLORS[KEY_TO_FINGER[item.code]],
    }))
}

function buildWordPowerView(level, currentTarget, stageState) {
    const showWordPowerBoard = level.playMode === 'wordPowers'
    const wordPowerAction = currentTarget?.powerName ?? ''

    return {
        show: showWordPowerBoard,
        powerName: wordPowerAction,
        taskLabel: stageState?.taskLabel ?? '',
        actionLabel: getTargetLabel(currentTarget),
        sourceText: stageState?.sourceText ?? '',
        clipboardText: stageState?.clipboardText ?? '',
        targetText: stageState?.targetText ?? '',
        highlightSource: showWordPowerBoard && wordPowerAction === 'Copy Power',
        highlightClipboard:
            showWordPowerBoard &&
            (wordPowerAction === 'Copy Power' || wordPowerAction === 'Paste Power'),
        highlightTarget:
            showWordPowerBoard &&
            (wordPowerAction === 'Paste Power' || wordPowerAction === 'Undo Power'),
    }
}

export function buildStageView({
                                   level,
                                   currentTarget,
                                   nextTargets,
                                   pressedKeys,
                                   stageState,
                                   complete,
                               }) {
    const heldKeys = new Set(pressedKeys)
    const comboCodes = currentTarget?.type === 'combo' ? currentTarget.codes : []
    const targetCodes =
        currentTarget?.type === 'combo'
            ? []
            : currentTarget?.code
                ? [currentTarget.code]
                : []

    return {
        showWordPowerBoard: level.playMode === 'wordPowers',
        target: buildTargetView(currentTarget, heldKeys, complete),
        queue: buildQueueView(nextTargets),
        keyboard: {
            heldKeys,
            comboCodes,
            targetCodes,
        },
        wordPower: buildWordPowerView(level, currentTarget, stageState),
    }
}
