import { describe, expect, it } from 'vitest'

import { isEditableEventTarget } from '../../src/hooks/useTypingGame'

describe('isEditableEventTarget', () => {
    it('returns true for editable form controls', () => {
        expect(isEditableEventTarget({ tagName: 'INPUT' })).toBe(true)
        expect(isEditableEventTarget({ tagName: 'textarea' })).toBe(true)
        expect(isEditableEventTarget({ tagName: 'select' })).toBe(true)
    })

    it('returns true for content-editable elements', () => {
        expect(isEditableEventTarget({ tagName: 'div', isContentEditable: true })).toBe(true)
    })

    it('returns false for non-editable targets', () => {
        expect(isEditableEventTarget({ tagName: 'button' })).toBe(false)
        expect(isEditableEventTarget({})).toBe(false)
        expect(isEditableEventTarget(null)).toBe(false)
    })
})
