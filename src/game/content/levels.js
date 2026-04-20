import { PROMPT_POOLS, WORD_POWER_MISSION_STEPS } from './guidanceConfig.js'

const HOME_KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon']
const SPACE_KEY = ['Space']

const TOP_NEAR_LEFT = ['KeyE', 'KeyR', 'KeyT']
const TOP_NEAR_RIGHT = ['KeyY', 'KeyU', 'KeyI']
const TOP_NEAR = [...TOP_NEAR_LEFT, ...TOP_NEAR_RIGHT]

const BOTTOM_NEAR_LEFT = ['KeyC', 'KeyV', 'KeyB']
const BOTTOM_NEAR_RIGHT = ['KeyN', 'KeyM', 'Comma']
const BOTTOM_NEAR = [...BOTTOM_NEAR_LEFT, ...BOTTOM_NEAR_RIGHT]

const LEFT_PINKY_KEYS = ['KeyQ', 'KeyA', 'KeyZ']
const RIGHT_PINKY_KEYS = ['KeyP', 'Semicolon', 'Slash']

const LEFT_INDEX_ZONE = ['KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB']
const RIGHT_INDEX_ZONE = ['KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM']

const FULL_ALPHA_KEYS = [
    'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT',
    'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG',
    'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP',
    'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon',
    'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB',
    'KeyN', 'KeyM', 'Comma', 'Period', 'Slash',
]

const COPY_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyC'],
    triggerCode: 'KeyC',
    label: 'CTRL + C',
    shortLabel: 'CTRL+C',
    helper: 'Hold Ctrl + C',
    powerName: 'Copy Power',
}

const PASTE_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyV'],
    triggerCode: 'KeyV',
    label: 'CTRL + V',
    shortLabel: 'CTRL+V',
    helper: 'Hold Ctrl + V',
    powerName: 'Paste Power',
}

const UNDO_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyZ'],
    triggerCode: 'KeyZ',
    label: 'CTRL + Z',
    shortLabel: 'CTRL+Z',
    helper: 'Hold Ctrl + Z',
    powerName: 'Undo Power',
}

const WORD_POWER_TARGET_BY_ACTION = {
    copy: COPY_POWER_TARGET,
    paste: PASTE_POWER_TARGET,
    undo: UNDO_POWER_TARGET,
}

function buildWordPowerMissions(sequenceKey) {
    return WORD_POWER_MISSION_STEPS[sequenceKey].map((step) => ({
        ...WORD_POWER_TARGET_BY_ACTION[step.action],
        taskLabel: step.taskLabel,
        sourceText: step.sourceText,
        clipboardText: step.clipboardText,
        targetText: step.targetText,
        successMessage: step.successMessage,
        afterState: step.afterState,
    }))
}

export const INITIAL_LEVEL_INDEX = 0

export const LEVELS = [
    {
        id: 'home-friends',
        world: 1,
        icon: '🏠',
        title: 'Home',
        challenge: 'Home row only',
        keys: [...HOME_KEYS],
        roundSize: 10,
    },
    {
        id: 'thumb-bounce',
        world: 1,
        icon: '👣',
        title: 'Thumb',
        challenge: 'Home row plus space',
        keys: [...HOME_KEYS, ...SPACE_KEY],
        roundSize: 12,
    },
    {
        id: 'tiny-reaches-up',
        world: 1,
        icon: '☁️',
        title: 'Up',
        challenge: 'Reach a little upward',
        keys: [...HOME_KEYS, ...TOP_NEAR],
        roundSize: 12,
    },
    {
        id: 'tiny-reaches-down',
        world: 1,
        icon: '🌱',
        title: 'Down',
        challenge: 'Reach a little downward',
        keys: [...HOME_KEYS, ...BOTTOM_NEAR],
        roundSize: 12,
    },
    {
        id: 'home-mix',
        world: 1,
        icon: '⭐',
        title: 'Mix',
        challenge: 'Home, up, down, and space together',
        keys: [...HOME_KEYS, ...TOP_NEAR, ...BOTTOM_NEAR, ...SPACE_KEY],
        roundSize: 14,
    },

    {
        id: 'pinky-power-left',
        world: 2,
        icon: '🧡',
        title: 'Left Pinky',
        challenge: 'Left pinky control',
        keys: [...LEFT_PINKY_KEYS, 'KeyS', 'KeyX', 'Space'],
        roundSize: 12,
    },
    {
        id: 'pinky-power-right',
        world: 2,
        icon: '💖',
        title: 'Right Pinky',
        challenge: 'Right pinky control',
        keys: [...RIGHT_PINKY_KEYS, 'KeyL', 'Period', 'Space'],
        roundSize: 12,
    },
    {
        id: 'pointer-patrol',
        world: 2,
        icon: '👉',
        title: 'Pointers',
        challenge: 'Busy index fingers',
        keys: [...LEFT_INDEX_ZONE, ...RIGHT_INDEX_ZONE, 'Space'],
        roundSize: 14,
    },
    {
        id: 'hand-bounce',
        world: 2,
        icon: '🎾',
        title: 'Bounce',
        challenge: 'Alternate left and right hands',
        keys: ['KeyA', 'KeyJ', 'KeyS', 'KeyK', 'KeyD', 'KeyL', 'KeyF', 'Semicolon', 'Space'],
        roundSize: 14,
    },
    {
        id: 'rainbow-mix',
        world: 2,
        icon: '🌈',
        title: 'Rainbow',
        challenge: 'All learned letters together',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        roundSize: 16,
    },

    {
        id: 'word-sprouts',
        world: 3,
        icon: '🌼',
        title: 'Tiny Words',
        challenge: 'Read and type tiny words',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        promptPool: PROMPT_POOLS.wordSprouts,
        promptCount: 5,
    },
    {
        id: 'space-builder',
        world: 3,
        icon: '🧱',
        title: 'Space Words',
        challenge: 'Type two-word phrases',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        promptPool: PROMPT_POOLS.spaceBuilder,
        promptCount: 4,
    },
    {
        id: 'fast-fingers',
        world: 3,
        icon: '⚡',
        title: 'Fast Words',
        challenge: 'Type short real words faster',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        promptPool: PROMPT_POOLS.fastFingers,
        promptCount: 4,
    },
    {
        id: 'tricky-mix',
        world: 3,
        icon: '🌀',
        title: 'Tricky Words',
        challenge: 'Practice harder words and jumps',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        promptPool: PROMPT_POOLS.trickyMix,
        promptCount: 4,
    },
    {
        id: 'story-trail',
        world: 3,
        icon: '📖',
        title: 'Story Time',
        challenge: 'Type short phrases and sentences',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        promptPool: PROMPT_POOLS.storyTrail,
        promptCount: 3,
    },

    {
        id: 'copy-power',
        world: 4,
        icon: '📋',
        title: 'Copy',
        challenge: 'Learn Ctrl + C',
        power: 'copy',
        keys: ['ControlLeft', 'KeyC'],
        targets: [COPY_POWER_TARGET],
        roundSize: 1,
    },
    {
        id: 'paste-power',
        world: 4,
        icon: '📥',
        title: 'Paste',
        challenge: 'Learn Ctrl + V',
        power: 'paste',
        keys: ['ControlLeft', 'KeyV'],
        targets: [PASTE_POWER_TARGET],
        roundSize: 1,
    },
    {
        id: 'undo-power',
        world: 4,
        icon: '↩️',
        title: 'Undo',
        challenge: 'Learn Ctrl + Z',
        power: 'undo',
        keys: ['ControlLeft', 'KeyZ'],
        targets: [UNDO_POWER_TARGET],
        roundSize: 1,
    },
    {
        id: 'power-mix',
        world: 4,
        icon: '✨',
        title: 'Powers',
        challenge: 'Mix copy, paste, and undo',
        power: 'mix',
        keys: ['ControlLeft', 'KeyC', 'KeyV', 'KeyZ'],
        targets: [COPY_POWER_TARGET, PASTE_POWER_TARGET, UNDO_POWER_TARGET],
        roundSize: 12,
    },
    {
        id: 'super-keyboard-hero',
        world: 4,
        icon: '🏆',
        title: 'Hero',
        challenge: 'Typing and powers together',
        power: 'final',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY, 'ControlLeft'],
        targets: [
            { type: 'single', code: 'KeyF' },
            { type: 'single', code: 'KeyJ' },
            { type: 'single', code: 'Space' },
            COPY_POWER_TARGET,
            PASTE_POWER_TARGET,
            UNDO_POWER_TARGET,
        ],
        roundSize: 20,
    },

    {
        id: 'word-power-copy-paste',
        world: 5,
        icon: '📝',
        title: 'Word Copy',
        challenge: 'Copy and paste whole words',
        playMode: 'wordPowers',
        keys: ['ControlLeft', 'KeyC', 'KeyV'],
        missions: buildWordPowerMissions('wordPowerCopyPaste'),
    },
    {
        id: 'word-power-letters',
        world: 5,
        icon: '🔤',
        title: 'Letters',
        challenge: 'Copy and paste characters',
        playMode: 'wordPowers',
        keys: ['ControlLeft', 'KeyC', 'KeyV'],
        missions: buildWordPowerMissions('wordPowerLetters'),
    },
    {
        id: 'word-power-finish-word',
        world: 5,
        icon: '🧩',
        title: 'Finish Word',
        challenge: 'Use copy and paste to finish words',
        playMode: 'wordPowers',
        keys: ['ControlLeft', 'KeyC', 'KeyV'],
        missions: buildWordPowerMissions('wordPowerFinishWord'),
    },
    {
        id: 'word-power-undo',
        world: 5,
        icon: '🛠️',
        title: 'Undo Fix',
        challenge: 'Fix mistakes with undo',
        playMode: 'wordPowers',
        keys: ['ControlLeft', 'KeyC', 'KeyV', 'KeyZ'],
        missions: buildWordPowerMissions('wordPowerUndo'),
    },
    {
        id: 'word-power-phrase-builder',
        world: 5,
        icon: '🏗️',
        title: 'Phrase Build',
        challenge: 'Build a whole phrase with word powers',
        playMode: 'wordPowers',
        keys: ['ControlLeft', 'KeyC', 'KeyV'],
        missions: buildWordPowerMissions('wordPowerPhraseBuilder'),
    },
]
