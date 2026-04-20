export const ALPHA_QUEST_WORLDS = [
  {
    id: 'easy-shapes',
    title: 'World 1 · Easy Shapes',
    letters: ['L', 'T', 'H', 'I', 'X'],
  },
  {
    id: 'angles',
    title: 'World 2 · Angles',
    letters: ['A', 'M', 'N', 'V', 'W', 'Y', 'Z'],
  },
  {
    id: 'curves',
    title: 'World 3 · Curves',
    letters: ['C', 'G', 'J', 'O', 'Q', 'S', 'U'],
  },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const LEVELS_PER_WORLD = 3
const ROUNDS_PER_LEVEL = 5
const FIELD_SIZE = 9

function sampleLetters(sourceLetters, count) {
  const shuffled = [...sourceLetters].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function buildRound(worldLetters) {
  const target = worldLetters[Math.floor(Math.random() * worldLetters.length)]
  const distractorPool = ALPHABET.filter((letter) => letter !== target)
  const distractors = sampleLetters(distractorPool, FIELD_SIZE - 1)
  const options = [...distractors, target].sort(() => Math.random() - 0.5)

  return {
    target,
    options,
  }
}

export function createAlphaQuestLevels() {
  return ALPHA_QUEST_WORLDS.flatMap((world, worldIndex) =>
    Array.from({ length: LEVELS_PER_WORLD }, (_, index) => {
      const levelNumber = index + 1
      return {
        id: `${world.id}-level-${levelNumber}`,
        worldId: world.id,
        worldTitle: world.title,
        worldIndex,
        levelNumber,
        rounds: Array.from({ length: ROUNDS_PER_LEVEL }, () => buildRound(world.letters)),
      }
    }),
  )
}
