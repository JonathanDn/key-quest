import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.e2e.local', override: true })

const TEST_EMAIL_PREFIX = 'keyquest-e2e-'

function getSupabaseAdminClient() {
    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL for E2E cleanup.')
    }

    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for E2E cleanup.')
    }

    return createClient(supabaseUrl, serviceRoleKey)
}

async function listAllUsers(supabaseAdmin) {
    const allUsers = []
    let page = 1
    const perPage = 200

    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage,
        })

        if (error) {
            throw error
        }

        const users = data?.users ?? []
        allUsers.push(...users)

        if (users.length < perPage) {
            break
        }

        page += 1
    }

    return allUsers
}

export async function cleanupTestUsers() {
    const supabaseAdmin = getSupabaseAdminClient()
    const users = await listAllUsers(supabaseAdmin)

    const testUsers = users.filter((user) => {
        const email = (user.email ?? '').toLowerCase()
        return email.startsWith(TEST_EMAIL_PREFIX)
    })

    if (!testUsers.length) {
        console.log('[e2e-cleanup] No test users found.')
        return
    }

    for (const user of testUsers) {
        const email = user.email ?? user.id

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (error) {
            console.error(`[e2e-cleanup] Failed to delete ${email}: ${error.message}`)
            continue
        }

        console.log(`[e2e-cleanup] Deleted ${email}`)
    }
}