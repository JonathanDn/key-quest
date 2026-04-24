export function buildSynthesisRequestData({
    referenceId,
    referenceAudioUrl,
    referenceText,
    format,
    text,
    seed,
}) {
    const normalizedReferenceId = typeof referenceId === 'string' ? referenceId.trim() : referenceId
    const hasReferenceId = Boolean(normalizedReferenceId)

    return {
        text,
        references: hasReferenceId
            ? undefined
            : [{ audio: referenceAudioUrl, text: referenceText }],
        reference_id: hasReferenceId ? normalizedReferenceId : null,
        format,
        latency: 'normal',
        seed,
        max_new_tokens: 1024,
        chunk_length: 200,
        top_p: 0.3,
        repetition_penalty: 1.1,
        temperature: 0.2,
        streaming: false,
        use_memory_cache: 'on',
    }
}

export function formatReferenceIdLog(referenceId) {
    const ansiGreen = '\x1b[32m'
    const ansiReset = '\x1b[0m'
    const value = referenceId || 'none'
    return `${ansiGreen}Reference ID: ${value}${ansiReset}`
}
