import { cleanupTestUsers } from './admin/cleanupTestUsers.js'

export default async function globalSetup() {
    await cleanupTestUsers()
}