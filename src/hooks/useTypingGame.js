import { useCallback, useEffect, useMemo, useState } from 'react'
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

function createRound(level) {
    return Array.from({ length: level.roundSize }, (_, index) => {
        const code = level.keys[Math.floor(Math.random() * level.keys.length)]
        return {
            code,
            id: `${level.id}-${index}-${Math.random().toString(16).slice(2)}`,
        }
    })
}

export function useTypingGame() {
    const [levelIndex, setLevelIndex] = useState(0)
    const [round, setRound] = useState(() => createRound(LEVELS[0]))
    const [currentIndex, setCurrentIndex] = useState(0)
    const [pressedCode, setPressedCode] = useState('')
    const [stars, setStars] = useState(0)
    const [message, setMessage] = useState('Tap the glowing key')
    const [playing, setPlaying] = useState(true)
    const [complete, setComplete] = useState(false)

    const level = LEVELS[levelIndex]
    const currentTarget = round[currentIndex]
    const nextTargets = useMemo(() => round.slice(currentIndex, currentIndex + 5), [round, currentIndex])

    useEffect(() => {
        function onKeyDown(event) {
            const normalizedCode = event.code === 'Space' ? 'Space' : event.code

            if (playing && normalizedCode === 'Space') {
                event.preventDefault()
            }

            setPressedCode(normalizedCode)

            if (!playing || complete || !currentTarget) {
                return
            }

            if (normalizedCode === currentTarget.code) {
                setStars((value) => value + 1)
                setCurrentIndex((value) => value + 1)
                setMessage(randomPick(HAPPY_MESSAGES))
            } else {
                setMessage(`Try ${codeToLabel[currentTarget.code]}`)
            }
        }

        function onKeyUp() {
            setPressedCode('')
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [playing, complete, currentTarget])

    useEffect(() => {
        if (playing && currentIndex >= round.length && round.length > 0) {
            setPlaying(false)
            setComplete(true)
            setMessage('You did it!')
        }
    }, [playing, currentIndex, round.length])

    const goToLevel = useCallback((index) => {
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
        stars,
        message,
        playing,
        complete,
        helperFinger: currentTarget ? FINGER_LABELS[KEY_TO_FINGER[currentTarget.code]] : '',
        targetColor: currentTarget ? FINGER_COLORS[KEY_TO_FINGER[currentTarget.code]] : '#ffffff',
        goToLevel,
        goToNextLevel,
    }
}