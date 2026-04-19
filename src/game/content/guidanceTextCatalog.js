import { LEVELS } from './levels.js'
import { codeToLabel } from './keyData.js'

function charToCode(char) {
    if (char === ' ') {
        return 'Space'
    }

    if (/^[a-z]$/i.test(char)) {
        return `Key${char.toUpperCase()}`
    }

    if (char === ',') {
        return 'Comma'
    }

    if (char === '.') {
        return 'Period'
    }

    if (char === ';') {
        return 'Semicolon'
    }

    if (char === '/') {
        return 'Slash'
    }

    throw new Error(`Unsupported prompt character: ${char}`)
}

function addIfPresent(texts, text) {
    if (typeof text !== 'string') {
        return
    }

    const normalized = text.trim()
    if (!normalized) {
        return
    }

    texts.add(normalized)
}

function labelForCode(code) {
    return codeToLabel[code] ?? code
}

export function collectGuidanceRowTexts() {
    const texts = new Set(['Watch the glowing key'])

    LEVELS.forEach((level) => {
        if (Array.isArray(level.promptPool) && level.promptPool.length > 0) {
            level.promptPool.forEach((promptText) => {
                addIfPresent(texts, `Type "${promptText}"`)

                Array.from(promptText).forEach((char) => {
                    const code = charToCode(char)
                    addIfPresent(texts, `Try ${labelForCode(code)}`)
                })
            })
            return
        }

        if (Array.isArray(level.missions) && level.missions.length > 0) {
            level.missions.forEach((mission) => {
                addIfPresent(texts, mission.taskLabel ?? mission.helper ?? mission.label)
                addIfPresent(texts, `Try ${mission.label}`)
            })
            return
        }

        if (Array.isArray(level.targets) && level.targets.length > 0) {
            level.targets.forEach((target) => {
                if (target.type === 'combo') {
                    addIfPresent(texts, target.helper ?? target.label)
                    addIfPresent(texts, `Try ${target.label}`)
                    return
                }

                const label = labelForCode(target.code)
                addIfPresent(texts, `Tap ${label}`)
                addIfPresent(texts, `Try ${label}`)
            })
            return
        }

        ;(level.keys ?? []).forEach((code) => {
            const label = labelForCode(code)
            addIfPresent(texts, `Tap ${label}`)
            addIfPresent(texts, `Try ${label}`)
        })
    })

    return Array.from(texts).sort((left, right) => left.localeCompare(right))
}
