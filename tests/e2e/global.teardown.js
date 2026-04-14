import { cleanupTestUsers } from './admin/cleanupTestUsers.js'

export default async function globalTeardown() {
    await cleanupTestUsers()
}

if (import.meta.url === `file://${process.argv[1]}`) {
    globalTeardown().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}