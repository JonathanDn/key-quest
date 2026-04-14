import { useEffect, useMemo, useState } from 'react'
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

    useEffect(() => {
        if (!enabled || !levelIds.length) {
            setTopByLevelId({})
            return
        }

        let isMounted = true

        async function loadAllGlobalPreviews() {
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

                if (!isMounted) {
                    return
                }

                setTopByLevelId(Object.fromEntries(results))
            } catch (error) {
                if (!isMounted) {
                    return
                }

                console.error('Failed to preload global leaderboard previews:', error)
                setTopByLevelId({})
            }
        }

        loadAllGlobalPreviews()

        return () => {
            isMounted = false
        }
    }, [enabled, levelIdsSignature])

    return {
        topByLevelId,
    }
}