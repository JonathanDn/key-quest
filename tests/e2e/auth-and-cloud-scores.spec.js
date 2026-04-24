import { test, expect } from '@playwright/test'
import {
    closeScoreboard,
    completeCurrentLevel,
    editNicknameInGame,
    makeTestUser,
    openScoreboard,
    readBasicsWorldLevel1BestSeconds,
    readBasicsWorldLevel1GlobalPreview,
    saveNicknameAndEnterGame,
    signIn,
    signUp,
    switchScoreboardToGlobal,
    switchScoreboardToMyBests,
    waitForGame,
} from './keyQuest.helpers'

test('account auth, nickname, cloud save, cloud fetch, and best-score overwrite rules', async ({ page }) => {
    const user = makeTestUser()

    await signUp(page, user)
    await saveNicknameAndEnterGame(page, user.nickname)

    await completeCurrentLevel(page, { stepDelayMs: 220 })

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const firstBest = await readBasicsWorldLevel1BestSeconds(page)
    expect(firstBest).toBeGreaterThan(0)
    await closeScoreboard(page)

    await page.reload()
    await waitForGame(page)

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const pulledAfterRefresh = await readBasicsWorldLevel1BestSeconds(page)
    expect(pulledAfterRefresh).toBe(firstBest)
    await closeScoreboard(page)

    await completeCurrentLevel(page, { stepDelayMs: 15 })

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const improvedBest = await readBasicsWorldLevel1BestSeconds(page)
    expect(improvedBest).toBeLessThan(firstBest)
    await closeScoreboard(page)

    await page.reload()
    await waitForGame(page)

    await completeCurrentLevel(page, { stepDelayMs: 220 })

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const afterWorseReplay = await readBasicsWorldLevel1BestSeconds(page)
    expect(afterWorseReplay).toBe(improvedBest)
    await closeScoreboard(page)
})

test('returning signed-in user restores session and skips auth/nickname screens', async ({ page }) => {
    const user = makeTestUser()

    await signUp(page, user)
    await saveNicknameAndEnterGame(page, user.nickname)

    await page.reload()

    await waitForGame(page)
    await expect(page.getByLabel('Email')).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveCount(0)

    await openScoreboard(page)
    await closeScoreboard(page)
})

test('existing account can sign in again and resume from cloud state', async ({ page, context }) => {
    const user = makeTestUser()

    await signUp(page, user)
    await saveNicknameAndEnterGame(page, user.nickname)
    await completeCurrentLevel(page, { stepDelayMs: 180 })

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const originalBest = await readBasicsWorldLevel1BestSeconds(page)
    await closeScoreboard(page)

    await context.clearCookies()
    await page.evaluate(() => {
        window.localStorage.clear()
        window.sessionStorage.clear()
    })

    await signIn(page, user)
    await waitForGame(page)

    await openScoreboard(page)
    await switchScoreboardToMyBests(page)
    const pulledBest = await readBasicsWorldLevel1BestSeconds(page)
    expect(pulledBest).toBe(originalBest)
    await closeScoreboard(page)
})

test('editing nickname in game updates profile and global best-score nickname', async ({ page }) => {
    const user = makeTestUser()
    const renamedNickname = `${user.nickname}-Renamed`

    await signUp(page, user)
    await saveNicknameAndEnterGame(page, user.nickname)
    await completeCurrentLevel(page, { stepDelayMs: 200 })

    await openScoreboard(page)
    await switchScoreboardToGlobal(page)
    const oldGlobalPreview = await readBasicsWorldLevel1GlobalPreview(page)
    await closeScoreboard(page)

    await editNicknameInGame(page, renamedNickname)

    await openScoreboard(page)
    await switchScoreboardToGlobal(page)
    const renamedGlobalPreview = await readBasicsWorldLevel1GlobalPreview(page)
    if (oldGlobalPreview.includes(user.nickname)) {
        expect(renamedGlobalPreview).toContain(renamedNickname)
        expect(renamedGlobalPreview).not.toContain(user.nickname)
    } else {
        expect(renamedGlobalPreview.length).toBeGreaterThan(0)
    }
    await closeScoreboard(page)

    await page.reload()
    await waitForGame(page)
    await expect(page.getByText(renamedNickname)).toBeVisible()

    await openScoreboard(page)
    await switchScoreboardToGlobal(page)
    const renamedAfterReload = await readBasicsWorldLevel1GlobalPreview(page)
    if (oldGlobalPreview.includes(user.nickname)) {
        expect(renamedAfterReload).toContain(renamedNickname)
    } else {
        expect(renamedAfterReload.length).toBeGreaterThan(0)
    }
    await closeScoreboard(page)
})
