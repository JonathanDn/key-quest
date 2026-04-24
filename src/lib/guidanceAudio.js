import { WORLD1_TAP_GUIDANCE_SET } from '../game/content/world1AudioText'

const TAP_GUIDANCE_AUDIO_BY_MESSAGE = {
    'Tap A': '/audio/tap-a.wav',
    'Tap B': '/audio/tap-b.wav',
    'Tap C': '/audio/tap-c.wav',
    'Tap D': '/audio/tap-d.wav',
    'Tap E': '/audio/tap-e.wav',
    'Tap F': '/audio/tap-f.wav',
    'Tap I': '/audio/tap-i.wav',
    'Tap J': '/audio/tap-j.wav',
    'Tap K': '/audio/tap-k.wav',
    'Tap L': '/audio/tap-l.wav',
    'Tap M': '/audio/tap-m.wav',
    'Tap N': '/audio/tap-n.wav',
    'Tap R': '/audio/tap-r.wav',
    'Tap S': '/audio/tap-s.wav',
    'Tap T': '/audio/tap-t.wav',
    'Tap U': '/audio/tap-u.wav',
    'Tap V': '/audio/tap-v.wav',
    'Tap Y': '/audio/tap-y.wav',
    'Tap ,': '/audio/tap-comma.wav',
    'Tap ;': '/audio/tap-semicolon.wav',
    'Tap SPACE': '/audio/tap-space.wav',
}

export function isWorldOneBasicsLevel(level) {
    return Boolean(level?.world === 1 && Array.isArray(level?.keys) && level.keys.length > 0)
}

export function isTapGuidanceMessage(message) {
    return typeof message === 'string' && WORLD1_TAP_GUIDANCE_SET.has(message)
}

export function shouldAutoPlayTapGuidance(level, message) {
    return isWorldOneBasicsLevel(level) && isTapGuidanceMessage(message)
}

export async function resolveGuidanceAudioSrc(message) {
    if (typeof message !== 'string' || !message.trim()) {
        return null
    }

    return TAP_GUIDANCE_AUDIO_BY_MESSAGE[message] ?? null
}
