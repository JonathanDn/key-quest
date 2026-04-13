import { supabase } from './supabase'

export async function getMyBestTimes(userId) {
    if (!userId) {
        throw new Error('Missing user id.')
    }

    const { data, error } = await supabase
        .from('user_best_times')
        .select('level_id, best_time_ms')
        .eq('user_id', userId)

    if (error) {
        throw error
    }

    return Object.fromEntries(
        (data ?? []).map((row) => [row.level_id, row.best_time_ms]),
    )
}

export async function saveMyBestTime({ userId, levelId, bestTimeMs }) {
    if (!userId) {
        throw new Error('Missing user id.')
    }

    if (!levelId) {
        throw new Error('Missing level id.')
    }

    if (!Number.isFinite(bestTimeMs) || bestTimeMs < 0) {
        throw new Error('Invalid best time.')
    }

    const { data, error } = await supabase
        .from('user_best_times')
        .upsert(
            {
                user_id: userId,
                level_id: levelId,
                best_time_ms: Math.round(bestTimeMs),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,level_id' },
        )
        .select('level_id, best_time_ms')
        .single()

    if (error) {
        throw error
    }

    return data
}