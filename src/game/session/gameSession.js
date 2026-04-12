import { LEVELS, INITIAL_LEVEL_INDEX } from '../content/levels'
import { getLessonEngine } from '../engine/lessonEngine'
import { buildStageView } from '../ui/viewModel'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']
const LEGACY_BEST_TIMES_STORAGE_KEY = 'key-quest-best-times-v1'
const BEST_TIMES_BY_PLAYER_STORAGE_KEY = 'key-quest-best-times-by-player-v1'
const LAST_PLAYER_NAME_STORAGE_KEY = 'key-quest-last-player-v1'

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

export function normalizePlayerName(playerName) {
    if (typeof playerName !== 'string') {
        return ''
    }

    return playerName.replace(/\s+/g, ' ').trim().slice(0, 24)
}

function sanitizeBestTimesRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {}
    }

    return Object.fromEntries(
        Object.entries(value).filter(([, entryValue]) => (
            typeof entryValue === 'number' &&
            Number.isFinite(entryValue) &&
            entryValue >= 0
        )),
    )
}

function readStorageObject(storageKey) {
    if (typeof window === 'undefined') {
        return {}
    }

    try {
        const raw = window.localStorage.getItem(storageKey)

        if (!raw) {
            return {}
        }

        const parsed = JSON.parse(raw)

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {}
        }

        return parsed
    } catch {
        return {}
    }
}

function loadAllBestTimesByPlayer() {
    const rawPlayers = readStorageObject(BEST_TIMES_BY_PLAYER_STORAGE_KEY)

    return Object.fromEntries(
        Object.entries(rawPlayers)
            .map(([playerName, bestTimes]) => [
                normalizePlayerName(playerName),
                sanitizeBestTimesRecord(bestTimes),
            ])
            .filter(([playerName]) => Boolean(playerName)),
    )
}

function saveAllBestTimesByPlayer(bestTimesByPlayer) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(
            BEST_TIMES_BY_PLAYER_STORAGE_KEY,
            JSON.stringify(bestTimesByPlayer),
        )
    } catch {
        // Ignore storage failures so gameplay never breaks.
    }
}

function maybeMigrateLegacyBestTimes(playerName, bestTimesByPlayer) {
    if (!playerName || Object.keys(bestTimesByPlayer).length > 0 || typeof window === 'undefined') {
        return bestTimesByPlayer
    }

    const legacyBestTimes = sanitizeBestTimesRecord(readStorageObject(LEGACY_BEST_TIMES_STORAGE_KEY))

    if (!Object.keys(legacyBestTimes).length) {
        return bestTimesByPlayer
    }

    const migratedBestTimesByPlayer = {
        ...bestTimesByPlayer,
        [playerName]: legacyBestTimes,
    }

    saveAllBestTimesByPlayer(migratedBestTimesByPlayer)

    try {
        window.localStorage.removeItem(LEGACY_BEST_TIMES_STORAGE_KEY)
    } catch {
        // Ignore storage failures so gameplay never breaks.
    }

    return migratedBestTimesByPlayer
}

export function loadLastPlayerNameFromStorage() {
    if (typeof window === 'undefined') {
        return ''
    }

    try {
        return normalizePlayerName(
            window.localStorage.getItem(LAST_PLAYER_NAME_STORAGE_KEY) ?? '',
        )
    } catch {
        return ''
    }
}

export function saveLastPlayerNameToStorage(playerName) {
    if (typeof window === 'undefined') {
        return
    }

    const normalizedPlayerName = normalizePlayerName(playerName)

    if (!normalizedPlayerName) {
        return
    }

    try {
        window.localStorage.setItem(LAST_PLAYER_NAME_STORAGE_KEY, normalizedPlayerName)
    } catch {
        // Ignore storage failures so gameplay never breaks.
    }
}

function loadBestTimesFromStorage(playerName) {
    const normalizedPlayerName = normalizePlayerName(playerName)

    if (!normalizedPlayerName) {
        return {}
    }

    const bestTimesByPlayer = maybeMigrateLegacyBestTimes(
        normalizedPlayerName,
        loadAllBestTimesByPlayer(),
    )

    return sanitizeBestTimesRecord(bestTimesByPlayer[normalizedPlayerName])
}

export function saveBestTimesToStorage(playerName, bestTimesByLevelId) {
    const normalizedPlayerName = normalizePlayerName(playerName)

    if (!normalizedPlayerName) {
        return
    }

    const bestTimesByPlayer = loadAllBestTimesByPlayer()

    saveAllBestTimesByPlayer({
        ...bestTimesByPlayer,
        [normalizedPlayerName]: sanitizeBestTimesRecord(bestTimesByLevelId),
    })
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

function buildLevelSession(levelIndex, bestTimesByLevelId = {}, attemptsByLevelId = {}, playerName = '') {
    const level = getLevel(levelIndex)
    const engine = getEngine(level)
    const round = engine.createRound(level)
    const currentTarget = round[0]

    return {
        playerName,
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

export function createInitialGameSession(playerName = '') {
    const normalizedPlayerName = normalizePlayerName(playerName)

    return buildLevelSession(
        INITIAL_LEVEL_INDEX,
        loadBestTimesFromStorage(normalizedPlayerName),
        {},
        normalizedPlayerName,
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
                state?.playerName,
            )

        case 'LOAD_PLAYER_PROFILE':
            return createInitialGameSession(action.playerName)

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
        playerName: state.playerName,
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
        bestTimesByLevelId: state.bestTimesByLevelId,
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