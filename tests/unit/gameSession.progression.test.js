import { describe, expect, it } from 'vitest'
import {
  createInitialGameSession,
  getHighestUnlockedLevelIndex,
} from '../../src/game/session/gameSession'
import { LEVELS } from '../../src/game/content/levels'

describe('gameSession progression loading', () => {
  it('starts at the first level not yet completed', () => {
    const bestTimesByLevelId = {
      [LEVELS[0].id]: 1200,
      [LEVELS[1].id]: 1300,
      [LEVELS[2].id]: 1400,
    }

    const initialSession = createInitialGameSession('Player', bestTimesByLevelId)

    expect(initialSession.levelIndex).toBe(3)
  })

  it('keeps players on the last level when all levels are completed', () => {
    const allBestTimes = Object.fromEntries(
      LEVELS.map((level, index) => [level.id, (index + 1) * 1000]),
    )

    expect(getHighestUnlockedLevelIndex(allBestTimes)).toBe(LEVELS.length - 1)
  })

  it('does not unlock skipped levels from non-contiguous completions', () => {
    const bestTimesByLevelId = {
      [LEVELS[0].id]: 1000,
      [LEVELS[2].id]: 2000,
    }

    expect(getHighestUnlockedLevelIndex(bestTimesByLevelId)).toBe(1)
  })
})
