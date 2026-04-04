import { singleKeyEngine } from './singleKeyEngine'
import { promptEngine } from './promptEngine'
import { wordPowerEngine } from './wordPowerEngine'

export function getLessonEngine(level) {
    if (level.playMode === 'wordPowers') {
        return wordPowerEngine
    }

    if (level.promptPool?.length) {
        return promptEngine
    }

    return singleKeyEngine
}