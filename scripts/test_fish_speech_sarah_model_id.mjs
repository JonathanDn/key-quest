import process from 'node:process'

const DEFAULT_TTS_URL = 'http://127.0.0.1:8080/v1/tts'
const SARAH_REFERENCE_ID = '933563129e564b19a115bedd57b7406a'
const DEFAULT_TEXT = 'Tap A'
const DEFAULT_FORMAT = 'wav'
const DEFAULT_SEED = 42

function parseArgs(argv) {
    const options = {
        ttsUrl: process.env.FISH_SPEECH_TTS_URL || DEFAULT_TTS_URL,
        apiKey: process.env.FISH_SPEECH_API_KEY || null,
        referenceId: process.env.FISH_SPEECH_REFERENCE_ID || SARAH_REFERENCE_ID,
        text: DEFAULT_TEXT,
        format: DEFAULT_FORMAT,
        seed: DEFAULT_SEED,
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

        if (arg === '--reference-id') {
            options.referenceId = value
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

        throw new Error(`Unknown argument: ${arg}`)
    }

    return options
}

function printHelp() {
    console.log(`Validate that fish-speech can synthesize using Sarah's model ID.

Usage:
  npm run test-fish-speech-sarah-model-id -- [options]

Options:
  --tts-url <url>        TTS endpoint. Default: http://127.0.0.1:8080/v1/tts
  --api-key <token>      Optional bearer token.
  --reference-id <id>    Model/reference ID. Default: Sarah model ID
  --text <text>          Prompt text. Default: "Tap A"
  --format <fmt>         One of: wav, mp3, opus, pcm. Default: wav
  --seed <number>        Deterministic seed. Default: 42
  --help, -h             Show this help text.
`)
}

async function main() {
    const options = parseArgs(process.argv.slice(2))

    if (options.help) {
        printHelp()
        return
    }

    if (!options.referenceId) {
        throw new Error('reference-id is required')
    }

    if (!Number.isFinite(options.seed)) {
        throw new Error('seed must be a valid number')
    }

    const payload = {
        text: options.text,
        reference_id: options.referenceId,
        references: undefined,
        format: options.format,
        latency: 'normal',
        seed: options.seed,
        max_new_tokens: 256,
        chunk_length: 120,
        top_p: 0.3,
        repetition_penalty: 1.1,
        temperature: 0.2,
        streaming: false,
        use_memory_cache: 'on',
    }

    const headers = {
        'content-type': 'application/json',
    }

    if (options.apiKey) {
        headers.authorization = `Bearer ${options.apiKey}`
    }

    console.log(`Testing model ID: ${options.referenceId}`)
    console.log(`POST ${options.ttsUrl}`)

    const response = await fetch(options.ttsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const detail = await response.text()
        throw new Error(`Model ID check failed: ${response.status} ${detail}`)
    }

    const audio = Buffer.from(await response.arrayBuffer())
    if (audio.length === 0) {
        throw new Error('Model ID check failed: empty audio response')
    }

    console.log(`Model ID is accepted by engine. Received ${audio.length} bytes.`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
