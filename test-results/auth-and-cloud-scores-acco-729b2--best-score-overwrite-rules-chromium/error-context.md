# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-and-cloud-scores.spec.js >> account auth, nickname, cloud save, cloud fetch, and best-score overwrite rules
- Location: tests/e2e/auth-and-cloud-scores.spec.js:15:1

# Error details

```
Error: Unsupported visible target label: "SPACE"
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - main [active] [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button "Open my leaderboard" [ref=e8] [cursor=pointer]:
          - img
        - generic [ref=e9]:
          - generic [ref=e10]: Player-c18048
          - generic [ref=e11]: Thumb · 2/5
      - generic [ref=e12]:
        - generic "World 1" [ref=e13]:
          - button "🏠 Basics" [ref=e14] [cursor=pointer]:
            - generic [ref=e15]: 🏠
            - generic [ref=e16]: Basics
          - button "🖐️ Fingers" [disabled] [ref=e17]:
            - generic [ref=e18]: 🖐️
            - generic [ref=e19]: Fingers
          - button "📖 Words" [disabled] [ref=e20]:
            - generic [ref=e21]: 📖
            - generic [ref=e22]: Words
          - button "✨ Power Keys" [disabled] [ref=e23]:
            - generic [ref=e24]: ✨
            - generic [ref=e25]: Power Keys
          - button "📝 Word Powers" [disabled] [ref=e26]:
            - generic [ref=e27]: 📝
            - generic [ref=e28]: Word Powers
        - generic "Level 2 of 5" [ref=e29]:
          - generic [ref=e30]:
            - button "★" [ref=e31] [cursor=pointer]
            - button [ref=e33] [cursor=pointer]
            - button [disabled] [ref=e35]
            - button [disabled] [ref=e37]
            - button [disabled] [ref=e39]
      - generic [ref=e40]:
        - generic [ref=e41]: ⏱ 0.2s
        - generic [ref=e42]: 🔥 2 · Max 2
    - generic [ref=e43]:
      - generic: Tap SPACE
    - generic [ref=e45]:
      - generic: Awesome!
      - generic [ref=e46]: SPACE
    - generic [ref=e47]:
      - generic [ref=e48]: SPACE
      - generic [ref=e49]: K
      - generic [ref=e50]: L
      - generic [ref=e51]: D
      - generic [ref=e52]: K
    - generic: ⭐
  - generic [ref=e54]:
    - generic [ref=e55]:
      - generic [ref=e57]: Q
      - generic [ref=e59]: W
      - generic [ref=e61]: E
      - generic [ref=e63]: R
      - generic [ref=e65]: T
      - generic [ref=e67]: "Y"
      - generic [ref=e69]: U
      - generic [ref=e71]: I
      - generic [ref=e73]: O
      - generic [ref=e75]: P
    - generic [ref=e76]:
      - generic [ref=e78]: A
      - generic [ref=e80]: S
      - generic [ref=e82]: D
      - generic [ref=e84]: F
      - generic [ref=e86]: G
      - generic [ref=e88]: H
      - generic [ref=e90]: J
      - generic [ref=e92]: K
      - generic [ref=e94]: L
      - generic [ref=e96]: ;
    - generic [ref=e97]:
      - generic [ref=e99]: Z
      - generic [ref=e101]: X
      - generic [ref=e103]: C
      - generic [ref=e105]: V
      - generic [ref=e107]: B
      - generic [ref=e109]: "N"
      - generic [ref=e111]: M
      - generic [ref=e113]: ","
      - generic [ref=e115]: .
      - generic [ref=e117]: /
    - generic [ref=e118]:
      - generic [ref=e120]: CTRL
      - generic [ref=e122]: SPACE
```

# Test source

```ts
  46  |     await authForm.getByRole('textbox', { name: 'Email' }).fill(email)
  47  |     await authForm.getByLabel('Password').fill(password)
  48  |     await authForm.getByRole('button', { name: 'Sign in' }).click()
  49  | }
  50  | 
  51  | export async function saveNicknameAndEnterGame(page, nickname) {
  52  |     const nicknameInput = page.getByRole('textbox', { name: 'Nickname' })
  53  | 
  54  |     await expect(nicknameInput).toBeVisible()
  55  |     await nicknameInput.fill(nickname)
  56  |     await page.getByRole('button', { name: 'Save nickname and play' }).click()
  57  |     await expect(page.getByRole('button', { name: /leaderboard/i })).toBeVisible()
  58  | }
  59  | 
  60  | export async function waitForGame(page) {
  61  |     await expect(page.getByRole('button', { name: /leaderboard/i })).toBeVisible()
  62  | }
  63  | 
  64  | export async function openScoreboard(page) {
  65  |     await page.getByRole('button', { name: /leaderboard/i }).click()
  66  | 
  67  |     const dialog = page.locator('.leaderboard-modal')
  68  |     await expect(dialog).toBeVisible()
  69  |     await expect(dialog.getByRole('heading', { name: 'Scoreboard' })).toBeVisible()
  70  |     await expect(dialog.getByRole('button', { name: 'My Bests' })).toBeVisible()
  71  |     await expect(dialog.getByRole('button', { name: 'Global' })).toBeVisible()
  72  | 
  73  |     return dialog
  74  | }
  75  | 
  76  | export async function closeScoreboard(page) {
  77  |     const dialog = page.locator('.leaderboard-modal')
  78  | 
  79  |     await expect(dialog).toBeVisible()
  80  |     await dialog.locator('.leaderboard-close').click()
  81  |     await expect(dialog).toBeHidden()
  82  | }
  83  | 
  84  | export async function switchScoreboardToMyBests(page) {
  85  |     const dialog = page.locator('.leaderboard-modal')
  86  |     await dialog.getByRole('button', { name: 'My Bests' }).click()
  87  |     await expect(dialog.getByRole('button', { name: 'My Bests' })).toHaveClass(/active/)
  88  | }
  89  | 
  90  | export async function switchScoreboardToGlobal(page) {
  91  |     const dialog = page.locator('.leaderboard-modal')
  92  |     await dialog.getByRole('button', { name: 'Global' }).click()
  93  |     await expect(dialog.getByRole('button', { name: 'Global' })).toHaveClass(/active/)
  94  | }
  95  | 
  96  | export async function readBasicsWorldLevel1BestSeconds(page) {
  97  |     const dialog = page.locator('.leaderboard-modal')
  98  |     const basicsSection = dialog
  99  |         .locator('.leaderboard-world-section')
  100 |         .filter({ hasText: 'Basics World' })
  101 |         .first()
  102 | 
  103 |     const levelOneRow = basicsSection
  104 |         .locator('.leaderboard-level-row')
  105 |         .filter({ hasText: 'Level 1' })
  106 |         .first()
  107 | 
  108 |     const value = (await levelOneRow.locator('.leaderboard-level-time').innerText()).trim()
  109 | 
  110 |     const match = value.match(/(\d+(?:\.\d+)?)s/)
  111 |     if (!match) {
  112 |         throw new Error(`Could not parse best time from "${value}"`)
  113 |     }
  114 | 
  115 |     return Number(match[1])
  116 | }
  117 | 
  118 | export async function completeCurrentLevel(
  119 |     page,
  120 |     {
  121 |         startDelayMs = 0,
  122 |         stepDelayMs = 20,
  123 |         maxSteps = 120,
  124 |     } = {},
  125 | ) {
  126 |     const nextLevelButton = page.getByRole('button', { name: 'Next level' })
  127 | 
  128 |     if (startDelayMs > 0) {
  129 |         await page.waitForTimeout(startDelayMs)
  130 |     }
  131 | 
  132 |     for (let index = 0; index < maxSteps; index += 1) {
  133 |         if (await nextLevelButton.isVisible().catch(() => false)) {
  134 |             return
  135 |         }
  136 | 
  137 |         const label = (await page.locator('.big-target').innerText()).trim()
  138 | 
  139 |         if (!label) {
  140 |             await page.waitForTimeout(50)
  141 |             continue
  142 |         }
  143 | 
  144 |         const key = DISPLAY_TO_KEY[label]
  145 |         if (!key) {
> 146 |             throw new Error(`Unsupported visible target label: "${label}"`)
      |                   ^ Error: Unsupported visible target label: "SPACE"
  147 |         }
  148 | 
  149 |         await page.keyboard.press(key)
  150 | 
  151 |         if (stepDelayMs > 0) {
  152 |             await page.waitForTimeout(stepDelayMs)
  153 |         }
  154 |     }
  155 | 
  156 |     await expect(nextLevelButton).toBeVisible()
  157 | }
```