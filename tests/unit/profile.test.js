import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
    fromMock: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
    supabase: {
        from: fromMock,
    },
}))

import { getMyProfile, saveMyProfile } from '../../src/lib/profile'

describe('profile helpers', () => {
    beforeEach(() => {
        fromMock.mockReset()
    })

    it('loads the current user profile', async () => {
        const maybeSingleMock = vi.fn().mockResolvedValue({
            data: {
                id: 'user-1',
                nickname: 'Tester',
                created_at: '2026-04-12T00:00:00.000Z',
                updated_at: '2026-04-12T00:00:00.000Z',
            },
            error: null,
        })

        const eqMock = vi.fn().mockReturnValue({
            maybeSingle: maybeSingleMock,
        })

        const selectMock = vi.fn().mockReturnValue({
            eq: eqMock,
        })

        fromMock.mockReturnValue({
            select: selectMock,
        })

        await expect(getMyProfile('user-1')).resolves.toEqual({
            id: 'user-1',
            nickname: 'Tester',
            created_at: '2026-04-12T00:00:00.000Z',
            updated_at: '2026-04-12T00:00:00.000Z',
        })

        expect(fromMock).toHaveBeenCalledWith('profiles')
        expect(selectMock).toHaveBeenCalledWith('id, nickname, created_at, updated_at')
        expect(eqMock).toHaveBeenCalledWith('id', 'user-1')
    })

    it('validates nickname before saving', async () => {
        await expect(
            saveMyProfile({
                userId: '',
                nickname: 'Player',
            }),
        ).rejects.toThrow('Missing user id.')

        await expect(
            saveMyProfile({
                userId: 'user-1',
                nickname: '   ',
            }),
        ).rejects.toThrow('Please type your nickname.')
    })

    it('upserts the current user profile', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: {
                id: 'user-1',
                nickname: 'Player One',
                created_at: '2026-04-12T00:00:00.000Z',
                updated_at: '2026-04-12T00:00:00.000Z',
            },
            error: null,
        })

        const selectMock = vi.fn().mockReturnValue({
            single: singleMock,
        })

        const upsertMock = vi.fn().mockReturnValue({
            select: selectMock,
        })

        const eqMock = vi.fn().mockResolvedValue({
            error: null,
        })

        const updateMock = vi.fn().mockReturnValue({
            eq: eqMock,
        })

        fromMock
            .mockReturnValueOnce({
            upsert: upsertMock,
        })
            .mockReturnValueOnce({
                update: updateMock,
            })

        await expect(
            saveMyProfile({
                userId: 'user-1',
                nickname: '  Player One  ',
            }),
        ).resolves.toEqual({
            id: 'user-1',
            nickname: 'Player One',
            created_at: '2026-04-12T00:00:00.000Z',
            updated_at: '2026-04-12T00:00:00.000Z',
        })

        expect(fromMock).toHaveBeenCalledWith('profiles')
        expect(fromMock).toHaveBeenCalledWith('user_best_times')
        expect(upsertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'user-1',
                nickname: 'Player One',
            }),
            { onConflict: 'id' },
        )
        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                nickname: 'Player One',
            }),
        )
        expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1')
    })

    it('throws when syncing nickname into best-time rows fails', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: {
                id: 'user-1',
                nickname: 'Player One',
                created_at: '2026-04-12T00:00:00.000Z',
                updated_at: '2026-04-12T00:00:00.000Z',
            },
            error: null,
        })

        const selectMock = vi.fn().mockReturnValue({
            single: singleMock,
        })

        const upsertMock = vi.fn().mockReturnValue({
            select: selectMock,
        })

        const eqMock = vi.fn().mockResolvedValue({
            error: new Error('sync failed'),
        })

        const updateMock = vi.fn().mockReturnValue({
            eq: eqMock,
        })

        fromMock
            .mockReturnValueOnce({
                upsert: upsertMock,
            })
            .mockReturnValueOnce({
                update: updateMock,
            })

        await expect(
            saveMyProfile({
                userId: 'user-1',
                nickname: 'Player One',
            }),
        ).rejects.toThrow('sync failed')
    })
})
