import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS, INITIAL_LEVEL_INDEX } from '../game/content/levels'
import { getLessonEngine } from '../game/engine/lessonEngine'
import { buildStageView } from '../game/ui/viewModel'

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

function getStageState(level, target) {
    return getLessonEngine(level).getView?.(target) ?? EMPTY_STAGE_STATE
}

function getStartMessage(level, target) {
    return getLessonEngine(level).getGuidance?.(target) || 'Watch the glowing key'
}

export function useTypingGame() {
    const initialLevel = LEVELS[INITIAL_LEVEL_INDEX]
    const initialEngine = getLessonEngine(initialLevel)
    const initialRound = initialEngine.createRound(initialLevel)

    const [levelIndex, setLevelIndex] = useState(INITIAL_LEVEL_INDEX)
    const [round, setRound] = useState(initialRound)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [pressedCode, setPressedCode] = useState('')
    const [pressedKeys, setPressedKeys] = useState([])
    const [stars, setStars] = useState(0)
    const [message, setMessage] = useState(getStartMessage(initialLevel, initialRound[0]))
    const [playing, setPlaying] = useState(true)
    const [complete, setComplete] = useState(false)
    const [stageState, setStageState] = useState(getStageState(initialLevel, initialRound[0]))

    const pressedKeysRef = useRef(new Set())

    const level = LEVELS[levelIndex]
    const engine = getLessonEngine(level)
    const currentTarget = round[currentIndex]
    const nextTargets = useMemo(() => round.slice(currentIndex, currentIndex + 5), [round, currentIndex])

    useEffect(() => {
        setStageState(getStageState(level, currentTarget))
    }, [level, currentTarget])

    useEffect(() => {
        if (!playing || complete || !currentTarget) {
            return
        }

        setMessage(engine.getGuidance?.(currentTarget) ?? '')
    }, [engine, currentTarget, playing, complete])

    const targetColor = engine.getTargetColor?.(currentTarget) ?? '#ffffff'

    const ui = useMemo(() => {
        return buildStageView({
            level,
            currentTarget,
            nextTargets,
            pressedKeys,
            stageState,
            complete,
        })
    }, [level, currentTarget, nextTargets, pressedKeys, stageState, complete])

    const advanceRound = useCallback((successMessage) => {
        setStars((value) => value + 1)
        setCurrentIndex((value) => value + 1)
        setMessage(successMessage)
    }, [])

    useEffect(() => {
        function syncPressedKeys(nextSet) {
            setPressedKeys(Array.from(nextSet))
        }

        function onKeyDown(event) {
            const normalizedCode = event.code === 'Space' ? 'Space' : event.code

            if (playing && normalizedCode === 'Space') {
                event.preventDefault()
            }

            if (playing && engine.shouldPreventDefault?.(currentTarget, normalizedCode)) {
                event.preventDefault()
            }

            setPressedCode(normalizedCode)

            if (!pressedKeysRef.current.has(normalizedCode)) {
                pressedKeysRef.current.add(normalizedCode)
                syncPressedKeys(pressedKeysRef.current)
            }

            if (!playing || complete || !currentTarget) {
                return
            }

            const result = engine.handleKeyDown?.({
                level,
                target: currentTarget,
                normalizedCode,
                pressedKeys: new Set(pressedKeysRef.current),
                currentView: stageState,
            }) ?? { type: 'none' }

            if (result.nextView) {
                setStageState(result.nextView)
            }

            if (result.type === 'success') {
                advanceRound(result.successMessage ?? randomPick(HAPPY_MESSAGES))
                return
            }

            if (result.type === 'message' && result.message) {
                setMessage(result.message)
            }
        }

        function onKeyUp(event) {
            const normalizedCode = event.code === 'Space' ? 'Space' : event.code

            setPressedCode('')

            if (pressedKeysRef.current.has(normalizedCode)) {
                pressedKeysRef.current.delete(normalizedCode)
                syncPressedKeys(pressedKeysRef.current)
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [playing, complete, currentTarget, engine, level, stageState, advanceRound])

    useEffect(() => {
        if (playing && currentIndex >= round.length && round.length > 0) {
            setPlaying(false)
            setComplete(true)
            setMessage('You did it!')
        }
    }, [playing, currentIndex, round.length])

    const goToLevel = useCallback((index) => {
        const nextLevel = LEVELS[index]
        const nextEngine = getLessonEngine(nextLevel)
        const nextRound = nextEngine.createRound(nextLevel)

        pressedKeysRef.current.clear()
        setPressedKeys([])
        setPressedCode('')
        setLevelIndex(index)
        setRound(nextRound)
        setCurrentIndex(0)
        setStars(0)
        setComplete(false)
        setPlaying(true)
        setStageState(getStageState(nextLevel, nextRound[0]))
        setMessage(getStartMessage(nextLevel, nextRound[0]))
    }, [])

    const goToNextLevel = useCallback(() => {
        if (levelIndex < LEVELS.length - 1) {
            goToLevel(levelIndex + 1)
        }
    }, [levelIndex, goToLevel])

    return {
        levels: LEVELS,
        level,
        levelIndex,
        pressedCode,
        pressedKeys,
        stars,
        message,
        playing,
        complete,
        targetColor,
        ui,
        goToLevel,
        goToNextLevel,
    }
}