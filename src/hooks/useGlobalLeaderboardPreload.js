import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLevelLeaderboard } from '../lib/globalLeaderboard'

export function useGlobalLeaderboardPreload(levels, enabled = true) {
    const levelIds = useMemo(
        () => Array.from(new Set((levels ?? []).map((entry) => entry.id))),
        [levels],
    )

    const levelIdsSignature = useMemo(
        () => levelIds.join('|'),
        [levelIds],
    )

    const [topByLevelId, setTopByLevelId] = useState({})

    const refreshGlobalLeaderboard = useCallback(async () => {
        if (!enabled || !levelIds.length) {
            setTopByLevelId({})
            return
        }

        try {
            const results = await Promise.all(
                levelIds.map(async (levelId) => {
                    try {
                        const result = await getLevelLeaderboard({
                            levelId,
                            limit: 1,
                        })

                        return [levelId, result.topRows[0] ?? null]
                    } catch (error) {
                        console.error(`Failed to preload global leaderboard preview for ${levelId}:`, error)
                        return [levelId, null]
                    }
                }),
            )

            setTopByLevelId(Object.fromEntries(results))
        } catch (error) {
            console.error('Failed to preload global leaderboard previews:', error)
            setTopByLevelId({})
        }
    }, [enabled, levelIds, levelIdsSignature])

    useEffect(() => {
        let isMounted = true

        refreshGlobalLeaderboard().catch((error) => {
            if (!isMounted) {
                return
            }

            console.error('Failed to refresh global leaderboard previews:', error)
        })

        return () => {
            isMounted = false
        }
    }, [refreshGlobalLeaderboard])

    return {
        topByLevelId,
        refreshGlobalLeaderboard,
    }
}
