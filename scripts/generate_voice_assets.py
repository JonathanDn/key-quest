#!/usr/bin/env python3
"""
Generate V1 voice assets for Key Quest.

Default mode uses MeloTTS for real spoken clips.
Fallback mode can synthesize deterministic placeholder tones for environments
where MeloTTS is not installed.
"""

from __future__ import annotations

import argparse
import json
import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 24_000
MASTER_GAIN = 0.22

SINGLE_KEY_LABELS = {
    "KeyQ": "Q",
    "KeyW": "W",
    "KeyE": "E",
    "KeyR": "R",
    "KeyT": "T",
    "KeyA": "A",
    "KeyS": "S",
    "KeyD": "D",
    "KeyF": "F",
    "KeyG": "G",
    "KeyY": "Y",
    "KeyU": "U",
    "KeyI": "I",
    "KeyO": "O",
    "KeyP": "P",
    "KeyH": "H",
    "KeyJ": "J",
    "KeyK": "K",
    "KeyL": "L",
    "Semicolon": "semicolon",
    "KeyZ": "Z",
    "KeyX": "X",
    "KeyC": "C",
    "KeyV": "V",
    "KeyB": "B",
    "KeyN": "N",
    "KeyM": "M",
    "Comma": "comma",
    "Period": "period",
    "Slash": "slash",
    "Space": "space",
}

PHRASE_TEXT = {
    "combo/copy-step": "Copy step. Hold control and press C.",
    "combo/paste-step": "Paste step. Hold control and press V.",
    "combo/undo-step": "Undo step. Hold control and press Z.",
    "combo/combo-step": "Use the combo keys together.",
    "text/start-cue": "Type this prompt.",
    "complete/level-complete": "Level complete. Great job!",
    "complete/world-complete": "World complete. Amazing work!",
    "complete/game-complete": "You finished Key Quest. Fantastic typing!",
}

PHRASE_CUE_NOTES = {
    "combo/copy-step": [466.16, 554.37, 659.25],
    "combo/paste-step": [523.25, 659.25, 783.99],
    "combo/undo-step": [659.25, 587.33, 523.25],
    "combo/combo-step": [493.88, 587.33, 698.46],
    "text/start-cue": [440.00, 554.37],
    "complete/level-complete": [523.25, 659.25, 783.99, 1046.50],
    "complete/world-complete": [392.00, 523.25, 659.25, 783.99, 1046.50],
    "complete/game-complete": [523.25, 659.25, 783.99, 1046.50, 1318.51],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Key Quest voice assets.")
    parser.add_argument(
        "--engine",
        choices=["melo", "placeholder"],
        default="melo",
        help="Audio generation engine (default: melo).",
    )
    parser.add_argument(
        "--language",
        default="EN",
        help="MeloTTS language code (default: EN).",
    )
    parser.add_argument(
        "--speaker",
        default="EN-US",
        help="MeloTTS speaker key (default: EN-US).",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.0,
        help="MeloTTS speech speed (default: 1.0).",
    )
    parser.add_argument(
        "--allow-placeholder",
        action="store_true",
        help="Required safety flag when using --engine placeholder.",
    )
    parser.add_argument(
        "--keep-existing",
        action="store_true",
        help="Do not remove existing generated .wav files before generation.",
    )
    return parser.parse_args()


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
    return tone(base, 0.17) + silence(0.05) + tone(base * 1.18, 0.15)


def build_phrase_clip(notes: list[float]) -> list[float]:
    out: list[float] = []

    for idx, note in enumerate(notes):
        out.extend(tone(note, 0.16))
        if idx < len(notes) - 1:
            out.extend(silence(0.05))

    return out


def generate_with_placeholder(audio_root: Path) -> int:
    for code in SINGLE_KEY_LABELS:
        write_wav(audio_root / "single" / f"{code}.wav", build_single_clip(code))

    for relative_key, notes in PHRASE_CUE_NOTES.items():
        write_wav(audio_root / f"{relative_key}.wav", build_phrase_clip(notes))

    return len(SINGLE_KEY_LABELS) + len(PHRASE_CUE_NOTES)


def generate_with_melo(audio_root: Path, language: str, speaker: str, speed: float) -> int:
    from melo.api import TTS

    model = TTS(language=language, device="auto")
    speaker_id = model.hps.data.spk2id[speaker]

    for code, spoken_label in SINGLE_KEY_LABELS.items():
        text = f"Press {spoken_label}."
        output_path = audio_root / "single" / f"{code}.wav"
        ensure_parent(output_path)
        model.tts_to_file(text, speaker_id, str(output_path), speed=speed)

    for relative_key, text in PHRASE_TEXT.items():
        output_path = audio_root / f"{relative_key}.wav"
        ensure_parent(output_path)
        model.tts_to_file(text, speaker_id, str(output_path), speed=speed)

    return len(SINGLE_KEY_LABELS) + len(PHRASE_TEXT)


def clear_existing_audio(audio_root: Path) -> None:
    if not audio_root.exists():
        return

    for wav_file in audio_root.rglob("*.wav"):
        wav_file.unlink()


def write_manifest(audio_root: Path, engine: str, language: str, speaker: str, speed: float) -> None:
    manifest = {
        "engine": engine,
        "language": language,
        "speaker": speaker,
        "speed": speed,
        "single_count": len(SINGLE_KEY_LABELS),
        "phrase_count": len(PHRASE_TEXT),
    }
    ensure_parent(audio_root / "voice_manifest.json")
    (audio_root / "voice_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    audio_root = root / "public" / "audio" / "voice"

    if not args.keep_existing:
        clear_existing_audio(audio_root)

    if args.engine == "melo":
        try:
            count = generate_with_melo(audio_root, args.language, args.speaker, args.speed)
            write_manifest(audio_root, "melo", args.language, args.speaker, args.speed)
            print(f"Generated {count} spoken audio assets in {audio_root}")
            return
        except ModuleNotFoundError as error:
            missing_name = getattr(error, "name", None) or "unknown"
            if missing_name == "melo":
                raise SystemExit(
                    "Could not import `melo`. Install MeloTTS in the active environment with:\n"
                    "  python -m pip install \"melotts @ git+https://github.com/myshell-ai/MeloTTS.git\"\n"
                    "Then rerun this script."
                ) from error

            raise SystemExit(
                "MeloTTS import failed because a dependency is missing.\n"
                f"Missing module: {missing_name}\n"
                "Install the missing module in the same environment and rerun, or run\n"
                "`--engine placeholder --allow-placeholder` for non-vocal fallback audio."
            ) from error

    if not args.allow_placeholder:
        raise SystemExit(
            "Placeholder engine requires --allow-placeholder to prevent accidental "
            "non-vocal generation."
        )

    count = generate_with_placeholder(audio_root)
    write_manifest(audio_root, "placeholder", args.language, args.speaker, args.speed)
    print(f"Generated {count} placeholder audio assets in {audio_root}")


if __name__ == "__main__":
    main()
