import { supabase } from './supabase'

export async function getMyProfile(userId) {
    if (!userId) {
        throw new Error('Missing user id.')
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        throw error
    }

    return data
}

export async function saveMyProfile({ userId, nickname }) {
    const normalizedNickname = nickname.trim()
    const updatedAt = new Date().toISOString()

    if (!userId) {
        throw new Error('Missing user id.')
    }

    if (!normalizedNickname) {
        throw new Error('Please type your nickname.')
    }

    const { data, error } = await supabase
        .from('profiles')
        .upsert(
            {
                id: userId,
                nickname: normalizedNickname,
                updated_at: updatedAt,
            },
            { onConflict: 'id' },
        )
        .select('id, nickname, created_at, updated_at')
        .single()

    if (error) {
        throw error
    }

    const { error: bestTimesUpdateError } = await supabase
        .from('user_best_times')
        .update({
            nickname: normalizedNickname,
            updated_at: updatedAt,
        })
        .eq('user_id', userId)

    if (bestTimesUpdateError && isMissingNicknameColumnError(bestTimesUpdateError)) {
        const { error: bestTimesTouchError } = await supabase
            .from('user_best_times')
            .update({
                updated_at: updatedAt,
            })
            .eq('user_id', userId)

        if (bestTimesTouchError) {
            throw bestTimesTouchError
        }
    } else if (bestTimesUpdateError) {
        throw bestTimesUpdateError
    }

    return data
}

function isMissingNicknameColumnError(error) {
    const message = `${error?.message ?? ''}`.toLowerCase()
    return (
        message.includes("could not find the 'nickname' column") &&
        message.includes('user_best_times')
    )
}
