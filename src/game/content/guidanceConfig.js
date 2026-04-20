export const GUIDANCE_TEXT = {
    watchGlowingKey: 'Watch the glowing key',
    tapPrefix: 'Tap',
    tryPrefix: 'Try',
    typePrefix: 'Type',
}

export const SINGLE_KEY_SPOKEN_LABELS = {
    KeyQ: 'Q',
    KeyW: 'W',
    KeyE: 'E',
    KeyR: 'R',
    KeyT: 'T',
    KeyA: 'A',
    KeyS: 'S',
    KeyD: 'D',
    KeyF: 'F',
    KeyG: 'G',
    KeyY: 'Y',
    KeyU: 'U',
    KeyI: 'I',
    KeyO: 'O',
    KeyP: 'P',
    KeyH: 'H',
    KeyJ: 'J',
    KeyK: 'K',
    KeyL: 'L',
    Semicolon: ';',
    KeyZ: 'Z',
    KeyX: 'X',
    KeyC: 'C',
    KeyV: 'V',
    KeyB: 'B',
    KeyN: 'N',
    KeyM: 'M',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Space: ' ',
}

export const PHRASE_CUE_TEXT = {
    'combo/copy-step': 'Hold Ctrl + C',
    'combo/paste-step': 'Hold Ctrl + V',
    'combo/undo-step': 'Hold Ctrl + Z',
    'combo/combo-step': 'Use combo keys together',
    'text/start-cue': 'Type dog',
    'complete/level-complete': 'Level complete. Great job!',
    'complete/world-complete': 'World complete. Amazing work!',
    'complete/game-complete': 'You finished Key Quest. Fantastic typing!',
}

export const PROMPT_POOLS = {
    wordSprouts: ['cat', 'dog', 'sun', 'map', 'run', 'hat', 'jam', 'box'],
    spaceBuilder: ['red sun', 'big dog', 'fun run', 'hot jam', 'mad cat', 'run fast'],
    fastFingers: ['jump', 'rocket', 'planet', 'animal', 'yellow', 'window'],
    trickyMix: ['quick fox', 'puzzle box', 'vivid planet', 'jump high', 'magic rabbit'],
    storyTrail: [
        'the cat can run',
        'we jump in the sun',
        'the rabbit is quick',
        'you can do it',
        'the dog is my pal',
    ],
}

export const WORD_POWER_MISSION_STEPS = {
    wordPowerCopyPaste: [
        { action: 'copy', taskLabel: 'Copy "cat"', sourceText: 'cat', clipboardText: '', targetText: '', successMessage: 'Copied "cat"!', afterState: { sourceText: 'cat', clipboardText: 'cat', targetText: '' } },
        { action: 'paste', taskLabel: 'Paste "cat"', sourceText: 'cat', clipboardText: 'cat', targetText: '', successMessage: 'Pasted "cat"!', afterState: { sourceText: 'cat', clipboardText: 'cat', targetText: 'cat' } },
        { action: 'copy', taskLabel: 'Copy "sun"', sourceText: 'sun', clipboardText: 'cat', targetText: 'cat', successMessage: 'Copied "sun"!', afterState: { sourceText: 'sun', clipboardText: 'sun', targetText: 'cat' } },
        { action: 'paste', taskLabel: 'Paste "sun"', sourceText: 'sun', clipboardText: 'sun', targetText: 'cat', successMessage: 'Pasted "sun"!', afterState: { sourceText: 'sun', clipboardText: 'sun', targetText: 'cat sun' } },
    ],
    wordPowerLetters: [
        { action: 'copy', taskLabel: 'Copy "A".', sourceText: 'A', clipboardText: '', targetText: '', successMessage: 'Copied "A"!', afterState: { sourceText: 'A', clipboardText: 'A', targetText: '' } },
        { action: 'paste', taskLabel: 'Paste "A"', sourceText: 'A', clipboardText: 'A', targetText: '', successMessage: 'Pasted "A"!', afterState: { sourceText: 'A', clipboardText: 'A', targetText: 'A' } },
        { action: 'copy', taskLabel: 'Copy "T"', sourceText: 'T', clipboardText: 'A', targetText: 'A', successMessage: 'Copied "T"!', afterState: { sourceText: 'T', clipboardText: 'T', targetText: 'A' } },
        { action: 'paste', taskLabel: 'Paste "T"', sourceText: 'T', clipboardText: 'T', targetText: 'A', successMessage: 'Pasted "T"!', afterState: { sourceText: 'T', clipboardText: 'T', targetText: 'AT' } },
    ],
    wordPowerFinishWord: [
        { action: 'copy', taskLabel: 'Copy "t"', sourceText: 't', clipboardText: '', targetText: 'ca', successMessage: 'Copied "t"!', afterState: { sourceText: 't', clipboardText: 't', targetText: 'ca' } },
        { action: 'paste', taskLabel: 'Paste to make "cat"', sourceText: 't', clipboardText: 't', targetText: 'ca', successMessage: 'Made "cat"!', afterState: { sourceText: 't', clipboardText: 't', targetText: 'cat' } },
        { action: 'copy', taskLabel: 'Copy "s"', sourceText: 's', clipboardText: 't', targetText: 'cat', successMessage: 'Copied "s"!', afterState: { sourceText: 's', clipboardText: 's', targetText: 'cat' } },
        { action: 'paste', taskLabel: 'Paste to make "cats"', sourceText: 's', clipboardText: 's', targetText: 'cat', successMessage: 'Made "cats"!', afterState: { sourceText: 's', clipboardText: 's', targetText: 'cats' } },
    ],
    wordPowerUndo: [
        { action: 'copy', taskLabel: 'Copy "dog"', sourceText: 'dog', clipboardText: '', targetText: '', successMessage: 'Copied "dog"!', afterState: { sourceText: 'dog', clipboardText: 'dog', targetText: '' } },
        { action: 'paste', taskLabel: 'Paste "dog"', sourceText: 'dog', clipboardText: 'dog', targetText: '', successMessage: 'Pasted "dog"!', afterState: { sourceText: 'dog', clipboardText: 'dog', targetText: 'dog' } },
        { action: 'undo', taskLabel: 'Undo the mistake', sourceText: 'dog', clipboardText: 'dog', targetText: 'dog', successMessage: 'Undid it!', afterState: { sourceText: 'cat', clipboardText: 'dog', targetText: '' } },
        { action: 'copy', taskLabel: 'Copy "cat"', sourceText: 'cat', clipboardText: 'dog', targetText: '', successMessage: 'Copied "cat"!', afterState: { sourceText: 'cat', clipboardText: 'cat', targetText: '' } },
        { action: 'paste', taskLabel: 'Paste "cat"', sourceText: 'cat', clipboardText: 'cat', targetText: '', successMessage: 'Fixed it!', afterState: { sourceText: 'cat', clipboardText: 'cat', targetText: 'cat' } },
    ],
    wordPowerPhraseBuilder: [
        { action: 'copy', taskLabel: 'Copy "big"', sourceText: 'big', clipboardText: '', targetText: '', successMessage: 'Copied "big"!', afterState: { sourceText: 'big', clipboardText: 'big', targetText: '' } },
        { action: 'paste', taskLabel: 'Paste "big"', sourceText: 'big', clipboardText: 'big', targetText: '', successMessage: 'Pasted "big"!', afterState: { sourceText: 'big', clipboardText: 'big', targetText: 'big' } },
        { action: 'copy', taskLabel: 'Copy "red"', sourceText: 'red', clipboardText: 'big', targetText: 'big', successMessage: 'Copied "red"!', afterState: { sourceText: 'red', clipboardText: 'red', targetText: 'big' } },
        { action: 'paste', taskLabel: 'Paste "red"', sourceText: 'red', clipboardText: 'red', targetText: 'big', successMessage: 'Pasted "red"!', afterState: { sourceText: 'red', clipboardText: 'red', targetText: 'big red' } },
        { action: 'copy', taskLabel: 'Copy "dog"', sourceText: 'dog', clipboardText: 'red', targetText: 'big red', successMessage: 'Copied "dog"!', afterState: { sourceText: 'dog', clipboardText: 'dog', targetText: 'big red' } },
        { action: 'paste', taskLabel: 'Paste "dog"', sourceText: 'dog', clipboardText: 'dog', targetText: 'big red', successMessage: 'Built the phrase!', afterState: { sourceText: 'dog', clipboardText: 'dog', targetText: 'big red dog' } },
    ],
}
