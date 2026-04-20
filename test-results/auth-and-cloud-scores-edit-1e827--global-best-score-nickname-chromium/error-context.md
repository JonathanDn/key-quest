# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-and-cloud-scores.spec.js >> editing nickname in game updates profile and global best-score nickname
- Location: tests/e2e/auth-and-cloud-scores.spec.js:105:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Player-40e5c7"
Received string:    "Player-792aaa · 1.8s"
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - button "Close my leaderboard" [pressed] [ref=e9] [cursor=pointer]:
            - img
          - button "Open settings" [ref=e10] [cursor=pointer]:
            - generic [ref=e11]: ⚙️
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]: Player-40e5c7
            - button "Edit nickname" [ref=e15] [cursor=pointer]: ✏️
          - generic [ref=e16]: Home · 1/5
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
        - generic "Level 1 of 5" [ref=e34]:
          - generic [ref=e35]:
            - button [ref=e36] [cursor=pointer]
            - button [ref=e38] [cursor=pointer]
            - button [disabled] [ref=e40]
            - button [disabled] [ref=e42]
            - button [disabled] [ref=e44]
      - generic [ref=e45]:
        - generic [ref=e46]: ⏱ 1.9s · Best 1.9s
        - generic [ref=e47]: 🔥 10 · Max 10
    - dialog "Scoreboard" [ref=e49]:
      - generic [ref=e50]:
        - generic [ref=e51]:
          - heading "Scoreboard" [level=2] [ref=e52]
          - paragraph [ref=e53]: Private bests and global rankings
        - button "Close my leaderboard" [ref=e54] [cursor=pointer]: ✕
      - generic [ref=e55]:
        - button "My Bests" [ref=e56] [cursor=pointer]
        - button "Global" [active] [ref=e57] [cursor=pointer]
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e62]: 🏠
              - generic [ref=e63]: Basics World
            - button "Collapse Basics World" [expanded] [ref=e65] [cursor=pointer]:
              - img [ref=e66]
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: Level 1
              - generic [ref=e71]: Player-792aaa · 1.8s
            - generic [ref=e72]:
              - generic [ref=e73]: Level 2
              - generic [ref=e74]: Pandadanda · 9.8s
            - generic [ref=e75]:
              - generic [ref=e76]: Level 3
              - generic [ref=e77]: Shiri D Queen · 6.3s
            - generic [ref=e78]:
              - generic [ref=e79]: Level 4
              - generic [ref=e80]: Pandadanda · 11.3s
            - generic [ref=e81]:
              - generic [ref=e82]: Level 5
              - generic [ref=e83]: Shiri D Queen · 4.0s
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]: 🖐️
            - generic [ref=e88]: Fingers World
          - img "Locked" [ref=e90]: 🔒
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: 📖
            - generic [ref=e95]: Words World
          - img "Locked" [ref=e97]: 🔒
        - generic [ref=e99]:
          - generic [ref=e100]:
            - generic [ref=e101]: ✨
            - generic [ref=e102]: Power Keys World
          - img "Locked" [ref=e104]: 🔒
        - generic [ref=e106]:
          - generic [ref=e107]:
            - generic [ref=e108]: 📝
            - generic [ref=e109]: Word Powers World
          - img "Locked" [ref=e111]: 🔒
    - generic [ref=e112]:
      - generic [ref=e113]:
        - generic: Yay!
        - generic [ref=e114]:
          - img
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - img [ref=e119]
            - generic [ref=e120]:
              - generic [ref=e121]: Level Clear!
              - generic [ref=e122]: See this run before you move on.
          - generic [ref=e123]: ✨ New best!
        - generic [ref=e124]:
          - generic [ref=e125]:
            - generic [ref=e126]: This run
            - generic [ref=e127]: 1.9s
          - generic [ref=e128]:
            - generic [ref=e129]: Best
            - generic [ref=e130]: 1.9s
        - generic [ref=e131]:
          - generic [ref=e132]: This session
          - generic [ref=e134]: 1.9s
        - button "Next level" [ref=e136] [cursor=pointer]
    - generic: ⭐
    - generic: ⭐
    - generic: ✨
    - generic: ⭐
  - generic [ref=e138]:
    - generic [ref=e139]:
      - generic [ref=e141]: Q
      - generic [ref=e143]: W
      - generic [ref=e145]: E
      - generic [ref=e147]: R
      - generic [ref=e149]: T
      - generic [ref=e151]: "Y"
      - generic [ref=e153]: U
      - generic [ref=e155]: I
      - generic [ref=e157]: O
      - generic [ref=e159]: P
    - generic [ref=e160]:
      - generic [ref=e162]: A
      - generic [ref=e164]: S
      - generic [ref=e166]: D
      - generic [ref=e168]: F
      - generic [ref=e170]: G
      - generic [ref=e172]: H
      - generic [ref=e174]: J
      - generic [ref=e176]: K
      - generic [ref=e178]: L
      - generic [ref=e180]: ;
    - generic [ref=e181]:
      - generic [ref=e183]: Z
      - generic [ref=e185]: X
      - generic [ref=e187]: C
      - generic [ref=e189]: V
      - generic [ref=e191]: B
      - generic [ref=e193]: "N"
      - generic [ref=e195]: M
      - generic [ref=e197]: ","
      - generic [ref=e199]: .
      - generic [ref=e201]: /
    - generic [ref=e202]:
      - generic [ref=e204]: CTRL
      - generic [ref=e206]: SPACE
```

# Test source

```ts
  16  | } from './keyQuest.helpers'
  17  | 
  18  | test('account auth, nickname, cloud save, cloud fetch, and best-score overwrite rules', async ({ page }) => {
  19  |     const user = makeTestUser()
  20  | 
  21  |     await signUp(page, user)
  22  |     await saveNicknameAndEnterGame(page, user.nickname)
  23  | 
  24  |     await completeCurrentLevel(page, { stepDelayMs: 220 })
  25  | 
  26  |     await openScoreboard(page)
  27  |     await switchScoreboardToMyBests(page)
  28  |     const firstBest = await readBasicsWorldLevel1BestSeconds(page)
  29  |     expect(firstBest).toBeGreaterThan(0)
  30  |     await closeScoreboard(page)
  31  | 
  32  |     await page.reload()
  33  |     await waitForGame(page)
  34  | 
  35  |     await openScoreboard(page)
  36  |     await switchScoreboardToMyBests(page)
  37  |     const pulledAfterRefresh = await readBasicsWorldLevel1BestSeconds(page)
  38  |     expect(pulledAfterRefresh).toBe(firstBest)
  39  |     await closeScoreboard(page)
  40  | 
  41  |     await completeCurrentLevel(page, { stepDelayMs: 15 })
  42  | 
  43  |     await openScoreboard(page)
  44  |     await switchScoreboardToMyBests(page)
  45  |     const improvedBest = await readBasicsWorldLevel1BestSeconds(page)
  46  |     expect(improvedBest).toBeLessThan(firstBest)
  47  |     await closeScoreboard(page)
  48  | 
  49  |     await page.reload()
  50  |     await waitForGame(page)
  51  | 
  52  |     await completeCurrentLevel(page, { stepDelayMs: 220 })
  53  | 
  54  |     await openScoreboard(page)
  55  |     await switchScoreboardToMyBests(page)
  56  |     const afterWorseReplay = await readBasicsWorldLevel1BestSeconds(page)
  57  |     expect(afterWorseReplay).toBe(improvedBest)
  58  |     await closeScoreboard(page)
  59  | })
  60  | 
  61  | test('returning signed-in user restores session and skips auth/nickname screens', async ({ page }) => {
  62  |     const user = makeTestUser()
  63  | 
  64  |     await signUp(page, user)
  65  |     await saveNicknameAndEnterGame(page, user.nickname)
  66  | 
  67  |     await page.reload()
  68  | 
  69  |     await waitForGame(page)
  70  |     await expect(page.getByLabel('Email')).toHaveCount(0)
  71  |     await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveCount(0)
  72  | 
  73  |     await openScoreboard(page)
  74  |     await closeScoreboard(page)
  75  | })
  76  | 
  77  | test('existing account can sign in again and resume from cloud state', async ({ page, context }) => {
  78  |     const user = makeTestUser()
  79  | 
  80  |     await signUp(page, user)
  81  |     await saveNicknameAndEnterGame(page, user.nickname)
  82  |     await completeCurrentLevel(page, { stepDelayMs: 180 })
  83  | 
  84  |     await openScoreboard(page)
  85  |     await switchScoreboardToMyBests(page)
  86  |     const originalBest = await readBasicsWorldLevel1BestSeconds(page)
  87  |     await closeScoreboard(page)
  88  | 
  89  |     await context.clearCookies()
  90  |     await page.evaluate(() => {
  91  |         window.localStorage.clear()
  92  |         window.sessionStorage.clear()
  93  |     })
  94  | 
  95  |     await signIn(page, user)
  96  |     await waitForGame(page)
  97  | 
  98  |     await openScoreboard(page)
  99  |     await switchScoreboardToMyBests(page)
  100 |     const pulledBest = await readBasicsWorldLevel1BestSeconds(page)
  101 |     expect(pulledBest).toBe(originalBest)
  102 |     await closeScoreboard(page)
  103 | })
  104 | 
  105 | test('editing nickname in game updates profile and global best-score nickname', async ({ page }) => {
  106 |     const user = makeTestUser()
  107 |     const renamedNickname = `${user.nickname}-Renamed`
  108 | 
  109 |     await signUp(page, user)
  110 |     await saveNicknameAndEnterGame(page, user.nickname)
  111 |     await completeCurrentLevel(page, { stepDelayMs: 200 })
  112 | 
  113 |     await openScoreboard(page)
  114 |     await switchScoreboardToGlobal(page)
  115 |     const oldGlobalPreview = await readBasicsWorldLevel1GlobalPreview(page)
> 116 |     expect(oldGlobalPreview).toContain(user.nickname)
      |                              ^ Error: expect(received).toContain(expected) // indexOf
  117 |     await closeScoreboard(page)
  118 | 
  119 |     await editNicknameInGame(page, renamedNickname)
  120 | 
  121 |     await openScoreboard(page)
  122 |     await switchScoreboardToGlobal(page)
  123 |     const renamedGlobalPreview = await readBasicsWorldLevel1GlobalPreview(page)
  124 |     expect(renamedGlobalPreview).toContain(renamedNickname)
  125 |     expect(renamedGlobalPreview).not.toContain(user.nickname)
  126 |     await closeScoreboard(page)
  127 | 
  128 |     await page.reload()
  129 |     await waitForGame(page)
  130 |     await expect(page.getByText(renamedNickname)).toBeVisible()
  131 | 
  132 |     await openScoreboard(page)
  133 |     await switchScoreboardToGlobal(page)
  134 |     const renamedAfterReload = await readBasicsWorldLevel1GlobalPreview(page)
  135 |     expect(renamedAfterReload).toContain(renamedNickname)
  136 |     await closeScoreboard(page)
  137 | })
  138 | 
```