import { useEffect, useRef, useState } from 'react'

export function useStageEffects({
                                    ui,
                                    successFx,
                                    playing,
                                    complete,
                                    level,
                                    levelIndex,
                                    currentWorld,
                                    hasNextLevel,
                                    isWorldBoundary,
                                    isStandardLevelComplete,
                                    gameFinished,
                                    goToLevel,
                                    goToNextLevel,
                                    targetAreaRef,
                                    targetVisualRef,
                                    starCounterRef,
                                    worldBadgeRefs,
                                    levelNodeRefs,
                                }) {
    const [nextCountdown, setNextCountdown] = useState(null)
    const [worldCountdown, setWorldCountdown] = useState(null)
    const [clipboardBurst, setClipboardBurst] = useState(false)
    const [targetBurst, setTargetBurst] = useState(false)
    const [showSuccessBurst, setShowSuccessBurst] = useState(false)
    const [showPraiseChip, setShowPraiseChip] = useState(false)
    const [flyingStar, setFlyingStar] = useState(null)
    const [starPulse, setStarPulse] = useState(false)
    const [levelCompleteFx, setLevelCompleteFx] = useState({ active: false, phase: 'idle' })
    const [levelTravelStars, setLevelTravelStars] = useState([])
    const [showLevelBanner, setShowLevelBanner] = useState(false)
    const [worldCompleteFx, setWorldCompleteFx] = useState({ active: false, phase: 'idle' })
    const [worldTravelStars, setWorldTravelStars] = useState([])
    const [showPortalCard, setShowPortalCard] = useState(false)
    const [showWorldCta, setShowWorldCta] = useState(false)

    const previousClipboardRef = useRef(ui.wordPower.clipboardText)
    const previousTargetRef = useRef(ui.wordPower.targetText)

    useEffect(() => {
        if (!ui.showWordPowerBoard) {
            previousClipboardRef.current = ui.wordPower.clipboardText
            previousTargetRef.current = ui.wordPower.targetText
            setClipboardBurst(false)
            setTargetBurst(false)
            return
        }

        let clipboardTimeout
        let targetTimeout

        if (previousClipboardRef.current !== ui.wordPower.clipboardText) {
            setClipboardBurst(true)
            clipboardTimeout = window.setTimeout(() => {
                setClipboardBurst(false)
            }, 450)
        }

        if (previousTargetRef.current !== ui.wordPower.targetText) {
            setTargetBurst(true)
            targetTimeout = window.setTimeout(() => {
                setTargetBurst(false)
            }, 450)
        }

        previousClipboardRef.current = ui.wordPower.clipboardText
        previousTargetRef.current = ui.wordPower.targetText

        return () => {
            window.clearTimeout(clipboardTimeout)
            window.clearTimeout(targetTimeout)
        }
    }, [ui.showWordPowerBoard, ui.wordPower.clipboardText, ui.wordPower.targetText])

    useEffect(() => {
        if (!successFx.id) {
            return
        }

        setShowSuccessBurst(true)
        setShowPraiseChip(true)
        setStarPulse(true)

        const targetRect = targetVisualRef.current?.getBoundingClientRect()
        const starRect = starCounterRef.current?.getBoundingClientRect()

        if (targetRect && starRect) {
            const startX = targetRect.left + targetRect.width / 2
            const startY = targetRect.top + targetRect.height / 2
            const endX = starRect.left + starRect.width / 2
            const endY = starRect.top + starRect.height / 2

            setFlyingStar({
                id: successFx.id,
                startX,
                startY,
                deltaX: endX - startX,
                deltaY: endY - startY,
            })
        } else {
            setFlyingStar(null)
        }

        const burstTimeout = window.setTimeout(() => setShowSuccessBurst(false), 320)
        const praiseTimeout = window.setTimeout(() => setShowPraiseChip(false), 520)
        const starTimeout = window.setTimeout(() => setFlyingStar(null), 520)
        const pulseTimeout = window.setTimeout(() => setStarPulse(false), 300)

        return () => {
            window.clearTimeout(burstTimeout)
            window.clearTimeout(praiseTimeout)
            window.clearTimeout(starTimeout)
            window.clearTimeout(pulseTimeout)
        }
    }, [successFx.id, targetVisualRef, starCounterRef])

    function spawnLevelTravelStars() {
        const targetRect = targetAreaRef.current?.getBoundingClientRect()
        const nodeRect = levelNodeRefs.current[level.id]?.getBoundingClientRect()

        if (!targetRect || !nodeRect) {
            setLevelTravelStars([])
            return
        }

        const startX = targetRect.left + targetRect.width / 2
        const startY = targetRect.top + targetRect.height * 0.44
        const endX = nodeRect.left + nodeRect.width / 2
        const endY = nodeRect.top + nodeRect.height / 2

        const configs = [
            { glyph: '⭐', offsetX: -36, offsetY: 12, launchX: -18, launchY: -48, endX: -8, endY: -4, delay: 0, size: 1.14 },
            { glyph: '✨', offsetX: 0, offsetY: -20, launchX: 0, launchY: -58, endX: 0, endY: -10, delay: 80, size: 1.0 },
            { glyph: '⭐', offsetX: 38, offsetY: 8, launchX: 18, launchY: -48, endX: 8, endY: -2, delay: 160, size: 1.1 },
        ]

        setLevelTravelStars(
            configs.map((config, index) => {
                const starStartX = startX + config.offsetX
                const starStartY = startY + config.offsetY
                const starEndX = endX + config.endX
                const starEndY = endY + config.endY

                return {
                    id: `level-${levelIndex}-${index}`,
                    glyph: config.glyph,
                    startX: starStartX,
                    startY: starStartY,
                    launchX: config.launchX,
                    launchY: config.launchY,
                    deltaX: starEndX - starStartX,
                    deltaY: starEndY - starStartY,
                    delay: config.delay,
                    size: config.size,
                }
            }),
        )
    }

    function spawnWorldTravelStars() {
        const targetRect = targetAreaRef.current?.getBoundingClientRect()
        const badgeRect = worldBadgeRefs.current[currentWorld]?.getBoundingClientRect()

        if (!targetRect || !badgeRect) {
            setWorldTravelStars([])
            return
        }

        const startX = targetRect.left + targetRect.width / 2
        const startY = targetRect.top + targetRect.height * 0.42
        const endX = badgeRect.left + badgeRect.width / 2
        const endY = badgeRect.top + badgeRect.height / 2

        const configs = [
            { glyph: '⭐', offsetX: -84, offsetY: 16, launchX: -28, launchY: -54, endX: -18, endY: -8, delay: 0, size: 1.28 },
            { glyph: '✨', offsetX: -36, offsetY: -26, launchX: -12, launchY: -68, endX: 6, endY: -14, delay: 70, size: 1.08 },
            { glyph: '⭐', offsetX: 0, offsetY: 28, launchX: 0, launchY: -74, endX: -4, endY: 8, delay: 130, size: 1.34 },
            { glyph: '✨', offsetX: 38, offsetY: -18, launchX: 16, launchY: -62, endX: 14, endY: -10, delay: 190, size: 1.08 },
            { glyph: '⭐', offsetX: 86, offsetY: 10, launchX: 28, launchY: -54, endX: 22, endY: 2, delay: 250, size: 1.2 },
        ]

        setWorldTravelStars(
            configs.map((config, index) => {
                const starStartX = startX + config.offsetX
                const starStartY = startY + config.offsetY
                const starEndX = endX + config.endX
                const starEndY = endY + config.endY

                return {
                    id: `world-${levelIndex}-${currentWorld}-${index}`,
                    glyph: config.glyph,
                    startX: starStartX,
                    startY: starStartY,
                    launchX: config.launchX,
                    launchY: config.launchY,
                    deltaX: starEndX - starStartX,
                    deltaY: starEndY - starStartY,
                    delay: config.delay,
                    size: config.size,
                }
            }),
        )
    }

    useEffect(() => {
        if (complete) {
            return
        }

        setLevelCompleteFx({ active: false, phase: 'idle' })
        setLevelTravelStars([])
        setShowLevelBanner(false)
        setWorldCompleteFx({ active: false, phase: 'idle' })
        setWorldTravelStars([])
        setShowPortalCard(false)
        setShowWorldCta(false)
        setNextCountdown(null)
        setWorldCountdown(null)
    }, [complete, levelIndex])

    useEffect(() => {
        if (!isStandardLevelComplete) {
            return
        }

        setLevelCompleteFx({ active: true, phase: 'burst' })
        setLevelTravelStars([])
        setShowLevelBanner(false)

        const trailTimer = window.setTimeout(() => {
            setLevelCompleteFx({ active: true, phase: 'trail' })
            setShowLevelBanner(true)
            spawnLevelTravelStars()
        }, 180)

        const readyTimer = window.setTimeout(() => {
            setLevelCompleteFx({ active: true, phase: 'ready' })
        }, 900)

        return () => {
            window.clearTimeout(trailTimer)
            window.clearTimeout(readyTimer)
        }
    }, [isStandardLevelComplete, level.id, levelIndex])

    useEffect(() => {
        if (!isWorldBoundary) {
            return
        }

        setWorldCompleteFx({ active: true, phase: 'burst' })
        setWorldTravelStars([])
        setShowPortalCard(false)
        setShowWorldCta(false)

        const burstTimer = window.setTimeout(() => {
            setWorldCompleteFx({ active: true, phase: 'travel' })
            spawnWorldTravelStars()
        }, 220)

        const portalTimer = window.setTimeout(() => {
            setWorldCompleteFx({ active: true, phase: 'portal' })
            setWorldTravelStars([])
            setShowPortalCard(true)
        }, 920)

        const readyTimer = window.setTimeout(() => {
            setWorldCompleteFx({ active: true, phase: 'ready' })
            setShowWorldCta(true)
        }, 1500)

        return () => {
            window.clearTimeout(burstTimer)
            window.clearTimeout(portalTimer)
            window.clearTimeout(readyTimer)
        }
    }, [isWorldBoundary, currentWorld, levelIndex])

    useEffect(() => {
        if (!complete || !hasNextLevel || isWorldBoundary) {
            setNextCountdown(null)
            return
        }

        setNextCountdown(5)

        const timeoutId = window.setTimeout(() => {
            goToNextLevel()
        }, 5000)

        const intervalId = window.setInterval(() => {
            setNextCountdown((value) => {
                if (value === null) {
                    return null
                }

                return value > 1 ? value - 1 : 1
            })
        }, 1000)

        return () => {
            window.clearTimeout(timeoutId)
            window.clearInterval(intervalId)
        }
    }, [complete, hasNextLevel, isWorldBoundary, goToNextLevel])

    useEffect(() => {
        if (!showWorldCta || !hasNextLevel || !isWorldBoundary) {
            setWorldCountdown(null)
            return
        }

        setWorldCountdown(4)

        const timeoutId = window.setTimeout(() => {
            goToNextLevel()
        }, 4000)

        const intervalId = window.setInterval(() => {
            setWorldCountdown((value) => {
                if (value === null) {
                    return null
                }

                return value > 1 ? value - 1 : 1
            })
        }, 1000)

        return () => {
            window.clearTimeout(timeoutId)
            window.clearInterval(intervalId)
        }
    }, [showWorldCta, hasNextLevel, isWorldBoundary, goToNextLevel])

    const showNextButton = complete && hasNextLevel && !isWorldBoundary
    const showWorldNextButton = hasNextLevel && isWorldBoundary && showWorldCta
    const showPlayAgainButton = gameFinished && showWorldCta

    useEffect(() => {
        const canUseEnter = showNextButton || showWorldNextButton || showPlayAgainButton

        if (!canUseEnter) {
            return
        }

        function onKeyDown(event) {
            if (event.code !== 'Enter' && event.code !== 'NumpadEnter') {
                return
            }

            event.preventDefault()

            if (showNextButton || showWorldNextButton) {
                goToNextLevel()
                return
            }

            if (showPlayAgainButton) {
                goToLevel(0)
            }
        }

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [showNextButton, showWorldNextButton, showPlayAgainButton, goToNextLevel, goToLevel])

    return {
        nextCountdown,
        worldCountdown,
        clipboardBurst,
        targetBurst,
        showSuccessBurst,
        showPraiseChip,
        flyingStar,
        starPulse,
        levelCompleteFx,
        levelTravelStars,
        showLevelBanner,
        worldCompleteFx,
        worldTravelStars,
        showPortalCard,
        showWorldCta,
    }
}