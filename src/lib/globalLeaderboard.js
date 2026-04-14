import { supabase } from './supabase'

function createLeaderboardResult(rows = []) {
    return {
        rows,
        topRows: rows.filter((row) => row.row_kind === 'top'),
        currentUserRow: rows.find((row) => row.is_current_user) ?? null,
    }
}

export async function getLevelLeaderboard({ levelId, limit = 10 }) {
    if (!levelId) {
        throw new Error('Missing level id.')
    }

    const { data, error } = await supabase.rpc('get_level_leaderboard', {
        p_level_id: levelId,
        p_limit: limit,
    })

    if (error) {
        throw error
    }

    return createLeaderboardResult(data ?? [])
}

export async function getLevelLeaderboardBatch({ levelIds, limit = 1 }) {
    const normalizedLevelIds = Array.from(new Set((levelIds ?? []).filter(Boolean)))

    if (!normalizedLevelIds.length) {
        return {}
    }

    const { data, error } = await supabase.rpc('get_level_leaderboard_batch', {
        p_level_ids: normalizedLevelIds,
        p_limit: limit,
    })

    if (error) {
        throw error
    }

    const rows = data ?? []

    return normalizedLevelIds.reduce((accumulator, levelId) => {
        accumulator[levelId] = rows.filter((row) => row.level_id === levelId)
        return accumulator
    }, {})
}
