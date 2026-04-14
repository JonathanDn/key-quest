import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
    fromMock: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
    supabase: {
        from: fromMock,
    },
}))

import { getMyBestTimes, saveMyBestTime } from '../../src/lib/remoteBestTimes'

describe('remoteBestTimes', () => {
    beforeEach(() => {
        fromMock.mockReset()
    })

    it('maps cloud best-time rows into a levelId -> time object', async () => {
        const eqMock = vi.fn().mockResolvedValue({
            data: [
                { level_id: 'home-friends', best_time_ms: 3210 },
                { level_id: 'thumb-bounce', best_time_ms: 4560 },
            ],
            error: null,
        })

        const selectMock = vi.fn().mockReturnValue({
            eq: eqMock,
        })

        fromMock.mockReturnValue({
            select: selectMock,
        })

        await expect(getMyBestTimes('user-1')).resolves.toEqual({
            'home-friends': 3210,
            'thumb-bounce': 4560,
        })

        expect(fromMock).toHaveBeenCalledWith('user_best_times')
        expect(selectMock).toHaveBeenCalledWith('level_id, best_time_ms')
        expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1')
    })

    it('throws when loading cloud best times fails', async () => {
        const eqMock = vi.fn().mockResolvedValue({
            data: null,
            error: new Error('select failed'),
        })

        const selectMock = vi.fn().mockReturnValue({
            eq: eqMock,
        })

        fromMock.mockReturnValue({
            select: selectMock,
        })

        await expect(getMyBestTimes('user-1')).rejects.toThrow('select failed')
    })

    it('validates save inputs before writing', async () => {
        await expect(
            saveMyBestTime({
                userId: '',
                levelId: 'home-friends',
                bestTimeMs: 1000,
            }),
        ).rejects.toThrow('Missing user id.')

        await expect(
            saveMyBestTime({
                userId: 'user-1',
                levelId: '',
                bestTimeMs: 1000,
            }),
        ).rejects.toThrow('Missing level id.')

        await expect(
            saveMyBestTime({
                userId: 'user-1',
                levelId: 'home-friends',
                bestTimeMs: -1,
            }),
        ).rejects.toThrow('Invalid best time.')
    })

    it('upserts one cloud best time row and returns the saved row', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: {
                level_id: 'home-friends',
                best_time_ms: 987,
            },
            error: null,
        })

        const selectMock = vi.fn().mockReturnValue({
            single: singleMock,
        })

        const upsertMock = vi.fn().mockReturnValue({
            select: selectMock,
        })

        fromMock.mockReturnValue({
            upsert: upsertMock,
        })

        await expect(
            saveMyBestTime({
                userId: 'user-1',
                levelId: 'home-friends',
                bestTimeMs: 987.4,
            }),
        ).resolves.toEqual({
            level_id: 'home-friends',
            best_time_ms: 987,
        })

        expect(fromMock).toHaveBeenCalledWith('user_best_times')
        expect(upsertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 'user-1',
                level_id: 'home-friends',
                best_time_ms: 987,
            }),
            { onConflict: 'user_id,level_id' },
        )
    })
})