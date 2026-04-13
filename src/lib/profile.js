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
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
        )
        .select('id, nickname, created_at, updated_at')
        .single()

    if (error) {
        throw error
    }

    return data
}