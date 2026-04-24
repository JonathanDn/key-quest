import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { buildSynthesisRequestData } from './world1AudioGeneration.js'

const DEFAULT_TTS_URL = process.env.FISH_SPEECH_TTS_URL || 'http://127.0.0.1:8080/v1/tts'
const DEFAULT_API_KEY = process.env.FISH_SPEECH_API_KEY || null
const SARAH_MODEL_ID = '933563129e564b19a115bedd57b7406a'
const DEFAULT_TEXT = 'Tap semicolon'
const DEFAULT_FORMAT = 'wav'
const DEFAULT_SEED = 42
const DEFAULT_OUTPUT = `./tmp/tap-semicolon-sarah.${DEFAULT_FORMAT}`

function parseArgs(argv) {
    const options = {
        ttsUrl: DEFAULT_TTS_URL,
        apiKey: DEFAULT_API_KEY,
        modelId: SARAH_MODEL_ID,
        text: DEFAULT_TEXT,
        format: DEFAULT_FORMAT,
        seed: DEFAULT_SEED,
        output: DEFAULT_OUTPUT,
    }

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        const value = argv[i + 1]

        if (arg === '--help' || arg === '-h') {
            options.help = true
            continue
        }

        if (arg === '--tts-url') {
            options.ttsUrl = value
            i += 1
            continue
        }

        if (arg === '--api-key') {
            options.apiKey = value
            i += 1
            continue
        }

        if (arg === '--model-id') {
            options.modelId = value
            i += 1
            continue
        }

        if (arg === '--text') {
            options.text = value
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

        if (arg === '--output') {
            options.output = value
            i += 1
            continue
        }

        throw new Error(`Unknown argument: ${arg}`)
    }

    return options
}

function printHelp() {
    console.log(`Generate one Fish Speech clip for \"Tap semicolon\" using Sarah's model ID.

Usage:
  npm run generate:tap-semicolon -- [options]

Options:
  --tts-url <url>      TTS endpoint. Default: http://127.0.0.1:8080/v1/tts
  --api-key <token>    Optional bearer token (or set FISH_SPEECH_API_KEY).
  --model-id <id>      Fish model/reference ID. Default: Sarah model ID
  --text <text>        Text to synthesize. Default: \"Tap semicolon\"
  --format <fmt>       wav | mp3 | opus | pcm. Default: wav
  --seed <number>      Deterministic seed. Default: 42
  --output <path>      Output file path. Default: ./tmp/tap-semicolon-sarah.wav
  --help, -h           Show this help text.
`)
}

async function main() {
    const options = parseArgs(process.argv.slice(2))

    if (options.help) {
        printHelp()
        return
    }

    if (!Number.isFinite(options.seed)) {
        throw new Error('seed must be a number')
    }

    if (!['wav', 'mp3', 'opus', 'pcm'].includes(options.format)) {
        throw new Error(`Unsupported format: ${options.format}`)
    }

    const payload = buildSynthesisRequestData({
        referenceId: options.modelId,
        format: options.format,
        text: options.text,
        seed: options.seed,
    })

    const headers = { 'content-type': 'application/json' }
    if (options.apiKey) {
        headers.authorization = `Bearer ${options.apiKey}`
    }

    console.log(`POST ${options.ttsUrl}`)
    console.log(`model_id: ${options.modelId}`)
    console.log(`text: ${options.text}`)

    const response = await fetch(options.ttsUrl, {
        method: 'POST',
        headers,
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

    const outputPath = path.resolve(options.output)
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, audio)

    console.log(`Saved ${audio.length} bytes to ${outputPath}`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
