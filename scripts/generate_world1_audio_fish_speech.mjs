import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { WORLD1_AUDIO_TEXT } from '../src/game/content/world1AudioText.js'
import { buildSynthesisRequestData, formatReferenceIdLog } from './world1AudioGeneration.js'

const DEFAULT_OUTPUT_DIR = './tmp/world1-tap-audio'
const DEFAULT_TTS_URL = 'http://127.0.0.1:8080/v1/tts'

// Optional: set this once to always use a stable pre-created reference profile.
const SARAH_REFERENCE_ID = '933563129e564b19a115bedd57b7406a'
const SCRIPT_DEFAULT_REFERENCE_ID = SARAH_REFERENCE_ID
const DEFAULT_REFERENCE_ID = process.env.FISH_SPEECH_REFERENCE_ID || SCRIPT_DEFAULT_REFERENCE_ID || null
const DEFAULT_SEED = 42

function parseArgs(argv) {
    const options = {
        outputDir: DEFAULT_OUTPUT_DIR,
        ttsUrl: DEFAULT_TTS_URL,
        apiKey: null,
        referenceId: DEFAULT_REFERENCE_ID,
        seed: DEFAULT_SEED,
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
    console.log(`Generate world-1 guidance audio files via fish-speech API.\n
Usage:
  node scripts/generate_world1_audio_fish_speech.mjs --output-dir <path> [options]

Options:
  --output-dir <path>    Output folder for audio files. Default: ./tmp/world1-tap-audio
  --tts-url <url>        fish-speech TTS endpoint. Default: http://127.0.0.1:8080/v1/tts
  --api-key <token>      Optional bearer token when server auth is enabled.
  --reference-id <id>    fish-speech reference ID. Default: $FISH_SPEECH_REFERENCE_ID or SCRIPT_DEFAULT_REFERENCE_ID
  --seed <number>        Optional deterministic seed for output stability. Default: 42
  --format <fmt>         One of: wav, mp3, opus, pcm. Default: wav
  --dry-run              Print resolved config/command and exit without calling TTS.
  --help, -h             Show this help text.

This script uses reference-id mode only (no reference-audio fallback).
`)
}

function slugify(text) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return normalized || 'clip'
}

function toSpokenGuidanceText(text) {
    if (text === 'Tap ;') return 'Tap semicolon'
    if (text === 'Tap ,') return 'Tap comma'
    return text
}

function withSuccessSuffix(filePath, format) {
    return filePath.endsWith(`.${format}`)
        ? filePath.slice(0, -(format.length + 1)) + `-success.${format}`
        : `${filePath}`
}

function formatYellowLog(message) {
    const ansiYellow = '\x1b[33m'
    const ansiReset = '\x1b[0m'
    return `${ansiYellow}${message}${ansiReset}`
}

function formatMagentaLog(message) {
    const ansiMagenta = '\x1b[35m'
    const ansiReset = '\x1b[0m'
    return `${ansiMagenta}${message}${ansiReset}`
}

function buildCommandPreview(options) {
    const segments = [
        'node scripts/generate_world1_audio_fish_speech.mjs',
        `--output-dir "${options.outputDir}"`,
        `--tts-url "${options.ttsUrl}"`,
        `--seed ${options.seed}`,
        `--format "${options.format}"`,
    ]

    if (options.apiKey) {
        segments.push('--api-key "<redacted>"')
    }

    segments.push(`--reference-id "${options.referenceId}"`)

    return segments.join(' ')
}

async function synthesizeText({ ttsUrl, apiKey, referenceId, format, text, seed }) {
    const requestData = buildSynthesisRequestData({
        referenceId,
        format,
        text,
        seed,
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

    if (!Number.isFinite(options.seed)) {
        throw new Error('Provide --seed as a number')
    }

    if (!options.referenceId) {
        throw new Error('Provide --reference-id or set FISH_SPEECH_REFERENCE_ID/SCRIPT_DEFAULT_REFERENCE_ID')
    }

    console.log(formatYellowLog(`Detected reference ID to be passed: ${options.referenceId || 'none'}`))
    console.log(formatMagentaLog(`Actual command sent: ${buildCommandPreview(options)}`))

    if (options.dryRun) {
        console.log(formatYellowLog('Dry run enabled; exiting before TTS requests.'))
        return
    }

    const voiceMode = 'reference-id'
    console.log(`Voice mode: ${voiceMode} (${options.referenceId})`)

    const outputDir = path.resolve(options.outputDir)
    await mkdir(outputDir, { recursive: true })

        const texts = WORLD1_AUDIO_TEXT.tapGuidance
        const manifest = []

        console.log(`Generating ${texts.length} clips into ${outputDir}`)

        for (let i = 0; i < texts.length; i += 1) {
            const text = texts[i]
            const spokenText = toSpokenGuidanceText(text)
            const index = i + 1
            const baseFilename = `${String(index).padStart(3, '0')}-${slugify(text)}.${options.format}`
            const successFilename = withSuccessSuffix(baseFilename, options.format)
            const baseDestination = path.join(outputDir, baseFilename)
            const successDestination = path.join(outputDir, successFilename)

            let successExists = false
            try {
                await access(successDestination)
                successExists = true
            } catch {
                successExists = false
            }

            if (successExists) {
                console.log(`[${String(index).padStart(3, '0')}/${texts.length}] ${successFilename} (already -success, skipping)`)
                manifest.push({ text, spokenText, file: successFilename, status: 'skipped' })
                continue
            }

            console.log(formatReferenceIdLog(options.referenceId))
            const started = Date.now()
            const audio = await synthesizeText({
                ttsUrl: options.ttsUrl,
                apiKey: options.apiKey,
                referenceId: options.referenceId,
                format: options.format,
                text: spokenText,
                seed: options.seed,
            })

            await writeFile(successDestination, audio)
            await rm(baseDestination, { force: true })
            const elapsedSeconds = ((Date.now() - started) / 1000).toFixed(2)
            console.log(`[${String(index).padStart(3, '0')}/${texts.length}] ${successFilename} (${elapsedSeconds}s)`)

            manifest.push({ text, spokenText, file: successFilename, status: 'generated' })
        }

        const manifestPath = path.join(outputDir, 'world1_manifest.json')
        await writeFile(
            manifestPath,
            `${JSON.stringify({ world: 1, voiceMode, referenceId: options.referenceId, seed: options.seed, count: manifest.length, entries: manifest }, null, 2)}\n`,
        )

        console.log(`Done. Manifest: ${manifestPath}`)
}

main().catch((error) => {
    console.error(error.message)
    if (error.cause?.message) {
        console.error(`Cause: ${error.cause.message}`)
    }
    process.exitCode = 1
})
