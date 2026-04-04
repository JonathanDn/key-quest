import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    LEVELS,
    FINGER_COLORS,
    FINGER_LABELS,
    KEY_TO_FINGER,
    codeToLabel,
} from '../game/gameData'

const HAPPY_MESSAGES = ['Nice!', 'Yay!', 'Great!', 'Awesome!', 'You got it!']

function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)]
}

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

function createRound(level) {
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
}

function getSingleHelperText(code) {
    return `Use ${FINGER_LABELS[KEY_TO_FINGER[code]]}`
}

export function useTypingGame() {
    const [levelIndex, setLevelIndex] = useState(0)
    const [round, setRound] = useState(() => createRound(LEVELS[0]))
    const [currentIndex, setCurrentIndex] = useState(0)
    const [pressedCode, setPressedCode] = useState('')
    const [pressedKeys, setPressedKeys] = useState([])
    const [stars, setStars] = useState(0)
    const [message, setMessage] = useState('Tap the glowing key')
    const [playing, setPlaying] = useState(true)
    const [complete, setComplete] = useState(false)

    const pressedKeysRef = useRef(new Set())

    const level = LEVELS[levelIndex]
    const currentTarget = round[currentIndex]
    const nextTargets = useMemo(() => round.slice(currentIndex, currentIndex + 5), [round, currentIndex])

    const helperText = currentTarget
        ? currentTarget.type === 'combo'
            ? currentTarget.helper
            : getSingleHelperText(currentTarget.code)
        : ''

    const targetColor = currentTarget
        ? currentTarget.type === 'combo'
            ? FINGER_COLORS[KEY_TO_FINGER[currentTarget.triggerCode]]
            : FINGER_COLORS[KEY_TO_FINGER[currentTarget.code]]
        : '#ffffff'

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

            if (playing && currentTarget?.type === 'combo' && currentTarget.codes.includes(normalizedCode)) {
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

            if (currentTarget.type === 'single') {
                if (normalizedCode === currentTarget.code) {
                    advanceRound(randomPick(HAPPY_MESSAGES))
                } else {
                    setMessage(`Try ${codeToLabel[currentTarget.code] ?? currentTarget.code}`)
                }

                return
            }

            const nextPressed = new Set(pressedKeysRef.current)
            const allCodesDown = currentTarget.codes.every((code) => nextPressed.has(code))
            const isTriggerPress = normalizedCode === currentTarget.triggerCode
            const isPartOfCombo = currentTarget.codes.includes(normalizedCode)

            if (allCodesDown && isTriggerPress) {
                advanceRound(currentTarget.powerName ?? randomPick(HAPPY_MESSAGES))
                return
            }

            if (isPartOfCombo) {
                setMessage(currentTarget.helper)
                return
            }

            setMessage(`Try ${currentTarget.label}`)
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
    }, [playing, complete, currentTarget, advanceRound])

    useEffect(() => {
        if (playing && currentIndex >= round.length && round.length > 0) {
            setPlaying(false)
            setComplete(true)
            setMessage('You did it!')
        }
    }, [playing, currentIndex, round.length])

    const goToLevel = useCallback((index) => {
        pressedKeysRef.current.clear()
        setPressedKeys([])
        setPressedCode('')
        setLevelIndex(index)
        setRound(createRound(LEVELS[index]))
        setCurrentIndex(0)
        setStars(0)
        setComplete(false)
        setPlaying(true)
        setMessage('Tap the glowing key')
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
        currentTarget,
        nextTargets,
        pressedCode,
        pressedKeys,
        stars,
        message,
        playing,
        complete,
        helperText,
        targetColor,
        goToLevel,
        goToNextLevel,
    }
}