import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { LEVELS } from '../game/content/levels'
import {
    createInitialGameSession,
    gameSessionReducer,
    normalizeKeyCode,
    selectGameSession,
    shouldPreventDefaultForSession,
} from '../game/session/gameSession'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

export function useTypingGame() {
    const [session, dispatch] = useReducer(
        gameSessionReducer,
        undefined,
        createInitialGameSession,
    )

    const sessionRef = useRef(session)

    useEffect(() => {
        sessionRef.current = session
    }, [session])

    const game = useMemo(() => selectGameSession(session), [session])

    useEffect(() => {
        function onKeyDown(event) {
            const normalizedCode = normalizeKeyCode(event.code)
            const currentSession = sessionRef.current

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
        }
    }, [session.levelIndex])

    return {
        ...game,
        goToLevel,
        goToNextLevel,
    }
}