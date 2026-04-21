import { describe, expect, it } from 'vitest'

import { WORLD1_AUDIO_TEXT } from '../../src/game/content/world1AudioText'

describe('WORLD1_AUDIO_TEXT', () => {
    it('contains the expected world-1 tap guidance lines', () => {
        expect(WORLD1_AUDIO_TEXT.tapGuidance).toHaveLength(21)
        expect(new Set(WORLD1_AUDIO_TEXT.tapGuidance).size).toBe(21)
        expect(WORLD1_AUDIO_TEXT.tapGuidance).toContain('Tap A')
        expect(WORLD1_AUDIO_TEXT.tapGuidance).toContain('Tap SPACE')
        expect(WORLD1_AUDIO_TEXT.tapGuidance).toContain('Tap ,')
    })
})
