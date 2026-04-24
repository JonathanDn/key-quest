import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { buildSynthesisRequestData } from './world1AudioGeneration.js'

const FISH_AUDIO_TTS_URL = 'https://api.fish.audio/v1/tts'
const SARAH_MODEL_ID = '933563129e564b19a115bedd57b7406a'
const TAP_SEMICOLON_TEXT = 'Tap semicolon'
const DEFAULT_FORMAT = 'wav'
const DEFAULT_SEED = 42
const DEFAULT_OUTPUT = `./tmp/tap-semicolon-sarah.${DEFAULT_FORMAT}`

function parseArgs(argv) {
    const options = {
        apiKey: process.env.FISH_AUDIO_API_KEY || process.env.FISH_SPEECH_API_KEY || null,
        output: DEFAULT_OUTPUT,
        format: DEFAULT_FORMAT,
        seed: DEFAULT_SEED,
        dryRun: false,
    }

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        const value = argv[i + 1]

        if (arg === '--help' || arg === '-h') {
            options.help = true
            continue
        }

        if (arg === '--api-key') {
            options.apiKey = value
            i += 1
            continue
        }

        if (arg === '--output') {
            options.output = value
            i += 1
            continue
        }

        if (arg === '--format') {
            options.format = value
            i += 1
            continue
        }

        if (arg === '--seed') {
            options.seed = Number(value)
            i += 1
            continue
        }

        if (arg === '--dry-run') {
            options.dryRun = true
            continue
        }

        throw new Error(`Unknown argument: ${arg}`)
    }

    return options
}

function printHelp() {
    console.log(`Generate one Sarah clip for "Tap semicolon".

Usage:
  npm run generate:tap-semicolon -- [options]

Behavior:
  - Uses Fish Audio cloud endpoint: ${FISH_AUDIO_TTS_URL}
  - Uses Sarah model ID: ${SARAH_MODEL_ID}
  - Uses text: "${TAP_SEMICOLON_TEXT}"

Options:
  --api-key <token>    Fish Audio API key (or set FISH_AUDIO_API_KEY).
  --output <path>      Output file path. Default: ./tmp/tap-semicolon-sarah.wav
  --format <fmt>       wav | mp3 | opus | pcm. Default: wav
  --seed <number>      Deterministic seed. Default: 42
  --dry-run            Print request settings only.
  --help, -h           Show this help text.
`)
}

async function main() {
    const options = parseArgs(process.argv.slice(2))

    if (options.help) {
        printHelp()
        return
    }

    if (!options.apiKey && !options.dryRun) {
        throw new Error('Missing API key. Set FISH_AUDIO_API_KEY or pass --api-key.')
    }

    if (!Number.isFinite(options.seed)) {
        throw new Error('seed must be a number')
    }

    if (!['wav', 'mp3', 'opus', 'pcm'].includes(options.format)) {
        throw new Error(`Unsupported format: ${options.format}`)
    }

    const payload = buildSynthesisRequestData({
        referenceId: SARAH_MODEL_ID,
        format: options.format,
        text: TAP_SEMICOLON_TEXT,
        seed: options.seed,
    })

    const outputPath = path.resolve(options.output)

    console.log(`POST ${FISH_AUDIO_TTS_URL}`)
    console.log(`reference_id: ${SARAH_MODEL_ID}`)
    console.log(`text: ${TAP_SEMICOLON_TEXT}`)
    console.log(`output: ${outputPath}`)

    if (options.dryRun) {
        return
    }

    const response = await fetch(FISH_AUDIO_TTS_URL, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${options.apiKey}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const detail = await response.text()
        throw new Error(`TTS request failed: ${response.status} ${detail}`)
    }

    const audio = Buffer.from(await response.arrayBuffer())
    if (!audio.length) {
        throw new Error('TTS request returned empty audio')
    }

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, audio)

    console.log(`Saved ${audio.length} bytes to ${outputPath}`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
