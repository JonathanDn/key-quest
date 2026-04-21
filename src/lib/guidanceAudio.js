let guidanceMapPromise = null

export function isWorldOneBasicsLevel(level) {
    return Boolean(level?.world === 1 && Array.isArray(level?.keys) && level.keys.length > 0)
}

export function isTapGuidanceMessage(message) {
    return typeof message === 'string' && message.startsWith('Tap ')
}

export function shouldAutoPlayTapGuidance(level, message) {
    return isWorldOneBasicsLevel(level) && isTapGuidanceMessage(message)
}

export async function loadGuidanceAudioMap() {
    if (!guidanceMapPromise) {
        guidanceMapPromise = fetch('/audio/voice/guidance/guidance_map.json')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load guidance audio map (${response.status})`)
                }

                return response.json()
            })
    }

    return guidanceMapPromise
}

export async function resolveGuidanceAudioSrc(message) {
    if (typeof message !== 'string' || !message.trim()) {
        return null
    }

    const guidanceMap = await loadGuidanceAudioMap()
    return guidanceMap[message] ?? null
}
