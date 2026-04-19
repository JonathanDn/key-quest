import { collectGuidanceRowTexts } from '../src/game/content/guidanceTextCatalog.js'

const texts = collectGuidanceRowTexts()
process.stdout.write(JSON.stringify(texts))
