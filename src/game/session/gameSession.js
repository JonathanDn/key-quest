import { LEVELS, INITIAL_LEVEL_INDEX } from '../content/levels'
import { getLessonEngine } from '../engine/lessonEngine'
import { buildStageView } from '../ui/viewModel'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']
const BEST_TIMES_STORAGE_KEY = 'key-quest-best-times-v1'

const EMPTY_STAGE_STATE = {
    taskLabel: '',
    sourceText: '',
    clipboardText: '',
    targetText: '',
}

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function formatElapsedTime(elapsedTimeMs) {
    return `${(Math.max(elapsedTimeMs, 0) / 1000).toFixed(1)}s`
}

function loadBestTimesFromStorage() {
    if (typeof window === 'undefined') {
        return {}
    }

    try {
        const raw = window.localStorage.getItem(BEST_TIMES_STORAGE_KEY)

        if (!raw) {
            return {}
        }

        const parsed = JSON.parse(raw)

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {}
        }

        return Object.fromEntries(
            Object.entries(parsed).filter(([, value]) => (
                typeof value === 'number' &&
                Number.isFinite(value) &&
                value >= 0
            )),
        )
    } catch {
        return {}
    }
}

export function saveBestTimesToStorage(bestTimesByLevelId) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(
            BEST_TIMES_STORAGE_KEY,
            JSON.stringify(bestTimesByLevelId),
        )
    } catch {
        // Ignore storage failures so gameplay never breaks.
    }
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

function getElapsedTimeMs(state, now = Date.now()) {
    if (state.timerStartedAt === null) {
        return state.elapsedTimeMs
    }

    if (!state.playing || state.complete) {
        return state.elapsedTimeMs
    }

    return Math.max(state.elapsedTimeMs, now - state.timerStartedAt)
}

function buildLevelSession(levelIndex, bestTimesByLevelId = {}, attemptsByLevelId = {}) {
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
        timerStartedAt: null,
        elapsedTimeMs: 0,
        bestTimesByLevelId,
        attemptsByLevelId,
        isNewBestTime: false,
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
        const now = Date.now()
        const timerStartedAt = state.timerStartedAt ?? now
        const nextIndex = state.currentIndex + 1
        const nextTarget = state.round[nextIndex]
        const isComplete = nextIndex >= state.round.length && state.round.length > 0
        const targetColor = engine.getTargetColor?.(currentTarget) ?? '#ffffff'
        const elapsedTimeMs = isComplete
            ? Math.max(state.elapsedTimeMs, now - timerStartedAt)
            : state.elapsedTimeMs

        const previousBestTimeMs = state.bestTimesByLevelId[level.id]
        const sessionAttemptTimes = isComplete
            ? [...(state.attemptsByLevelId[level.id] ?? []), elapsedTimeMs]
            : (state.attemptsByLevelId[level.id] ?? [])
        const isNewBestTime = Boolean(
            isComplete && (
                typeof previousBestTimeMs !== 'number' ||
                elapsedTimeMs < previousBestTimeMs
            ),
        )
        const nextBestTimeMs = isNewBestTime
            ? elapsedTimeMs
            : previousBestTimeMs

        return {
            ...nextState,
            currentIndex: nextIndex,
            stars: state.stars + 1,
            message: isComplete
                ? (isNewBestTime
                    ? `New best! ${formatElapsedTime(elapsedTimeMs)}`
                    : `You did it in ${formatElapsedTime(elapsedTimeMs)}!`)
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
            timerStartedAt,
            elapsedTimeMs,
            bestTimesByLevelId: isComplete
                ? {
                    ...state.bestTimesByLevelId,
                    [level.id]: nextBestTimeMs,
                }
                : state.bestTimesByLevelId,
            attemptsByLevelId: isComplete
                ? {
                    ...state.attemptsByLevelId,
                    [level.id]: sessionAttemptTimes,
                }
                : state.attemptsByLevelId,
            isNewBestTime,
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

function handleTick(state, now) {
    if (state.timerStartedAt === null || !state.playing || state.complete) {
        return state
    }

    const elapsedTimeMs = getElapsedTimeMs(state, now)

    if (elapsedTimeMs === state.elapsedTimeMs) {
        return state
    }

    return {
        ...state,
        elapsedTimeMs,
    }
}

export function normalizeKeyCode(code) {
    return code === 'Space' ? 'Space' : code
}

export function createInitialGameSession() {
    return buildLevelSession(
        INITIAL_LEVEL_INDEX,
        loadBestTimesFromStorage(),
        {},
    )
}

export function gameSessionReducer(state, action) {
    switch (action.type) {
        case 'KEY_DOWN':
            return handleKeyDown(state, action.normalizedCode, action.praise)

        case 'KEY_UP':
            return handleKeyUp(state, action.normalizedCode)

        case 'TICK':
            return handleTick(state, action.now)

        case 'GO_TO_LEVEL':
            return buildLevelSession(
                action.levelIndex,
                state?.bestTimesByLevelId,
                state?.attemptsByLevelId,
            )

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
        elapsedTimeMs: getElapsedTimeMs(state),
        bestTimeMs: state.bestTimesByLevelId[level.id] ?? null,
        sessionAttemptTimes: state.attemptsByLevelId[level.id] ?? [],
        isNewBestTime: state.isNewBestTime,
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