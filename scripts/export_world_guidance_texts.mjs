import { collectGuidanceRowTextsForWorld } from '../src/game/content/guidanceTextCatalog.js'

function parseArgs(argv) {
    const options = {
        world: 1,
        tapOnly: false,
    }

    argv.forEach((arg) => {
        if (arg === '--tap-only') {
            options.tapOnly = true
            return
        }

        const world = Number.parseInt(arg, 10)
        if (!Number.isInteger(world) || world <= 0) {
            throw new Error('Usage: node scripts/export_world_guidance_texts.mjs <world-number> [--tap-only]')
        }

        options.world = world
    })

    return options
}

try {
    const options = parseArgs(process.argv.slice(2))
    const texts = collectGuidanceRowTextsForWorld(options.world)
        .filter((text) => (options.tapOnly ? text.startsWith('Tap ') : true))

    process.stdout.write(JSON.stringify(texts, null, 2))
} catch (error) {
    console.error(error.message)
    process.exit(1)
}
