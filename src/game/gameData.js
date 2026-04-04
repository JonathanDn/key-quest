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

const WORD_KEYS_EASY = [
    'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyH',
    'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN',
    'KeyP', 'KeyR', 'KeyS', 'KeyT', 'KeyU',
    'KeyW', 'KeyY',
]

const WORD_KEYS_MIX = [
    'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE',
    'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ',
    'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO',
    'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT',
    'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY',
    'KeyZ', 'Comma', 'Period', 'Semicolon', 'Slash',
]

const COPY_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyC'],
    triggerCode: 'KeyC',
    label: 'CTRL + C',
    shortLabel: 'CTRL+C',
    helper: 'Hold Ctrl, tap C',
    powerName: 'Copy Power',
}

const PASTE_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyV'],
    triggerCode: 'KeyV',
    label: 'CTRL + V',
    shortLabel: 'CTRL+V',
    helper: 'Hold Ctrl, tap V',
    powerName: 'Paste Power',
}

const UNDO_POWER_TARGET = {
    type: 'combo',
    codes: ['ControlLeft', 'KeyZ'],
    triggerCode: 'KeyZ',
    label: 'CTRL + Z',
    shortLabel: 'CTRL+Z',
    helper: 'Hold Ctrl, tap Z',
    powerName: 'Undo Power',
}

export const KEYBOARD_ROWS = [
    [
        { code: 'KeyQ', label: 'Q' },
        { code: 'KeyW', label: 'W' },
        { code: 'KeyE', label: 'E' },
        { code: 'KeyR', label: 'R' },
        { code: 'KeyT', label: 'T' },
        { code: 'KeyY', label: 'Y' },
        { code: 'KeyU', label: 'U' },
        { code: 'KeyI', label: 'I' },
        { code: 'KeyO', label: 'O' },
        { code: 'KeyP', label: 'P' },
    ],
    [
        { code: 'KeyA', label: 'A' },
        { code: 'KeyS', label: 'S' },
        { code: 'KeyD', label: 'D' },
        { code: 'KeyF', label: 'F' },
        { code: 'KeyG', label: 'G' },
        { code: 'KeyH', label: 'H' },
        { code: 'KeyJ', label: 'J' },
        { code: 'KeyK', label: 'K' },
        { code: 'KeyL', label: 'L' },
        { code: 'Semicolon', label: ';' },
    ],
    [
        { code: 'KeyZ', label: 'Z' },
        { code: 'KeyX', label: 'X' },
        { code: 'KeyC', label: 'C' },
        { code: 'KeyV', label: 'V' },
        { code: 'KeyB', label: 'B' },
        { code: 'KeyN', label: 'N' },
        { code: 'KeyM', label: 'M' },
        { code: 'Comma', label: ',' },
        { code: 'Period', label: '.' },
        { code: 'Slash', label: '/' },
    ],
    [
        { code: 'ControlLeft', label: 'CTRL' },
        { code: 'Space', label: 'SPACE', wide: true },
    ],
]

export const FINGER_COLORS = {
    lp: '#ff8a3d',
    lr: '#ffd84d',
    lm: '#54e3c2',
    li: '#58c7ff',
    ri: '#8f8cff',
    rm: '#c78cff',
    rr: '#ff8bc2',
    rp: '#ff7c93',
    th: '#5ee36d',
}

export const FINGER_LABELS = {
    lp: 'left pinky',
    lr: 'left ring',
    lm: 'left middle',
    li: 'left pointer',
    ri: 'right pointer',
    rm: 'right middle',
    rr: 'right ring',
    rp: 'right pinky',
    th: 'thumb',
}

export const KEY_TO_FINGER = {
    ControlLeft: 'lp',
    KeyQ: 'lp',
    KeyA: 'lp',
    KeyZ: 'lp',
    KeyW: 'lr',
    KeyS: 'lr',
    KeyX: 'lr',
    KeyE: 'lm',
    KeyD: 'lm',
    KeyC: 'lm',
    KeyR: 'li',
    KeyF: 'li',
    KeyV: 'li',
    KeyT: 'li',
    KeyG: 'li',
    KeyB: 'li',
    KeyY: 'ri',
    KeyH: 'ri',
    KeyN: 'ri',
    KeyU: 'ri',
    KeyJ: 'ri',
    KeyM: 'ri',
    KeyI: 'rm',
    KeyK: 'rm',
    Comma: 'rm',
    KeyO: 'rr',
    KeyL: 'rr',
    Period: 'rr',
    KeyP: 'rp',
    Semicolon: 'rp',
    Slash: 'rp',
    Space: 'th',
}

export const LEVELS = [
    {
        id: 'home-friends',
        world: 1,
        icon: '🏠',
        title: 'Home 1',
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
        title: 'Up 1',
        challenge: 'Reach a little upward',
        keys: [...HOME_KEYS, ...TOP_NEAR],
        roundSize: 12,
    },
    {
        id: 'tiny-reaches-down',
        world: 1,
        icon: '🌱',
        title: 'Down 1',
        challenge: 'Reach a little downward',
        keys: [...HOME_KEYS, ...BOTTOM_NEAR],
        roundSize: 12,
    },
    {
        id: 'home-mix',
        world: 1,
        icon: '⭐',
        title: 'Mix 1',
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
        title: 'Mix 2',
        challenge: 'All learned letters together',
        keys: [...FULL_ALPHA_KEYS, ...SPACE_KEY],
        roundSize: 16,
    },

    {
        id: 'word-sprouts',
        world: 3,
        icon: '🌼',
        title: 'Words 1',
        challenge: 'Tiny words',
        keys: [...WORD_KEYS_EASY, ...SPACE_KEY],
        roundSize: 14,
    },
    {
        id: 'space-builder',
        world: 3,
        icon: '🧱',
        title: 'Words 2',
        challenge: 'Short two-word phrases',
        keys: [...WORD_KEYS_EASY, ...SPACE_KEY],
        roundSize: 16,
    },
    {
        id: 'fast-fingers',
        world: 3,
        icon: '⚡',
        title: 'Fast',
        challenge: 'Slightly faster simple words',
        keys: [...WORD_KEYS_EASY, ...SPACE_KEY],
        roundSize: 18,
    },
    {
        id: 'tricky-mix',
        world: 3,
        icon: '🌀',
        title: 'Tricky',
        challenge: 'Words with row jumps and pinkies',
        keys: [...WORD_KEYS_MIX, ...SPACE_KEY],
        roundSize: 18,
    },
    {
        id: 'story-trail',
        world: 3,
        icon: '📖',
        title: 'Story',
        challenge: 'Short phrase flow',
        keys: [...WORD_KEYS_MIX, ...SPACE_KEY],
        roundSize: 20,
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
]

export const codeToLabel = Object.fromEntries(
    KEYBOARD_ROWS.flat().map((key) => [key.code, key.label]),
)