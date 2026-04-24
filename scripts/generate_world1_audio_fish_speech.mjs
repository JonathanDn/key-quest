import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { WORLD1_AUDIO_TEXT } from '../src/game/content/world1AudioText.js'
import { buildSynthesisRequestData, formatReferenceIdLog } from './world1AudioGeneration.js'

const DEFAULT_OUTPUT_DIR = './tmp/world1-tap-audio'
const DEFAULT_TTS_URL = 'http://127.0.0.1:8080/v1/tts'

// Optional: set this once to always use a stable pre-created reference profile.
// Leave as empty string to continue using reference-audio mode by default.
const SARAH_REFERENCE_ID = '933563129e564b19a115bedd57b7406a'
const SCRIPT_DEFAULT_REFERENCE_ID = SARAH_REFERENCE_ID
const DEFAULT_REFERENCE_ID = process.env.FISH_SPEECH_REFERENCE_ID || SCRIPT_DEFAULT_REFERENCE_ID || null
const DEFAULT_REFERENCE_AUDIO_URL = './public/mothergoose-sample.mp3'
const DEFAULT_REFERENCE_TEXT = 'Mother Goose reference narration sample'

function parseArgs(argv) {
    const options = {
        outputDir: DEFAULT_OUTPUT_DIR,
        ttsUrl: DEFAULT_TTS_URL,
        apiKey: null,
        referenceId: DEFAULT_REFERENCE_ID,
        referenceAudioUrl: DEFAULT_REFERENCE_AUDIO_URL,
        referenceText: DEFAULT_REFERENCE_TEXT,
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

        if (arg === '--reference-text') {
            options.referenceText = value
            i += 1
            continue
        }

        if (arg === '--format') {
            options.format = value
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
    console.log(`Generate world-1 guidance audio files via fish-speech API.\n
Usage:
  node scripts/generate_world1_audio_fish_speech.mjs --output-dir <path> [options]

Options:
  --output-dir <path>    Output folder for audio files. Default: ./tmp/world1-tap-audio
  --tts-url <url>        fish-speech TTS endpoint. Default: http://127.0.0.1:8080/v1/tts
  --api-key <token>      Optional bearer token when server auth is enabled.
  --reference-id <id>    fish-speech reference ID. Default: $FISH_SPEECH_REFERENCE_ID or SCRIPT_DEFAULT_REFERENCE_ID
  --reference-audio-url  Reference voice audio URL or local file path.
                          Default: ./public/mothergoose-sample.mp3 (local paths are converted to file:// URLs)
  --reference-text       Transcript/label required by fish-speech for the reference sample.
                          Default: Mother Goose reference narration sample
  --format <fmt>         One of: wav, mp3, opus, pcm. Default: wav
  --dry-run              Print resolved config/command and exit without calling TTS.
  --help, -h             Show this help text.

For stable voice across files, prefer a pre-created reference ID.
`)
}

function slugify(text) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return normalized || 'clip'
}

function formatYellowLog(message) {
    const ansiYellow = '\x1b[33m'
    const ansiReset = '\x1b[0m'
    return `${ansiYellow}${message}${ansiReset}`
}

function buildCommandPreview(options) {
    const segments = [
        'node scripts/generate_world1_audio_fish_speech.mjs',
        `--output-dir "${options.outputDir}"`,
        `--tts-url "${options.ttsUrl}"`,
        `--format "${options.format}"`,
    ]

    if (options.apiKey) {
        segments.push('--api-key "<redacted>"')
    }

    if (options.referenceId) {
        segments.push(`--reference-id "${options.referenceId}"`)
    } else {
        segments.push(`--reference-audio-url "${options.referenceAudioUrl}"`)
        segments.push(`--reference-text "${options.referenceText}"`)
    }

    return segments.join(' ')
}

function getContentTypeFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.mp3') return 'audio/mpeg'
    if (ext === '.wav') return 'audio/wav'
    if (ext === '.opus') return 'audio/ogg'
    return 'application/octet-stream'
}

async function startReferenceAudioServer(filePath) {
    const contentType = getContentTypeFromPath(filePath)
    const encodedName = encodeURIComponent(path.basename(filePath))
    const fileBuffer = await readFile(filePath)

    const server = createServer((req, res) => {
        if (req.method !== 'GET' || req.url !== `/${encodedName}`) {
            res.statusCode = 404
            res.end('Not found')
            return
        }

        res.statusCode = 200
        res.setHeader('content-type', contentType)
        res.setHeader('cache-control', 'no-store')
        res.end(fileBuffer)
    })

    await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', resolve)
    })

    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : null
    const referenceAudioUrl = `http://127.0.0.1:${port}/${encodedName}`

    return {
        referenceAudioUrl,
        close: () =>
            new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error)
                        return
                    }
                    resolve()
                })
            }),
    }
}

async function resolveReferenceAudioInput(referenceAudioUrl) {
    if (!referenceAudioUrl) {
        return { referenceAudioUrl, close: async () => {} }
    }

    if (referenceAudioUrl.startsWith('http://') || referenceAudioUrl.startsWith('https://')) {
        return { referenceAudioUrl, close: async () => {} }
    }

    const absolutePath = referenceAudioUrl.startsWith('file://')
        ? fileURLToPath(referenceAudioUrl)
        : path.resolve(referenceAudioUrl)
    await access(absolutePath)
    return startReferenceAudioServer(absolutePath)
}

async function synthesizeText({ ttsUrl, apiKey, referenceId, referenceAudioUrl, referenceText, format, text }) {
    const requestData = buildSynthesisRequestData({
        referenceId,
        referenceAudioUrl,
        referenceText,
        format,
        text,
    })

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
        const hint = !referenceId
            ? ' (reference-audio mode failed; try setting FISH_SPEECH_REFERENCE_ID or SCRIPT_DEFAULT_REFERENCE_ID)'
            : ''
        throw new Error(`Failed for text "${text}": ${response.status} ${detail}${hint}`)
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

    if (!options.referenceId && (!options.referenceAudioUrl || !options.referenceText)) {
        throw new Error('Provide --reference-id or both --reference-audio-url and --reference-text')
    }

    let closeReferenceAudioServer = async () => {}
    if (!options.referenceId) {
        const resolvedReference = await resolveReferenceAudioInput(options.referenceAudioUrl)
        options.referenceAudioUrl = resolvedReference.referenceAudioUrl
        closeReferenceAudioServer = resolvedReference.close
    }

    console.log(formatYellowLog(`Detected reference ID to be passed: ${options.referenceId || 'none'}`))
    console.log(formatYellowLog(`About to run: ${buildCommandPreview(options)}`))

    if (options.dryRun) {
        console.log(formatYellowLog('Dry run enabled; exiting before TTS requests.'))
        await closeReferenceAudioServer()
        return
    }

    try {
        const voiceMode = options.referenceId ? 'reference-id' : 'reference-audio'
        console.log(`Voice mode: ${voiceMode}${options.referenceId ? ` (${options.referenceId})` : ''}`)

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

            console.log(formatReferenceIdLog(options.referenceId))
            const started = Date.now()
            const audio = await synthesizeText({
                ttsUrl: options.ttsUrl,
                apiKey: options.apiKey,
                referenceId: options.referenceId,
                referenceAudioUrl: options.referenceAudioUrl,
                referenceText: options.referenceText,
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
            `${JSON.stringify({ world: 1, voiceMode, referenceId: options.referenceId, referenceAudioUrl: options.referenceAudioUrl, referenceText: options.referenceText, count: manifest.length, entries: manifest }, null, 2)}\n`,
        )

        console.log(`Done. Manifest: ${manifestPath}`)
    } finally {
        await closeReferenceAudioServer()
    }
}

main().catch((error) => {
    console.error(error.message)
    if (error.cause?.message) {
        console.error(`Cause: ${error.cause.message}`)
    }
    process.exitCode = 1
})
