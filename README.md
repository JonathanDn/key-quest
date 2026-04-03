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
