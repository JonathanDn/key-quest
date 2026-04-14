import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLevelLeaderboardBatch } from '../lib/globalLeaderboard'

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
            const rowsByLevelId = await getLevelLeaderboardBatch({
                levelIds,
                limit: 1,
            })

            const nextTopByLevelId = levelIds.reduce((accumulator, levelId) => {
                accumulator[levelId] = rowsByLevelId[levelId]?.[0] ?? null
                return accumulator
            }, {})

            setTopByLevelId(nextTopByLevelId)
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
