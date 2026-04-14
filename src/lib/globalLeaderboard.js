import { supabase } from './supabase'

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

    const rows = data ?? []

    return {
        rows,
        topRows: rows.filter((row) => row.row_kind === 'top'),
        currentUserRow: rows.find((row) => row.is_current_user) ?? null,
    }
}