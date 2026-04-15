import { supabase } from './supabase'

let batchLeaderboardRpcState = 'unknown'
const BATCH_RPC_MISSING_STORAGE_KEY = 'global_leaderboard_batch_rpc_missing'

if (typeof window !== 'undefined' && window.localStorage?.getItem(BATCH_RPC_MISSING_STORAGE_KEY) === '1') {
    batchLeaderboardRpcState = 'missing'
}

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

    if (batchLeaderboardRpcState === 'missing' || batchLeaderboardRpcState === 'checking') {
        return fetchLeaderboardsIndividually({
            levelIds: normalizedLevelIds,
            limit,
        })
    }

    batchLeaderboardRpcState = 'checking'

    const { data, error } = await supabase.rpc('get_level_leaderboard_batch', {
        p_level_ids: normalizedLevelIds,
        p_limit: limit,
    })

    if (error) {
        if (isMissingBatchRpc(error)) {
            batchLeaderboardRpcState = 'missing'
            persistMissingBatchRpcState()
            return fetchLeaderboardsIndividually({
                levelIds: normalizedLevelIds,
                limit,
            })
        }

        batchLeaderboardRpcState = 'unknown'
        throw error
    }

    batchLeaderboardRpcState = 'available'

    const rows = data ?? []

    return normalizedLevelIds.reduce((accumulator, levelId) => {
        accumulator[levelId] = rows.filter((row) => row.level_id === levelId)
        return accumulator
    }, {})
}

function isMissingBatchRpc(error) {
    const message = typeof error?.message === 'string' ? error.message : ''
    const details = typeof error?.details === 'string' ? error.details : ''
    const code = typeof error?.code === 'string' ? error.code : ''
    const hint = typeof error?.hint === 'string' ? error.hint : ''

    const mentionsBatchRpc =
        message.includes('get_level_leaderboard_batch') ||
        details.includes('get_level_leaderboard_batch') ||
        hint.includes('get_level_leaderboard_batch')

    if (code === 'PGRST202') {
        return true
    }

    if (error?.status === 404 || code === '404') {
        return mentionsBatchRpc || message.toLowerCase().includes('not found')
    }

    return false
}

function persistMissingBatchRpcState() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return
    }

    window.localStorage.setItem(BATCH_RPC_MISSING_STORAGE_KEY, '1')
}

async function fetchLeaderboardsIndividually({ levelIds, limit }) {
    const results = await Promise.all(
        levelIds.map(async (levelId) => {
            const leaderboard = await getLevelLeaderboard({
                levelId,
                limit,
            })

            return [levelId, leaderboard.rows]
        }),
    )

    return Object.fromEntries(results)
}
