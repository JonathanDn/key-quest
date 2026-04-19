import { useEffect, useRef } from 'react'

const COMBO_POWER_CUE_BY_NAME = {
    'Copy Power': '/audio/voice/combo/copy-step.wav',
    'Paste Power': '/audio/voice/combo/paste-step.wav',
    'Undo Power': '/audio/voice/combo/undo-step.wav',
}

const FALLBACK_CUES = {
    combo: '/audio/voice/combo/combo-step.wav',
    textStepStart: '/audio/voice/text/start-cue.wav',
    levelComplete: '/audio/voice/complete/level-complete.wav',
    worldComplete: '/audio/voice/complete/world-complete.wav',
    gameComplete: '/audio/voice/complete/game-complete.wav',
}

function buildSingleTargetCue(code) {
    if (!code) {
        return null
    }

    return `/audio/voice/single/${code}.wav`
}

export function useVoiceCues({
    ui,
    message,
    progression,
    enabled = true,
}) {
    const previousTargetIdRef = useRef(null)
    const wasCompleteRef = useRef(false)
    const audioCacheRef = useRef(new Map())
    const guidanceCueMapRef = useRef(null)

    useEffect(() => {
        if (!enabled) {
            return
        }

        let active = true

        fetch('/audio/voice/guidance/guidance_map.json')
            .then((response) => {
                if (!response.ok) {
                    return null
                }

                return response.json()
            })
            .then((cueMap) => {
                if (!active || !cueMap || typeof cueMap !== 'object') {
                    return
                }

                guidanceCueMapRef.current = cueMap
            })
            .catch(() => {})

        return () => {
            active = false
        }
    }, [enabled])

    useEffect(() => {
        if (!enabled) {
            return
        }

        const currentTargetId = ui.queue?.[0]?.id ?? null
        const isNewTarget = Boolean(
            currentTargetId &&
            previousTargetIdRef.current !== currentTargetId,
        )

        function playCue(src) {
            if (!src) {
                return
            }

            let audio = audioCacheRef.current.get(src)

            if (!audio) {
                audio = new Audio(src)
                audio.preload = 'auto'
                audioCacheRef.current.set(src, audio)
            }

            audio.currentTime = 0
            audio.play().catch(() => {})
        }

        if (isNewTarget) {
            const guidanceCue = guidanceCueMapRef.current?.[message]

            if (guidanceCue) {
                playCue(guidanceCue)
            } else if (ui.target.mode === 'single') {
                playCue(buildSingleTargetCue(ui.keyboard.targetCodes?.[0]))
            } else if (ui.target.mode === 'combo') {
                playCue(
                    COMBO_POWER_CUE_BY_NAME[ui.wordPower?.powerName] ??
                    FALLBACK_CUES.combo,
                )
            } else if (ui.target.mode === 'textStep') {
                playCue(FALLBACK_CUES.textStepStart)
            }
        }

        const isCompleteNow = ui.target.mode === 'complete'
        const transitionedToComplete = isCompleteNow && !wasCompleteRef.current

        if (transitionedToComplete) {
            if (progression.gameFinished) {
                playCue(FALLBACK_CUES.gameComplete)
            } else if (progression.isWorldBoundary) {
                playCue(FALLBACK_CUES.worldComplete)
            } else {
                playCue(FALLBACK_CUES.levelComplete)
            }
        }

        previousTargetIdRef.current = currentTargetId
        wasCompleteRef.current = isCompleteNow
    }, [
        enabled,
        progression.gameFinished,
        progression.isWorldBoundary,
        ui.keyboard.targetCodes,
        message,
        ui.queue,
        ui.target.mode,
        ui.wordPower?.powerName,
    ])
}
