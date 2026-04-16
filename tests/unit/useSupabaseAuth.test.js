import { describe, expect, it } from 'vitest'

import { isUserAlreadyRegisteredError } from '../../src/hooks/useSupabaseAuth'

describe('isUserAlreadyRegisteredError', () => {
    it('returns true when the provider reports user_already_exists', () => {
        expect(
            isUserAlreadyRegisteredError({
                code: 'user_already_exists',
                message: 'duplicate user',
            }),
        ).toBe(true)
    })

    it('returns true when the provider message says already registered', () => {
        expect(
            isUserAlreadyRegisteredError({
                message: 'User already registered',
            }),
        ).toBe(true)
    })

    it('returns false for unrelated errors', () => {
        expect(
            isUserAlreadyRegisteredError({
                code: 'invalid_credentials',
                message: 'Invalid login credentials',
            }),
        ).toBe(false)
    })
})
