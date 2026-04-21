import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { WORLD1_AUDIO_TEXT } from '../src/game/content/world1AudioText.js'

const DEFAULT_OUTPUT_DIR = './tmp/world1-tap-audio'
const DEFAULT_TTS_URL = 'http://127.0.0.1:8080/v1/tts'
const DEFAULT_REFERENCE_ID = 'mother-goose-world1'
const DEFAULT_REFERENCE_AUDIO_URL = 'https://dn710702.ca.archive.org/0/items/real_mother_goose_ah_librivox/mothergoose_01_anonymous_64kb.mp3'

function parseArgs(argv) {
    const options = {
        outputDir: DEFAULT_OUTPUT_DIR,
        ttsUrl: DEFAULT_TTS_URL,
        apiKey: null,
        referenceId: DEFAULT_REFERENCE_ID,
        referenceAudioUrl: DEFAULT_REFERENCE_AUDIO_URL,
        format: 'wav',
    }

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        const value = argv[i + 1]

        if (arg === '--help' || arg === '-h') {
            options.help = true
            continue
        }

        if (arg === '--output-dir') {
            options.outputDir = value
            i += 1
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

        if (arg === '--reference-audio-url') {
            options.referenceAudioUrl = value
            i += 1
            continue
        }

        if (arg === '--format') {
            options.format = value
            i += 1
            continue
        }


        throw new Error(`Unknown argument: ${arg}`)
    }

    return options
}

function printHelp() {
    console.log(`Generate world-1 guidance audio files via fish-speech API.\n
Usage:
  node scripts/generate_world1_audio_fish_speech.mjs --output-dir <path> [options]

Options:
  --output-dir <path>    Output folder for audio files. Default: ./tmp/world1-tap-audio
  --tts-url <url>        fish-speech TTS endpoint. Default: http://127.0.0.1:8080/v1/tts
  --api-key <token>      Optional bearer token when server auth is enabled.
  --reference-id <id>    fish-speech reference ID. Default: mother-goose-world1
  --reference-audio-url  Reference voice audio URL.
                          Default: https://dn710702.ca.archive.org/0/items/real_mother_goose_ah_librivox/mothergoose_01_anonymous_64kb.mp3
  --format <fmt>         One of: wav, mp3, opus, pcm. Default: wav
  --help, -h             Show this help text.
`)
}

function slugify(text) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return normalized || 'clip'
}

async function synthesizeText({ ttsUrl, apiKey, referenceId, referenceAudioUrl, format, text }) {
    const requestData = {
        text,
        references: referenceAudioUrl
            ? [{ audio: referenceAudioUrl }]
            : [],
        reference_id: referenceId,
        format,
        latency: 'normal',
        max_new_tokens: 1024,
        chunk_length: 200,
        top_p: 0.8,
        repetition_penalty: 1.1,
        temperature: 0.8,
        streaming: false,
        use_memory_cache: 'on',
    }

    const headers = {
        'content-type': 'application/json',
    }

    if (apiKey) {
        headers.authorization = `Bearer ${apiKey}`
    }

    const response = await fetch(ttsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
    })

    if (!response.ok) {
        const detail = await response.text()
        throw new Error(`Failed for text "${text}": ${response.status} ${detail}`)
    }

    return Buffer.from(await response.arrayBuffer())
}

async function main() {
    const options = parseArgs(process.argv.slice(2))

    if (options.help) {
        printHelp()
        return
    }

    if (!['wav', 'mp3', 'opus', 'pcm'].includes(options.format)) {
        throw new Error(`Unsupported --format "${options.format}"`)
    }

    const outputDir = path.resolve(options.outputDir)
    await mkdir(outputDir, { recursive: true })

    const texts = WORLD1_AUDIO_TEXT.tapGuidance
    const manifest = []

    console.log(`Generating ${texts.length} clips into ${outputDir}`)

    for (let i = 0; i < texts.length; i += 1) {
        const text = texts[i]
        const index = i + 1
        const filename = `${String(index).padStart(3, '0')}-${slugify(text)}.${options.format}`
        const destination = path.join(outputDir, filename)

        const started = Date.now()
        const audio = await synthesizeText({
            ttsUrl: options.ttsUrl,
            apiKey: options.apiKey,
            referenceId: options.referenceId,
            referenceAudioUrl: options.referenceAudioUrl,
            format: options.format,
            text,
        })

        await writeFile(destination, audio)
        const elapsedSeconds = ((Date.now() - started) / 1000).toFixed(2)
        console.log(`[${String(index).padStart(3, '0')}/${texts.length}] ${filename} (${elapsedSeconds}s)`)

        manifest.push({ text, file: filename })
    }

    const manifestPath = path.join(outputDir, 'world1_manifest.json')
    await writeFile(
        manifestPath,
        `${JSON.stringify({ world: 1, referenceId: options.referenceId, referenceAudioUrl: options.referenceAudioUrl, count: manifest.length, entries: manifest }, null, 2)}\n`,
    )

    console.log(`Done. Manifest: ${manifestPath}`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
