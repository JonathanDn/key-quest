import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

import { afterEach, describe, expect, it } from 'vitest'

import { WORLD1_AUDIO_TEXT } from '../../src/game/content/world1AudioText'

function runScript(args) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['scripts/generate_world1_audio_fish_speech.mjs', ...args], {
            cwd: path.resolve('.'),
            stdio: ['ignore', 'pipe', 'pipe'],
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString()
        })

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
        })

        child.on('error', reject)
        child.on('close', (code) => {
            resolve({ code, stdout, stderr })
        })
    })
}

function runScriptWithoutDefaultReferenceId(args) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['scripts/generate_world1_audio_fish_speech.mjs', ...args], {
            cwd: path.resolve('.'),
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                FISH_SPEECH_REFERENCE_ID: '',
            },
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString()
        })

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
        })

        child.on('error', reject)
        child.on('close', (code) => {
            resolve({ code, stdout, stderr })
        })
    })
}

async function createMockTtsServer({ failFirst = false } = {}) {
    const requests = []
    let requestCount = 0

    const server = createServer((req, res) => {
        if (req.method !== 'POST' || req.url !== '/v1/tts') {
            res.statusCode = 404
            res.end('not found')
            return
        }

        let body = ''
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            requestCount += 1
            requests.push(JSON.parse(body))

            if (failFirst && requestCount === 1) {
                res.statusCode = 500
                res.setHeader('content-type', 'application/json')
                res.end(JSON.stringify({ statusCode: 500, message: 'Failed to generate speech', error: 'Internal Server Error' }))
                return
            }

            res.statusCode = 200
            res.setHeader('content-type', 'audio/wav')
            res.end(Buffer.from('FAKEAUDIO'))
        })
    })

    await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', resolve)
    })

    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : null

    return {
        ttsUrl: `http://127.0.0.1:${port}/v1/tts`,
        requests,
        close: () => new Promise((resolve, reject) => {
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

describe('generate_world1_audio_fish_speech script', () => {
    const cleanups = []

    afterEach(async () => {
        while (cleanups.length > 0) {
            const fn = cleanups.pop()
            await fn()
        }
    })

    it('dry-run does not call the tts engine', async () => {
        const mock = await createMockTtsServer()
        cleanups.push(mock.close)

        const outputDir = await mkdtemp(path.join(os.tmpdir(), 'world1-audio-dry-run-'))
        cleanups.push(() => rm(outputDir, { recursive: true, force: true }))

        const result = await runScript([
            '--dry-run',
            '--tts-url', mock.ttsUrl,
            '--output-dir', outputDir,
            '--reference-id', 'test-reference-id',
        ])

        expect(result.code).toBe(0)
        expect(result.stdout).toContain('Dry run enabled; exiting before TTS requests.')
        expect(mock.requests).toHaveLength(0)
    })

    it('sends reference_id for every generated world1 clip and writes manifest', async () => {
        const mock = await createMockTtsServer()
        cleanups.push(mock.close)

        const outputDir = await mkdtemp(path.join(os.tmpdir(), 'world1-audio-success-'))
        cleanups.push(() => rm(outputDir, { recursive: true, force: true }))

        const referenceId = '933563129e564b19a115bedd57b7406a'
        const result = await runScript([
            '--tts-url', mock.ttsUrl,
            '--output-dir', outputDir,
            '--reference-id', referenceId,
        ])

        expect(result.code).toBe(0)
        expect(mock.requests).toHaveLength(WORLD1_AUDIO_TEXT.tapGuidance.length)
        expect(mock.requests.every((request) => request.reference_id === referenceId)).toBe(true)
        expect(mock.requests.every((request) => request.references === undefined)).toBe(true)
        expect(mock.requests.every((request) => request.seed === 42)).toBe(true)

        const files = await readdir(outputDir)
        const audioFiles = files.filter((file) => file.endsWith('.wav'))
        expect(audioFiles).toHaveLength(WORLD1_AUDIO_TEXT.tapGuidance.length)
        expect(files).toContain('world1_manifest.json')

        const manifest = JSON.parse(await readFile(path.join(outputDir, 'world1_manifest.json'), 'utf8'))
        expect(manifest.count).toBe(WORLD1_AUDIO_TEXT.tapGuidance.length)
        expect(manifest.referenceId).toBe(referenceId)
        expect(manifest.voiceMode).toBe('reference-id')
    })

    it('fails fast on first 500 response and shows actionable error output', async () => {
        const mock = await createMockTtsServer({ failFirst: true })
        cleanups.push(mock.close)

        const outputDir = await mkdtemp(path.join(os.tmpdir(), 'world1-audio-fail-'))
        cleanups.push(() => rm(outputDir, { recursive: true, force: true }))

        const result = await runScript([
            '--tts-url', mock.ttsUrl,
            '--output-dir', outputDir,
            '--reference-id', 'test-reference-id',
        ])

        expect(result.code).toBe(1)
        expect(mock.requests).toHaveLength(1)
        expect(result.stderr).toContain('Failed for text "Tap A": 500')
    })

    it('fails when no reference id is provided', async () => {
        const result = await runScriptWithoutDefaultReferenceId([
            '--reference-id', '',
        ])

        expect(result.code).toBe(1)
        expect(result.stderr).toContain('Provide --reference-id or set FISH_SPEECH_REFERENCE_ID/SCRIPT_DEFAULT_REFERENCE_ID')
    })
})
