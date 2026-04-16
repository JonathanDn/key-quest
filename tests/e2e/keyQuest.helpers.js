import { expect } from '@playwright/test'

const DISPLAY_TO_KEY = {
    A: 'a',
    S: 's',
    D: 'd',
    F: 'f',
    J: 'j',
    K: 'k',
    L: 'l',
    ';': ';',
}

export function makeTestUser() {
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    return {
        email: `keyquest-e2e-${stamp}@example.com`,
        password: 'KeyQuestPass123!',
        nickname: `Player-${stamp.slice(-6)}`,
    }
}

export async function signUp(page, { email, password }) {
    await page.goto('/')

    await page
        .locator('.launch-auth-mode-row')
        .getByRole('button', { name: 'Create account' })
        .click()

    const authForm = page.locator('.launch-auth-form')
    await authForm.getByRole('textbox', { name: 'Email' }).fill(email)
    await authForm.getByLabel('Password').fill(password)
    await authForm.getByRole('button', { name: 'Create account' }).click()
}

export async function signIn(page, { email, password }) {
    await page.goto('/')

    await page
        .locator('.launch-auth-mode-row')
        .getByRole('button', { name: 'Sign in' })
        .click()

    const authForm = page.locator('.launch-auth-form')
    await authForm.getByRole('textbox', { name: 'Email' }).fill(email)
    await authForm.getByLabel('Password').fill(password)
    await authForm.getByRole('button', { name: 'Sign in' }).click()
}

export async function saveNicknameAndEnterGame(page, nickname) {
    const nicknameInput = page.getByRole('textbox', { name: 'Nickname' })

    await expect(nicknameInput).toBeVisible()
    await nicknameInput.fill(nickname)
    await page.getByRole('button', { name: 'Save nickname and play' }).click()
    await expect(page.getByRole('button', { name: /leaderboard/i })).toBeVisible()
}

export async function waitForGame(page) {
    await expect(page.getByRole('button', { name: /leaderboard/i })).toBeVisible()
}

export async function editNicknameInGame(page, nickname) {
    await page.getByRole('button', { name: 'Edit' }).click()
    const nicknameInput = page.getByRole('textbox', { name: 'Nickname' })
    await expect(nicknameInput).toBeVisible()
    await nicknameInput.fill(nickname)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(nickname)).toBeVisible()
}

export async function openScoreboard(page) {
    await page.getByRole('button', { name: /leaderboard/i }).click()

    const dialog = page.locator('.leaderboard-modal')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Scoreboard' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'My Bests' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Global' })).toBeVisible()

    return dialog
}

export async function closeScoreboard(page) {
    const dialog = page.locator('.leaderboard-modal')

    await expect(dialog).toBeVisible()
    await dialog.locator('.leaderboard-close').click()
    await expect(dialog).toBeHidden()
}

export async function switchScoreboardToMyBests(page) {
    const dialog = page.locator('.leaderboard-modal')
    await dialog.getByRole('button', { name: 'My Bests' }).click()
    await expect(dialog.getByRole('button', { name: 'My Bests' })).toHaveClass(/active/)
}

export async function switchScoreboardToGlobal(page) {
    const dialog = page.locator('.leaderboard-modal')
    await dialog.getByRole('button', { name: 'Global' }).click()
    await expect(dialog.getByRole('button', { name: 'Global' })).toHaveClass(/active/)
}

export async function readBasicsWorldLevel1BestSeconds(page) {
    const dialog = page.locator('.leaderboard-modal')
    const basicsSection = dialog
        .locator('.leaderboard-world-section')
        .filter({ hasText: 'Basics World' })
        .first()

    const levelOneRow = basicsSection
        .locator('.leaderboard-level-row')
        .filter({ hasText: 'Level 1' })
        .first()

    const value = (await levelOneRow.locator('.leaderboard-level-time').innerText()).trim()

    const match = value.match(/(\d+(?:\.\d+)?)s/)
    if (!match) {
        throw new Error(`Could not parse best time from "${value}"`)
    }

    return Number(match[1])
}

export async function readBasicsWorldLevel1GlobalPreview(page) {
    const dialog = page.locator('.leaderboard-modal')
    const basicsSection = dialog
        .locator('.leaderboard-world-section')
        .filter({ hasText: 'Basics World' })
        .first()

    const levelOneRow = basicsSection
        .locator('.leaderboard-level-row')
        .filter({ hasText: 'Level 1' })
        .first()

    return (await levelOneRow.locator('.leaderboard-global-static-value').innerText()).trim()
}

export async function completeCurrentLevel(
    page,
    {
        startDelayMs = 0,
        stepDelayMs = 20,
        maxSteps = 120,
    } = {},
) {
    const nextLevelButton = page.getByRole('button', { name: 'Next level' })

    if (startDelayMs > 0) {
        await page.waitForTimeout(startDelayMs)
    }

    for (let index = 0; index < maxSteps; index += 1) {
        if (await nextLevelButton.isVisible().catch(() => false)) {
            return
        }

        const label = (await page.locator('.big-target').innerText()).trim()

        if (!label) {
            await page.waitForTimeout(50)
            continue
        }

        const key = DISPLAY_TO_KEY[label]
        if (!key) {
            throw new Error(`Unsupported visible target label: "${label}"`)
        }

        await page.keyboard.press(key)

        if (stepDelayMs > 0) {
            await page.waitForTimeout(stepDelayMs)
        }
    }

    await expect(nextLevelButton).toBeVisible()
}
