import { describe, expect, it } from 'vitest'
import { collectGuidanceRowTexts } from '../../src/game/content/guidanceTextCatalog'

describe('collectGuidanceRowTexts', () => {
    it('includes exact guidance-row text used by key and prompt worlds', () => {
        const texts = collectGuidanceRowTexts()

        expect(texts).toContain('Tap J')
        expect(texts).toContain('Tap C')
        expect(texts).toContain('Type "cat"')
        expect(texts).toContain('Try J')
        expect(texts).toContain('Try CTRL + C')
    })
})
