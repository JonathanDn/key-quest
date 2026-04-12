import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { LEVELS } from '../game/content/levels'
import {
    createInitialGameSession,
    gameSessionReducer,
    normalizeKeyCode,
    normalizePlayerName,
    saveBestTimesToStorage,
    selectGameSession,
    shouldPreventDefaultForSession,
} from '../game/session/gameSession'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

export function useTypingGame(playerName, inputPaused = false) {
    const normalizedPlayerName = useMemo(
        () => normalizePlayerName(playerName),
        [playerName],
    )

    const [session, dispatch] = useReducer(
        gameSessionReducer,
        normalizedPlayerName,
        createInitialGameSession,
    )

    const sessionRef = useRef(session)
    const inputPausedRef = useRef(inputPaused)

    useEffect(() => {
        sessionRef.current = session
    }, [session])

    useEffect(() => {
        inputPausedRef.current = inputPaused
    }, [inputPaused])

    useEffect(() => {
        if (session.playerName === normalizedPlayerName) {
            return
        }

        dispatch({
            type: 'LOAD_PLAYER_PROFILE',
            playerName: normalizedPlayerName,
        })
    }, [normalizedPlayerName, session.playerName])

    const game = useMemo(() => selectGameSession(session), [session])

    useEffect(() => {
        if (!session.playerName) {
            return
        }

        saveBestTimesToStorage(session.playerName, session.bestTimesByLevelId)
    }, [session.playerName, session.bestTimesByLevelId])

    useEffect(() => {
        function onKeyDown(event) {
            const currentSession = sessionRef.current

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
        dispatch({
            type: 'GO_TO_LEVEL',
            levelIndex: index,
        })
    }, [])

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
        goToLevel,
        goToNextLevel,
    }
}