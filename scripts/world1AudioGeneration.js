export function buildSynthesisRequestData({
    referenceId,
    referenceAudioUrl,
    referenceText,
    format,
    text,
}) {
    return {
        text,
        references: referenceId
            ? []
            : [{ audio: referenceAudioUrl, text: referenceText }],
        reference_id: referenceId,
        format,
        latency: 'normal',
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
