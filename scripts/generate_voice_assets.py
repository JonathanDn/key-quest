#!/usr/bin/env python3
"""
Generate V1 voice asset files for the Key Quest runtime audio hooks.

This generator currently creates deterministic placeholder WAV clips that are
safe to commit and wire into the app. The file layout matches the runtime
paths used by `useVoiceCues`.
"""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 24_000
MASTER_GAIN = 0.22

SINGLE_KEY_CODES = [
    "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT",
    "KeyA", "KeyS", "KeyD", "KeyF", "KeyG",
    "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
    "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
    "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB",
    "KeyN", "KeyM", "Comma", "Period", "Slash",
    "Space",
]

PHRASE_CUES = {
    "combo/copy-step": [466.16, 554.37, 659.25],
    "combo/paste-step": [523.25, 659.25, 783.99],
    "combo/undo-step": [659.25, 587.33, 523.25],
    "combo/combo-step": [493.88, 587.33, 698.46],
    "text/start-cue": [440.00, 554.37],
    "complete/level-complete": [523.25, 659.25, 783.99, 1046.50],
    "complete/world-complete": [392.00, 523.25, 659.25, 783.99, 1046.50],
    "complete/game-complete": [523.25, 659.25, 783.99, 1046.50, 1318.51],
}


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def smooth_envelope(t: float, duration: float, attack: float = 0.02, release: float = 0.03) -> float:
    if duration <= 0:
        return 0.0

    if t < attack:
        return t / max(attack, 1e-6)

    if t > duration - release:
        return max(0.0, (duration - t) / max(release, 1e-6))

    return 1.0


def tone(frequency: float, duration_s: float) -> list[float]:
    sample_count = int(duration_s * SAMPLE_RATE)
    audio = []

    for idx in range(sample_count):
        t = idx / SAMPLE_RATE
        env = smooth_envelope(t, duration_s)
        sine = math.sin(2 * math.pi * frequency * t)
        harmonic = 0.45 * math.sin(2 * math.pi * frequency * 2.01 * t)
        audio.append((sine + harmonic) * env * MASTER_GAIN)

    return audio


def silence(duration_s: float) -> list[float]:
    return [0.0] * int(duration_s * SAMPLE_RATE)


def write_wav(path: Path, samples: list[float]) -> None:
    ensure_parent(path)

    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)

        frames = bytearray()
        for sample in samples:
            clamped = max(-1.0, min(1.0, sample))
            frames.extend(struct.pack("<h", int(clamped * 32767)))

        wav_file.writeframes(frames)


def code_frequency(code: str) -> float:
    seed = sum(ord(ch) for ch in code)
    return 360.0 + (seed % 20) * 19.0


def build_single_clip(code: str) -> list[float]:
    base = code_frequency(code)
    return (
        tone(base, 0.17)
        + silence(0.05)
        + tone(base * 1.18, 0.15)
    )


def build_phrase_clip(notes: list[float]) -> list[float]:
    out: list[float] = []

    for idx, note in enumerate(notes):
        out.extend(tone(note, 0.16))
        if idx < len(notes) - 1:
            out.extend(silence(0.05))

    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    audio_root = root / "public" / "audio" / "voice"

    for code in SINGLE_KEY_CODES:
        write_wav(
            audio_root / "single" / f"{code}.wav",
            build_single_clip(code),
        )

    for relative_key, notes in PHRASE_CUES.items():
        write_wav(
            audio_root / f"{relative_key}.wav",
            build_phrase_clip(notes),
        )

    print(f"Generated {len(SINGLE_KEY_CODES) + len(PHRASE_CUES)} audio assets in {audio_root}")


if __name__ == "__main__":
    main()
