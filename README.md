# Key Quest

A small React + Vite seed project for a browser typing game that teaches a child to use both hands and all fingers.

## What is included

- Finger-aware keyboard map with left/right hand guidance
- Level progression by finger groups and keyboard rows
- A simple playable mission loop with score, streak, and accuracy
- Practice phrases for each lesson
- Toggleable hint mode for finger labels

## Run locally

Vite's current Getting Started guide shows the standard local flow and the default `dev`, `build`, and `preview` scripts for a Vite project. It also notes current Node.js compatibility requirements for the latest major version. See the official Vite guide for the latest details.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Project structure

- `src/App.jsx` - main game screen and lesson logic
- `src/styles.css` - all styling
- `src/main.jsx` - React entry point

## Notes

- The project uses physical key codes such as `KeyA` and `Semicolon`, which aligns well with finger-training gameplay because physical key positions remain stable across layouts.
- This is a seed project: the next obvious additions are audio feedback, a richer lesson authoring system, saved progress, and teacher/parent dashboards.

## Voice cues (V1)

The game can play static pre-generated voice clips from `public/audio/voice`.

- Single-key targets: `/audio/voice/single/<KeyCode>.wav` (for example `KeyA.wav`, `Space.wav`)
- Combo prompts:
  - `/audio/voice/combo/copy-step.wav`
  - `/audio/voice/combo/paste-step.wav`
  - `/audio/voice/combo/undo-step.wav`
  - optional fallback: `/audio/voice/combo/combo-step.wav`
- Text-step start cue: `/audio/voice/text/start-cue.wav`
- Completion cues:
  - `/audio/voice/complete/level-complete.wav`
  - `/audio/voice/complete/world-complete.wav`
  - `/audio/voice/complete/game-complete.wav`

Generate spoken clips with MeloTTS (default):

```bash
# one-time setup in your local environment
pip install "melotts @ git+https://github.com/myshell-ai/MeloTTS.git"

# generate assets
python scripts/generate_voice_assets.py
```

The generator uses custom phrasing for punctuation keys (for example: “Press the semicolon key.”) to sound more natural than symbol-only prompts.

Confirm spoken generation was used:

```bash
cat public/audio/voice/voice_manifest.json
```

It should show `"engine": "melo"`.

If generation exits before writing a manifest, verify Melo imports in the same environment:

```bash
python -c "import melo.api; print('melo import ok')"
```

If the import fails with `No module named 'pkg_resources'`, pin setuptools:

```bash
python -m pip install "setuptools<81"
```

The generator now auto-downloads required NLTK data (`averaged_perceptron_tagger_eng`, `averaged_perceptron_tagger`, `cmudict`) if missing.

If MeloTTS is unavailable locally, you can still generate non-vocal placeholder tones:

```bash
python scripts/generate_voice_assets.py --engine placeholder --allow-placeholder
```

After generation, test locally and commit the resulting `.wav` files in `public/audio/voice` so production has the assets at deploy time.

## Feature proposal: "Perfect Type Streak"

### Problem
Players can finish levels, but they currently get weak feedback on consistency. A visible streak system can motivate focused, error-free typing.

### Design
- Add a `successStreak` counter that increments for each successful target.
- Add a `bestSuccessStreak` tracker for the highest streak in the current level run.
- Any failed keypress (`failure: true` from an engine result) immediately resets `successStreak` to `0`.
- Render both in the stage header: `🔥 <current> (Max <best>)`.

### Rules
- Success path: `successStreak += 1`, `bestSuccessStreak = max(bestSuccessStreak, successStreak)`.
- Failure path: `successStreak = 0`, but `bestSuccessStreak` stays unchanged.
- Level change / replay: both values reset (fresh run).

### Why this works
- Gives instant feedback on momentum.
- Rewards precision without punishing progress.
- Works across single-key, prompt-typing, and combo levels via engine-provided failure flags.
