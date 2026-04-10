import { WORLD_META } from '../content/worldMeta'

export function getCurrentWorldLevels(levels, currentWorld) {
    return levels.filter((entry) => entry.world === currentWorld)
}

export function getWorldStartIndex(levels, currentWorld) {
    return levels.findIndex((entry) => entry.world === currentWorld)
}

export function getCurrentLevelInWorld(levels, currentWorld, levelIndex) {
    const worldStartIndex = getWorldStartIndex(levels, currentWorld)
    return levelIndex - worldStartIndex + 1
}

export function getNextLevel(levels, levelIndex) {
    return levelIndex < levels.length - 1 ? levels[levelIndex + 1] : null
}

export function getNextWorld(nextLevel) {
    return nextLevel?.world ?? null
}

export function getUnlockedWorldMeta(nextWorld) {
    return WORLD_META.find((entry) => entry.world === nextWorld) ?? null
}

export function getProgressionState({ levels, level, levelIndex, complete }) {
    const currentWorld = level.world
    const currentWorldLevels = getCurrentWorldLevels(levels, currentWorld)
    const worldStartIndex = getWorldStartIndex(levels, currentWorld)
    const currentLevelInWorld = levelIndex - worldStartIndex + 1
    const hasNextLevel = levelIndex < levels.length - 1
    const nextLevel = getNextLevel(levels, levelIndex)
    const nextWorld = getNextWorld(nextLevel)
    const gameFinished = complete && !hasNextLevel
    const unlockedWorldMeta = getUnlockedWorldMeta(nextWorld)
    const isWorldBoundary = complete && (gameFinished || nextWorld !== currentWorld)
    const isStandardLevelComplete = complete && !isWorldBoundary

    return {
        currentWorld,
        currentWorldLevels,
        worldStartIndex,
        currentLevelInWorld,
        hasNextLevel,
        nextLevel,
        nextWorld,
        gameFinished,
        unlockedWorldMeta,
        isWorldBoundary,
        isStandardLevelComplete,
    }
}