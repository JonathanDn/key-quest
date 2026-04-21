import { collectGuidanceRowTextsForWorld } from '../src/game/content/guidanceTextCatalog.js'

const worldArg = process.argv[2]
const world = Number.parseInt(worldArg ?? '1', 10)

if (!Number.isInteger(world) || world <= 0) {
    console.error('Usage: node scripts/export_world_guidance_texts.mjs <world-number>')
    process.exit(1)
}

const texts = collectGuidanceRowTextsForWorld(world)
process.stdout.write(JSON.stringify(texts, null, 2))
