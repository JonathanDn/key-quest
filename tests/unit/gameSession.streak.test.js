import { describe, expect, it } from 'vitest'
import {
  createInitialGameSession,
  gameSessionReducer,
} from '../../src/game/session/gameSession'

describe('gameSession streak tracking', () => {
  it('increments streak on successful key presses', () => {
    let state = createInitialGameSession('Player')

    const firstTargetCode = state.round[0].code
    state = gameSessionReducer(state, {
      type: 'KEY_DOWN',
      normalizedCode: firstTargetCode,
      praise: 'Nice!',
    })

    expect(state.successStreak).toBe(1)
    expect(state.bestSuccessStreak).toBe(1)
  })

  it('resets streak on failed key press and keeps best streak', () => {
    let state = createInitialGameSession('Player')

    const firstTargetCode = state.round[0].code
    state = gameSessionReducer(state, {
      type: 'KEY_DOWN',
      normalizedCode: firstTargetCode,
      praise: 'Nice!',
    })

    state = gameSessionReducer(state, {
      type: 'KEY_DOWN',
      normalizedCode: 'KeyQ',
      praise: 'Nice!',
    })

    expect(state.successStreak).toBe(0)
    expect(state.bestSuccessStreak).toBe(1)
  })
})
