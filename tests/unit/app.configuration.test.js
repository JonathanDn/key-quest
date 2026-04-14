import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const { useSupabaseAuthMock } = vi.hoisted(() => ({
    useSupabaseAuthMock: vi.fn(() => {
        throw new Error('useSupabaseAuth should not be called when backend config is missing.')
    }),
}))

vi.mock('../../src/lib/supabase', () => ({
    supabase: null,
    supabaseInitialization: {
        isConfigured: false,
        missingEnvVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    },
    getSupabaseClient: vi.fn(() => null),
}))

vi.mock('../../src/hooks/useSupabaseAuth', () => ({
    useSupabaseAuth: useSupabaseAuthMock,
}))

import App from '../../src/App'

describe('App startup configuration guard', () => {
    it('renders a service-unavailable screen when backend config is missing', () => {
        const html = renderToStaticMarkup(React.createElement(App))

        expect(useSupabaseAuthMock).not.toHaveBeenCalled()
        expect(html).toContain('Service Unavailable')
        expect(html).toContain('Key Quest is temporarily unavailable')
        expect(html).toContain('Missing environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
        expect(html).toContain('Retry')
    })
})
