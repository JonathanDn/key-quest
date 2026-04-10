import { LEVELS, INITIAL_LEVEL_INDEX } from '../content/levels'
import { getLessonEngine } from '../engine/lessonEngine'
import { buildStageView } from '../ui/viewModel'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']

const EMPTY_STAGE_STATE = {
    taskLabel: '',
    sourceText: '',
    clipboardText: '',
    targetText: '',
}

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function getLevel(levelIndex) {
    return LEVELS[levelIndex]
}

function getEngine(level) {
    return getLessonEngine(level)
}

function getCurrentTarget(state) {
    return state.round[state.currentIndex]
}

function getStageState(level, target) {
    return getEngine(level).getView?.(target) ?? EMPTY_STAGE_STATE
}

function getStartMessage(level, target) {
    return getEngine(level).getGuidance?.(target) || 'Watch the glowing key'
}

function buildLevelSession(levelIndex) {
    const level = getLevel(levelIndex)
    const engine = getEngine(level)
    const round = engine.createRound(level)
    const currentTarget = round[0]

    return {
        levelIndex,
        round,
        currentIndex: 0,
        pressedCode: '',
        pressedKeys: [],
        stars: 0,
        message: getStartMessage(level, currentTarget),
        playing: true,
        complete: false,
        stageState: getStageState(level, currentTarget),
        successFx: {
            id: 0,
            praise: '',
            color: '#ffffff',
        },
    }
}

function getSessionContext(state) {
    const level = getLevel(state.levelIndex)
    const engine = getEngine(level)
    const currentTarget = getCurrentTarget(state)
    const nextTargets = state.round.slice(state.currentIndex, state.currentIndex + 5)

    return {
        level,
        engine,
        currentTarget,
        nextTargets,
    }
}

function handleKeyDown(state, normalizedCode, praise) {
    const { level, engine, currentTarget } = getSessionContext(state)
    const pressedKeys = new Set(state.pressedKeys)

    pressedKeys.add(normalizedCode)

    const nextState = {
        ...state,
        pressedCode: normalizedCode,
        pressedKeys: Array.from(pressedKeys),
    }

    if (!state.playing || state.complete || !currentTarget) {
        return nextState
    }

    const result = engine.handleKeyDown?.({
        level,
        target: currentTarget,
        normalizedCode,
        pressedKeys: new Set(pressedKeys),
        currentView: state.stageState,
    }) ?? { type: 'none' }

    if (result.type === 'success') {
        const nextIndex = state.currentIndex + 1
        const nextTarget = state.round[nextIndex]
        const isComplete = nextIndex >= state.round.length && state.round.length > 0
        const targetColor = engine.getTargetColor?.(currentTarget) ?? '#ffffff'

        return {
            ...nextState,
            currentIndex: nextIndex,
            stars: state.stars + 1,
            message: isComplete
                ? 'You did it!'
                : (engine.getGuidance?.(nextTarget) ?? ''),
            playing: !isComplete,
            complete: isComplete,
            stageState: isComplete
                ? (result.nextView ?? state.stageState)
                : (result.nextView ?? getStageState(level, nextTarget)),
            successFx: {
                id: state.successFx.id + 1,
                praise: praise ?? randomPick(HAPPY_MESSAGES),
                color: targetColor,
            },
        }
    }

    if (result.type === 'message' && result.message) {
        return {
            ...nextState,
            message: result.message,
            stageState: result.nextView ?? state.stageState,
        }
    }

    if (result.nextView) {
        return {
            ...nextState,
            stageState: result.nextView,
        }
    }

    return nextState
}

function handleKeyUp(state, normalizedCode) {
    const pressedKeys = new Set(state.pressedKeys)
    pressedKeys.delete(normalizedCode)

    return {
        ...state,
        pressedCode: '',
        pressedKeys: Array.from(pressedKeys),
    }
}

export function normalizeKeyCode(code) {
    return code === 'Space' ? 'Space' : code
}

export function createInitialGameSession() {
    return buildLevelSession(INITIAL_LEVEL_INDEX)
}

export function gameSessionReducer(state, action) {
    switch (action.type) {
        case 'KEY_DOWN':
            return handleKeyDown(state, action.normalizedCode, action.praise)

        case 'KEY_UP':
            return handleKeyUp(state, action.normalizedCode)

        case 'GO_TO_LEVEL':
            return buildLevelSession(action.levelIndex)

        default:
            return state
    }
}

export function shouldPreventDefaultForSession(state, normalizedCode) {
    const { engine, currentTarget } = getSessionContext(state)

    if (!state.playing) {
        return false
    }

    if (normalizedCode === 'Space') {
        return true
    }

    return Boolean(engine.shouldPreventDefault?.(currentTarget, normalizedCode))
}

export function selectGameSession(state) {
    const { level, currentTarget, nextTargets, engine } = getSessionContext(state)
    const targetColor = engine.getTargetColor?.(currentTarget) ?? '#ffffff'

    return {
        levels: LEVELS,
        level,
        levelIndex: state.levelIndex,
        pressedCode: state.pressedCode,
        pressedKeys: state.pressedKeys,
        stars: state.stars,
        message: state.message,
        playing: state.playing,
        complete: state.complete,
        targetColor,
        ui: buildStageView({
            level,
            currentTarget,
            nextTargets,
            pressedKeys: state.pressedKeys,
            stageState: state.stageState,
            complete: state.complete,
        }),
        successFx: state.successFx,
    }
}