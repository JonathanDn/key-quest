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
- This is a seed project: the next obvious additions are richer lesson authoring, saved progress, and teacher/parent dashboards.

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

## Generate world-1 voice audio (Tap prompts only)

This repo includes a Node.js script that generates audio clips for **World 1 Tap prompts only** (it skips all `Try ...` lines).

### 1) Clone and install this repo

```bash
git clone <your-key-quest-repo-url>
cd key-quest
npm install
```

### 2) Set up and run fish-speech locally

From your local `fish-speech` repo:

```bash
python tools/api_server.py \
  --llama-checkpoint-path checkpoints/s2-pro \
  --decoder-checkpoint-path checkpoints/s2-pro/codec.pth \
  --listen 127.0.0.1:8080
```

### 3) Generate the audio files

Back in this `key-quest` repo:

```bash
node scripts/generate_world1_audio_fish_speech.mjs --output-dir ./tmp/world1-audio
```

The script writes one file per prompt and creates `world1_manifest.json`.

### Keep all audio in the same speaker voice

Use a single reference voice ID for the whole run:

```bash
node scripts/generate_world1_audio_fish_speech.mjs \
  --output-dir ./tmp/world1-audio \
  --reference-id <YOUR_REFERENCE_ID>
```

As long as you pass the same `--reference-id`, all generated files in that run will request the same voice.

### Ordered World 1 strings for audio generation (Tap only)

1. `Tap ,`
2. `Tap ;`
3. `Tap A`
4. `Tap B`
5. `Tap C`
6. `Tap D`
7. `Tap E`
8. `Tap F`
9. `Tap I`
10. `Tap J`
11. `Tap K`
12. `Tap L`
13. `Tap M`
14. `Tap N`
15. `Tap R`
16. `Tap S`
17. `Tap SPACE`
18. `Tap T`
19. `Tap U`
20. `Tap V`
21. `Tap Y`

You can print this list anytime with:

```bash
node scripts/export_world_guidance_texts.mjs 1 --tap-only
```
