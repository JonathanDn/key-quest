# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-and-cloud-scores.spec.js >> account auth, nickname, cloud save, cloud fetch, and best-score overwrite rules
- Location: tests/e2e/auth-and-cloud-scores.spec.js:18:1

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
        - generic [ref=e8]:
          - button "Open my leaderboard" [ref=e9] [cursor=pointer]:
            - img
          - button "Open settings" [ref=e10] [cursor=pointer]:
            - generic [ref=e11]: ⚙️
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]: Player-d66aaa
            - button "Edit nickname" [ref=e15] [cursor=pointer]: ✏️
          - generic [ref=e16]: Thumb · 2/5
      - generic [ref=e17]:
        - generic "World 1" [ref=e18]:
          - button "🏠 Basics" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 🏠
            - generic [ref=e21]: Basics
          - button "🖐️ Fingers" [disabled] [ref=e22]:
            - generic [ref=e23]: 🖐️
            - generic [ref=e24]: Fingers
          - button "📖 Words" [disabled] [ref=e25]:
            - generic [ref=e26]: 📖
            - generic [ref=e27]: Words
          - button "✨ Power Keys" [disabled] [ref=e28]:
            - generic [ref=e29]: ✨
            - generic [ref=e30]: Power Keys
          - button "📝 Word Powers" [disabled] [ref=e31]:
            - generic [ref=e32]: 📝
            - generic [ref=e33]: Word Powers
        - generic "Level 2 of 5" [ref=e34]:
          - generic [ref=e35]:
            - button "★" [ref=e36] [cursor=pointer]
            - button [ref=e38] [cursor=pointer]
            - button [disabled] [ref=e40]
            - button [disabled] [ref=e42]
            - button [disabled] [ref=e44]
      - generic [ref=e45]:
        - generic [ref=e46]: ⏱ 0.0s
        - generic [ref=e47]: 🔥 0
    - generic [ref=e48]:
      - generic: Tap SPACE
    - generic [ref=e51]: SPACE
    - generic [ref=e52]:
      - generic [ref=e53]: SPACE
      - generic [ref=e54]: S
      - generic [ref=e55]: J
      - generic [ref=e56]: L
      - generic [ref=e57]: ;
  - generic [ref=e59]:
    - generic [ref=e60]:
      - generic [ref=e62]: Q
      - generic [ref=e64]: W
      - generic [ref=e66]: E
      - generic [ref=e68]: R
      - generic [ref=e70]: T
      - generic [ref=e72]: "Y"
      - generic [ref=e74]: U
      - generic [ref=e76]: I
      - generic [ref=e78]: O
      - generic [ref=e80]: P
    - generic [ref=e81]:
      - generic [ref=e83]: A
      - generic [ref=e85]: S
      - generic [ref=e87]: D
      - generic [ref=e89]: F
      - generic [ref=e91]: G
      - generic [ref=e93]: H
      - generic [ref=e95]: J
      - generic [ref=e97]: K
      - generic [ref=e99]: L
      - generic [ref=e101]: ;
    - generic [ref=e102]:
      - generic [ref=e104]: Z
      - generic [ref=e106]: X
      - generic [ref=e108]: C
      - generic [ref=e110]: V
      - generic [ref=e112]: B
      - generic [ref=e114]: "N"
      - generic [ref=e116]: M
      - generic [ref=e118]: ","
      - generic [ref=e120]: .
      - generic [ref=e122]: /
    - generic [ref=e123]:
      - generic [ref=e125]: CTRL
      - generic [ref=e127]: SPACE
```

# Test source

```ts
  70  |     await expect(page.getByText(nickname)).toBeVisible()
  71  | }
  72  | 
  73  | export async function openScoreboard(page) {
  74  |     await page.getByRole('button', { name: /leaderboard/i }).click()
  75  | 
  76  |     const dialog = page.locator('.leaderboard-modal')
  77  |     await expect(dialog).toBeVisible()
  78  |     await expect(dialog.getByRole('heading', { name: 'Scoreboard' })).toBeVisible()
  79  |     await expect(dialog.getByRole('button', { name: 'My Bests' })).toBeVisible()
  80  |     await expect(dialog.getByRole('button', { name: 'Global' })).toBeVisible()
  81  | 
  82  |     return dialog
  83  | }
  84  | 
  85  | export async function closeScoreboard(page) {
  86  |     const dialog = page.locator('.leaderboard-modal')
  87  | 
  88  |     await expect(dialog).toBeVisible()
  89  |     await dialog.locator('.leaderboard-close').click()
  90  |     await expect(dialog).toBeHidden()
  91  | }
  92  | 
  93  | export async function switchScoreboardToMyBests(page) {
  94  |     const dialog = page.locator('.leaderboard-modal')
  95  |     await dialog.getByRole('button', { name: 'My Bests' }).click()
  96  |     await expect(dialog.getByRole('button', { name: 'My Bests' })).toHaveClass(/active/)
  97  | }
  98  | 
  99  | export async function switchScoreboardToGlobal(page) {
  100 |     const dialog = page.locator('.leaderboard-modal')
  101 |     await dialog.getByRole('button', { name: 'Global' }).click()
  102 |     await expect(dialog.getByRole('button', { name: 'Global' })).toHaveClass(/active/)
  103 | }
  104 | 
  105 | export async function readBasicsWorldLevel1BestSeconds(page) {
  106 |     const dialog = page.locator('.leaderboard-modal')
  107 |     const basicsSection = dialog
  108 |         .locator('.leaderboard-world-section')
  109 |         .filter({ hasText: 'Basics World' })
  110 |         .first()
  111 | 
  112 |     const levelOneRow = basicsSection
  113 |         .locator('.leaderboard-level-row')
  114 |         .filter({ hasText: 'Level 1' })
  115 |         .first()
  116 | 
  117 |     const value = (await levelOneRow.locator('.leaderboard-level-time').innerText()).trim()
  118 | 
  119 |     const match = value.match(/(\d+(?:\.\d+)?)s/)
  120 |     if (!match) {
  121 |         throw new Error(`Could not parse best time from "${value}"`)
  122 |     }
  123 | 
  124 |     return Number(match[1])
  125 | }
  126 | 
  127 | export async function readBasicsWorldLevel1GlobalPreview(page) {
  128 |     const dialog = page.locator('.leaderboard-modal')
  129 |     const basicsSection = dialog
  130 |         .locator('.leaderboard-world-section')
  131 |         .filter({ hasText: 'Basics World' })
  132 |         .first()
  133 | 
  134 |     const levelOneRow = basicsSection
  135 |         .locator('.leaderboard-level-row')
  136 |         .filter({ hasText: 'Level 1' })
  137 |         .first()
  138 | 
  139 |     return (await levelOneRow.locator('.leaderboard-global-static-value').innerText()).trim()
  140 | }
  141 | 
  142 | export async function completeCurrentLevel(
  143 |     page,
  144 |     {
  145 |         startDelayMs = 0,
  146 |         stepDelayMs = 20,
  147 |         maxSteps = 120,
  148 |     } = {},
  149 | ) {
  150 |     const nextLevelButton = page.getByRole('button', { name: 'Next level' })
  151 | 
  152 |     if (startDelayMs > 0) {
  153 |         await page.waitForTimeout(startDelayMs)
  154 |     }
  155 | 
  156 |     for (let index = 0; index < maxSteps; index += 1) {
  157 |         if (await nextLevelButton.isVisible().catch(() => false)) {
  158 |             return
  159 |         }
  160 | 
  161 |         const label = (await page.locator('.big-target').innerText()).trim()
  162 | 
  163 |         if (!label) {
  164 |             await page.waitForTimeout(50)
  165 |             continue
  166 |         }
  167 | 
  168 |         const key = DISPLAY_TO_KEY[label]
  169 |         if (!key) {
> 170 |             throw new Error(`Unsupported visible target label: "${label}"`)
      |                   ^ Error: Unsupported visible target label: "SPACE"
  171 |         }
  172 | 
  173 |         await page.keyboard.press(key)
  174 | 
  175 |         if (stepDelayMs > 0) {
  176 |             await page.waitForTimeout(stepDelayMs)
  177 |         }
  178 |     }
  179 | 
  180 |     await expect(nextLevelButton).toBeVisible()
  181 | }
  182 | 
```