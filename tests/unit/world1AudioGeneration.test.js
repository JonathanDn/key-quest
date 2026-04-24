import { describe, expect, it } from 'vitest'

import { buildSynthesisRequestData, formatReferenceIdLog } from '../../scripts/world1AudioGeneration'
import { WORLD1_AUDIO_TEXT } from '../../src/game/content/world1AudioText'

describe('world1 audio generation config', () => {
    it('uses the same reference id for every request when provided', () => {
        const referenceId = 'stable-reference-id'
        const options = {
            referenceId,
            referenceAudioUrl: 'https://example.com/reference.mp3',
            referenceText: 'sample',
            format: 'wav',
        }

        const requests = ['Tap A', 'Tap S', 'Tap D'].map((text) => (
            buildSynthesisRequestData({ ...options, text })
        ))

        expect(requests.map((request) => request.reference_id)).toEqual([
            referenceId,
            referenceId,
            referenceId,
        ])
        expect(requests.every((request) => request.references.length === 0)).toBe(true)
    })

    it('passes the configured reference id for every world1 tap clip request', () => {
        const referenceId = '933563129e564b19a115bedd57b7406a'
        const requests = WORLD1_AUDIO_TEXT.tapGuidance.map((text) => (
            buildSynthesisRequestData({
                referenceId,
                referenceAudioUrl: 'https://example.com/reference.mp3',
                referenceText: 'sample',
                format: 'wav',
                text,
            })
        ))

        expect(requests).toHaveLength(WORLD1_AUDIO_TEXT.tapGuidance.length)
        expect(requests.every((request) => request.reference_id === referenceId)).toBe(true)
        expect(requests.every((request) => request.references.length === 0)).toBe(true)
    })

    it('uses reference audio payload when reference id is missing', () => {
        const request = buildSynthesisRequestData({
            referenceId: null,
            referenceAudioUrl: 'https://example.com/reference.mp3',
            referenceText: 'sample',
            format: 'wav',
            text: 'Tap A',
        })

        expect(request.reference_id).toBeNull()
        expect(request.references).toEqual([
            {
                audio: 'https://example.com/reference.mp3',
                text: 'sample',
            },
        ])
    })

    it('formats reference id logs in green', () => {
        expect(formatReferenceIdLog('ref-123')).toContain('\u001b[32mReference ID: ref-123\u001b[0m')
    })
})
