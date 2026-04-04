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

function pickNonRepeatingPrompt(pool, previousPrompt) {
    if (!pool.length) {
        return ''
    }

    if (pool.length === 1) {
        return pool[0]
    }

    let nextPrompt = pool[Math.floor(Math.random() * pool.length)]

    while (nextPrompt === previousPrompt) {
        nextPrompt = pool[Math.floor(Math.random() * pool.length)]
    }

    return nextPrompt
}

function charToCode(char) {
    if (char === ' ') {
        return 'Space'
    }

    if (/^[a-z]$/i.test(char)) {
        return `Key${char.toUpperCase()}`
    }

    if (char === ',') {
        return 'Comma'
    }

    if (char === '.') {
        return 'Period'
    }

    if (char === ';') {
        return 'Semicolon'
    }

    if (char === '/') {
        return 'Slash'
    }

    throw new Error(`Unsupported prompt character: ${char}`)
}

function createPromptTargets(level) {
    const promptCount = level.promptCount ?? 3
    const targets = []
    let previousPrompt = null

    for (let promptIndex = 0; promptIndex < promptCount; promptIndex += 1) {
        const promptText = pickNonRepeatingPrompt(level.promptPool, previousPrompt)
        previousPrompt = promptText

        Array.from(promptText).forEach((char, charIndex) => {
            targets.push({
                type: 'single',
                code: charToCode(char),
                id: `${level.id}-prompt-${promptIndex}-char-${charIndex}-${Math.random().toString(16).slice(2)}`,
                stepText: promptText,
                stepCharIndex: charIndex,
                stepId: `${level.id}-prompt-${promptIndex}`,
            })
        })
    }

    return targets
}

function createMissionTargets(level) {
    return level.missions.map((mission, index) => ({
        ...mission,
        id: `${level.id}-mission-${index}-${Math.random().toString(16).slice(2)}`,
    }))
}

function createRound(level) {
    if (level.playMode === 'wordPowers' && level.missions?.length) {
        return createMissionTargets(level)
    }

    if (level.promptPool?.length) {
        return createPromptTargets(level)
    }

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

function getLevelStartMessage(level, firstTarget) {
    if (level.playMode === 'wordPowers') {
        return firstTarget?.taskLabel ?? 'Use the word powers'
    }

    if (level.promptPool?.length) {
        return 'Type the word'
    }

    if (level.targets?.length) {
        return 'Use the power keys'
    }

    return 'Tap the glowing key'
}

function getWordPowerView(target) {
    return {
        taskLabel: target?.taskLabel ?? '',
        sourceText: target?.sourceText ?? '',
        clipboardText: target?.clipboardText ?? '',
        targetText: target?.targetText ?? '',
    }
}

export function useTypingGame() {
    const initialRound = createRound(LEVELS[20])

    const [levelIndex, setLevelIndex] = useState(20)
    const [round, setRound] = useState(initialRound)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [pressedCode, setPressedCode] = useState('')
    const [pressedKeys, setPressedKeys] = useState([])
    const [stars, setStars] = useState(0)
    const [message, setMessage] = useState(getLevelStartMessage(LEVELS[0], initialRound[0]))
    const [playing, setPlaying] = useState(true)
    const [complete, setComplete] = useState(false)
    const [wordPowerState, setWordPowerState] = useState(getWordPowerView(initialRound[0]))

    const pressedKeysRef = useRef(new Set())

    const level = LEVELS[levelIndex]
    const currentTarget = round[currentIndex]
    const nextTargets = useMemo(() => round.slice(currentIndex, currentIndex + 5), [round, currentIndex])

    useEffect(() => {
        if (level.playMode === 'wordPowers' && currentTarget) {
            setWordPowerState(getWordPowerView(currentTarget))
        }
    }, [level.playMode, currentTarget])

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
                if (level.playMode === 'wordPowers' && currentTarget.afterState) {
                    setWordPowerState((previous) => ({
                        ...previous,
                        ...currentTarget.afterState,
                    }))
                }

                advanceRound(currentTarget.successMessage ?? currentTarget.powerName ?? randomPick(HAPPY_MESSAGES))
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
    }, [playing, complete, currentTarget, level.playMode, advanceRound])

    useEffect(() => {
        if (playing && currentIndex >= round.length && round.length > 0) {
            setPlaying(false)
            setComplete(true)
            setMessage('You did it!')
        }
    }, [playing, currentIndex, round.length])

    const goToLevel = useCallback((index) => {
        const nextLevel = LEVELS[index]
        const nextRound = createRound(nextLevel)

        pressedKeysRef.current.clear()
        setPressedKeys([])
        setPressedCode('')
        setLevelIndex(index)
        setRound(nextRound)
        setCurrentIndex(0)
        setStars(0)
        setComplete(false)
        setPlaying(true)
        setWordPowerState(getWordPowerView(nextRound[0]))
        setMessage(getLevelStartMessage(nextLevel, nextRound[0]))
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
        wordPowerState,
        goToLevel,
        goToNextLevel,
    }
}