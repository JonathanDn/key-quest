import { describe, expect, it } from 'vitest'

import {
    isTapGuidanceMessage,
    isWorldOneBasicsLevel,
    resolveGuidanceAudioSrc,
    shouldAutoPlayTapGuidance,
} from '../../src/lib/guidanceAudio'

describe('guidance audio helpers', () => {
    it('detects world one basics levels', () => {
        expect(isWorldOneBasicsLevel({ world: 1, keys: ['KeyA'] })).toBe(true)
        expect(isWorldOneBasicsLevel({ world: 2, keys: ['KeyA'] })).toBe(false)
        expect(isWorldOneBasicsLevel({ world: 1, keys: [] })).toBe(false)
    })

    it('detects tap guidance copy', () => {
        expect(isTapGuidanceMessage('Tap A')).toBe(true)
        expect(isTapGuidanceMessage('Tap Q')).toBe(false)
        expect(isTapGuidanceMessage('Try A')).toBe(false)
        expect(isTapGuidanceMessage('')).toBe(false)
    })

    it('only auto-plays tap guidance in world one basics', () => {
        const worldOneLevel = { world: 1, keys: ['KeyA'] }
        const worldThreeLevel = { world: 3, keys: ['KeyA'] }

        expect(shouldAutoPlayTapGuidance(worldOneLevel, 'Tap A')).toBe(true)
        expect(shouldAutoPlayTapGuidance(worldOneLevel, 'Try A')).toBe(false)
        expect(shouldAutoPlayTapGuidance(worldThreeLevel, 'Tap A')).toBe(false)
    })

    it('resolves tap guidance messages to world one tap audio files', async () => {
        await expect(resolveGuidanceAudioSrc('Tap A')).resolves.toBe('/audio/tap-a.wav')
        await expect(resolveGuidanceAudioSrc('Tap ;')).resolves.toBe('/audio/tap-semicolon.wav')
        await expect(resolveGuidanceAudioSrc('Tap SPACE')).resolves.toBe('/audio/tap-space.wav')
        await expect(resolveGuidanceAudioSrc('Try A')).resolves.toBeNull()
    })
})
