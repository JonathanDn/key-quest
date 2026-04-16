import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { LEVELS } from '../game/content/levels'
import {
    createInitialGameSession,
    gameSessionReducer,
    getHighestUnlockedLevelIndex,
    normalizeKeyCode,
    normalizePlayerName,
    selectGameSession,
    shouldPreventDefaultForSession,
} from '../game/session/gameSession'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']

export function isEditableEventTarget(target) {
    if (!target || typeof target !== 'object') {
        return false
    }

    if (target.isContentEditable) {
        return true
    }

    const tagName = typeof target.tagName === 'string'
        ? target.tagName.toLowerCase()
        : ''

    return tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function serializeBestTimes(bestTimesByLevelId) {
    if (!bestTimesByLevelId || typeof bestTimesByLevelId !== 'object' || Array.isArray(bestTimesByLevelId)) {
        return '{}'
    }

    return JSON.stringify(
        Object.fromEntries(
            Object.entries(bestTimesByLevelId).sort(([leftKey], [rightKey]) => (
                leftKey.localeCompare(rightKey)
            )),
        ),
    )
}

export function useTypingGame(
    playerName,
    inputPaused = false,
    initialBestTimesByLevelId = {},
) {
    const normalizedPlayerName = useMemo(
        () => normalizePlayerName(playerName),
        [playerName],
    )

    const initialBestTimesSignature = useMemo(
        () => serializeBestTimes(initialBestTimesByLevelId),
        [initialBestTimesByLevelId],
    )

    const [session, dispatch] = useReducer(
        gameSessionReducer,
        {
            playerName: normalizedPlayerName,
            initialBestTimesByLevelId,
        },
        ({ playerName: initialPlayerName, initialBestTimesByLevelId: initialBestTimes }) =>
            createInitialGameSession(initialPlayerName, initialBestTimes),
    )

    const sessionRef = useRef(session)
    const inputPausedRef = useRef(inputPaused)
    const lastLoadedProfileRef = useRef({
        playerName: normalizedPlayerName,
        bestTimesSignature: initialBestTimesSignature,
    })

    useEffect(() => {
        sessionRef.current = session
    }, [session])

    useEffect(() => {
        inputPausedRef.current = inputPaused
    }, [inputPaused])

    useEffect(() => {
        const lastLoadedProfile = lastLoadedProfileRef.current
        const playerChanged = lastLoadedProfile.playerName !== normalizedPlayerName
        const bestTimesChanged = lastLoadedProfile.bestTimesSignature !== initialBestTimesSignature

        if (!playerChanged && !bestTimesChanged) {
            return
        }

        lastLoadedProfileRef.current = {
            playerName: normalizedPlayerName,
            bestTimesSignature: initialBestTimesSignature,
        }

        dispatch({
            type: 'LOAD_PLAYER_PROFILE',
            playerName: normalizedPlayerName,
            initialBestTimesByLevelId,
        })
    }, [
        normalizedPlayerName,
        initialBestTimesByLevelId,
        initialBestTimesSignature,
    ])

    const game = useMemo(() => selectGameSession(session), [session])
    const highestUnlockedLevelIndex = useMemo(
        () => getHighestUnlockedLevelIndex(game.bestTimesByLevelId),
        [game.bestTimesByLevelId],
    )

    useEffect(() => {
        function onKeyDown(event) {
            const currentSession = sessionRef.current

            if (isEditableEventTarget(event.target)) {
                return
            }

            if (!currentSession.playerName || inputPausedRef.current) {
                return
            }

            const normalizedCode = normalizeKeyCode(event.code)

            if (normalizedCode === 'Enter' && currentSession.complete && !event.repeat) {
                event.preventDefault()

                if (currentSession.levelIndex < LEVELS.length - 1) {
                    dispatch({
                        type: 'GO_TO_LEVEL',
                        levelIndex: currentSession.levelIndex + 1,
                    })
                } else {
                    dispatch({
                        type: 'GO_TO_LEVEL',
                        levelIndex: 0,
                    })
                }

                return
            }

            if (shouldPreventDefaultForSession(currentSession, normalizedCode)) {
                event.preventDefault()
            }

            dispatch({
                type: 'KEY_DOWN',
                normalizedCode,
                praise: randomPick(HAPPY_MESSAGES),
            })
        }

        function onKeyUp(event) {
            const currentSession = sessionRef.current

            if (isEditableEventTarget(event.target)) {
                return
            }

            if (!currentSession.playerName || inputPausedRef.current) {
                return
            }

            dispatch({
                type: 'KEY_UP',
                normalizedCode: normalizeKeyCode(event.code),
            })
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        if (session.timerStartedAt === null || !session.playing || session.complete) {
            return undefined
        }

        const intervalId = window.setInterval(() => {
            dispatch({
                type: 'TICK',
                now: Date.now(),
            })
        }, 100)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [session.timerStartedAt, session.playing, session.complete])

    const goToLevel = useCallback((index) => {
        if (!Number.isInteger(index)) {
            return
        }

        if (index < 0 || index > highestUnlockedLevelIndex) {
            return
        }

        dispatch({
            type: 'GO_TO_LEVEL',
            levelIndex: index,
        })
    }, [highestUnlockedLevelIndex])

    const goToNextLevel = useCallback(() => {
        if (session.levelIndex < LEVELS.length - 1) {
            dispatch({
                type: 'GO_TO_LEVEL',
                levelIndex: session.levelIndex + 1,
            })
        } else {
            dispatch({
                type: 'GO_TO_LEVEL',
                levelIndex: 0,
            })
        }
    }, [session.levelIndex])

    return {
        ...game,
        highestUnlockedLevelIndex,
        goToLevel,
        goToNextLevel,
    }
}
