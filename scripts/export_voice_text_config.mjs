import { PHRASE_CUE_TEXT, SINGLE_KEY_SPOKEN_LABELS } from '../src/game/content/guidanceConfig.js'

process.stdout.write(
    JSON.stringify({
        phraseCueText: PHRASE_CUE_TEXT,
        singleKeyLabels: SINGLE_KEY_SPOKEN_LABELS,
    }),
)
