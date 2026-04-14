import { useEffect, useRef } from 'react'
import { saveMyBestTime } from '../lib/remoteBestTimes'

export function useBestTimeSync({ userId, bestTimesByLevelId, cloudBestTimes }) {
    const syncedBestTimesRef = useRef(cloudBestTimes ?? {})

    useEffect(() => {
        syncedBestTimesRef.current = cloudBestTimes ?? {}
    }, [cloudBestTimes, userId])

    useEffect(() => {
        if (!userId) {
            return
        }

        const lastSyncedBestTimes = syncedBestTimesRef.current ?? {}

        const pendingEntries = Object.entries(bestTimesByLevelId ?? {}).filter(
            ([levelId, nextBestTimeMs]) => (
                typeof nextBestTimeMs === 'number' && (
                    typeof lastSyncedBestTimes[levelId] !== 'number' ||
                    nextBestTimeMs < lastSyncedBestTimes[levelId]
                )
            ),
        )

        if (!pendingEntries.length) {
            return
        }

        const nextSyncedBestTimes = { ...lastSyncedBestTimes }

        pendingEntries.forEach(([levelId, nextBestTimeMs]) => {
            nextSyncedBestTimes[levelId] = nextBestTimeMs
        })

        syncedBestTimesRef.current = nextSyncedBestTimes

        Promise.all(
            pendingEntries.map(([levelId, nextBestTimeMs]) => (
                saveMyBestTime({
                    userId,
                    levelId,
                    bestTimeMs: nextBestTimeMs,
                })
            )),
        ).catch((error) => {
            console.error('Failed to sync best times to Supabase:', error)
        })
    }, [userId, bestTimesByLevelId])
}
