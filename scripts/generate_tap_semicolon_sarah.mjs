import { mkdir, writeFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'
import process from 'node:process'

import { buildSynthesisRequestData } from './world1AudioGeneration.js'

const LOCAL_TTS_URL = process.env.FISH_SPEECH_TTS_URL || 'http://127.0.0.1:8080/v1/tts'
const SARAH_MODEL_ID = '933563129e564b19a115bedd57b7406a'
const TAP_SEMICOLON_TEXT = 'Tap semicolon'
const PROBE_TEXT = 'Tap A'
const DEFAULT_FORMAT = 'wav'
const DEFAULT_SEED = 42
const DEFAULT_OUTPUT = `./tmp/tap-semicolon-sarah.${DEFAULT_FORMAT}`
const MIN_AUDIO_BYTES = 512

function isLocalTtsUrl(url) {
    try {
        const parsed = new URL(url)
        return ['127.0.0.1', 'localhost'].includes(parsed.hostname)
    } catch {
        return false
    }
}

function formatMagentaLog(message) {
    const ansiMagenta = '\x1b[35m'
    const ansiReset = '\x1b[0m'
    return `${ansiMagenta}${message}${ansiReset}`
}

function parseArgs(argv) {
    const options = {
        ttsUrl: LOCAL_TTS_URL,
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

        if (arg === '--tts-url') {
            options.ttsUrl = value
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
    console.log(`Generate one Sarah clip for "Tap semicolon" using ONLY local fish-speech.

Usage:
  npm run generate:tap-semicolon -- [options]

Preflight sanity checks (before generation):
  1) Local endpoint-only enforcement.
  2) Probe request confirms reference_id is accepted and returns non-empty audio.
  3) Payload consistency: reference_id mode must not include references array.
  4) Endpoint/mode summary is printed in magenta for operator verification.
  5) Generation params are validated for deterministic baseline values.

Options:
  --tts-url <url>      Local TTS endpoint. Default: ${LOCAL_TTS_URL}
  --output <path>      Output file path. Default: ./tmp/tap-semicolon-sarah.wav
  --format <fmt>       wav | mp3 | opus | pcm. Default: wav
  --seed <number>      Deterministic seed. Default: 42
  --dry-run            Print request settings/checks only.
  --help, -h           Show this help text.
`)
}

function assertDeterministicParams(payload) {
    if (payload.top_p !== 0.3) throw new Error('Unexpected top_p; expected 0.3')
    if (payload.temperature !== 0.2) throw new Error('Unexpected temperature; expected 0.2')
    if (payload.repetition_penalty !== 1.1) throw new Error('Unexpected repetition_penalty; expected 1.1')
    if (payload.latency !== 'normal') throw new Error('Unexpected latency; expected "normal"')
    if (payload.use_memory_cache !== 'on') throw new Error('Unexpected use_memory_cache; expected "on"')
}

async function synthesizeBuffer({ ttsUrl, payload }) {
    const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const detail = await response.text()
        throw new Error(`TTS request failed: ${response.status} ${detail}`)
    }

    return Buffer.from(await response.arrayBuffer())
}

async function runPreflightChecks({ options, generationPayload }) {
    console.log(formatMagentaLog('Running preflight sanity checks...'))

    // 1 & 4: local endpoint enforcement + explicit magenta visibility
    if (!isLocalTtsUrl(options.ttsUrl)) {
        throw new Error(`Only local endpoints are allowed. Received: ${options.ttsUrl}`)
    }
    console.log(formatMagentaLog(`CHECK 1/4 OK: local endpoint = ${options.ttsUrl}`))

    // 3: reference-id mode must not include references fallback.
    if (!generationPayload.reference_id || generationPayload.reference_id !== SARAH_MODEL_ID) {
        throw new Error('CHECK 3 FAILED: reference_id is missing or does not match Sarah model ID.')
    }
    if (generationPayload.references !== undefined) {
        throw new Error('CHECK 3 FAILED: references must be undefined when using reference_id mode.')
    }
    console.log(formatMagentaLog('CHECK 3 OK: payload is strict reference_id mode (no fallback references).'))

    // 5: keep generation settings locked for consistent timbre/prosody.
    assertDeterministicParams(generationPayload)
    console.log(formatMagentaLog('CHECK 5 OK: deterministic generation params validated.'))

    // 2: probe request to ensure the engine accepts the Sarah reference_id and emits real audio.
    const probePayload = buildSynthesisRequestData({
        referenceId: SARAH_MODEL_ID,
        format: options.format,
        text: PROBE_TEXT,
        seed: options.seed,
    })

    const probeAudio = await synthesizeBuffer({ ttsUrl: options.ttsUrl, payload: probePayload })
    if (probeAudio.length < MIN_AUDIO_BYTES) {
        throw new Error(`CHECK 2 FAILED: probe audio too small (${probeAudio.length} bytes).`)
    }

    const probeHash = crypto.createHash('sha256').update(probeAudio).digest('hex').slice(0, 16)
    console.log(formatMagentaLog(`CHECK 2 OK: probe synthesized (${probeAudio.length} bytes, sha256:${probeHash}).`))

    console.log(formatMagentaLog('All preflight checks passed. Proceeding to final generation...'))
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

    const generationPayload = buildSynthesisRequestData({
        referenceId: SARAH_MODEL_ID,
        format: options.format,
        text: TAP_SEMICOLON_TEXT,
        seed: options.seed,
    })

    const outputPath = path.resolve(options.output)

    console.log(formatMagentaLog(`Target reference_id: ${SARAH_MODEL_ID}`))
    console.log(formatMagentaLog(`Target text: ${TAP_SEMICOLON_TEXT}`))
    console.log(formatMagentaLog(`Output path: ${outputPath}`))

    if (options.dryRun) {
        await runPreflightChecks({ options, generationPayload })
        console.log(formatMagentaLog('Dry run enabled; no final file was generated.'))
        return
    }

    await runPreflightChecks({ options, generationPayload })

    const audio = await synthesizeBuffer({
        ttsUrl: options.ttsUrl,
        payload: generationPayload,
    })

    if (!audio.length) {
        throw new Error('Final generation returned empty audio')
    }

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, audio)

    console.log(`Saved ${audio.length} bytes to ${outputPath}`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
