"""Generate basic UI sound effects as WAV (no external deps).

Outputs: assets/sounds/{tap, correct, wrong, complete, milestone}.wav
Replace with professional sounds later.
"""
import wave
import struct
import math
import os

SAMPLE_RATE = 44100
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'sounds')


def write_wav(path, samples):
    """Save mono samples (-1..1 floats) as 16-bit PCM WAV."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        for s in samples:
            v = max(-1, min(1, s))
            w.writeframes(struct.pack('<h', int(v * 32767)))


def env(t, total, attack=0.005, release=0.05):
    """Simple AR envelope to avoid clicks."""
    if t < attack:
        return t / attack
    if t > total - release:
        return max(0, (total - t) / release)
    return 1.0


def gen_tone(freq, duration, volume=0.3, fade_curve=None):
    """Generate a sine tone with envelope."""
    n = int(SAMPLE_RATE * duration)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        amp = env(t, duration) * volume
        if fade_curve:
            amp *= fade_curve(t / duration)
        out.append(amp * math.sin(2 * math.pi * freq * t))
    return out


def gen_chord(freqs, duration, volume=0.25):
    n = int(SAMPLE_RATE * duration)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        amp = env(t, duration) * volume
        v = sum(math.sin(2 * math.pi * f * t) for f in freqs) / len(freqs)
        out.append(amp * v)
    return out


def gen_sweep(start_freq, end_freq, duration, volume=0.3):
    """Frequency sweep (linear)."""
    n = int(SAMPLE_RATE * duration)
    out = []
    phase = 0
    for i in range(n):
        t = i / SAMPLE_RATE
        f = start_freq + (end_freq - start_freq) * (t / duration)
        amp = env(t, duration) * volume
        phase += 2 * math.pi * f / SAMPLE_RATE
        out.append(amp * math.sin(phase))
    return out


def concat(*chunks):
    out = []
    for c in chunks:
        out.extend(c)
    return out


def main():
    # tap — short sharp click
    tap = gen_tone(800, 0.04, volume=0.25)
    write_wav(os.path.join(OUT_DIR, 'tap.wav'), tap)

    # correct — pleasant ascending two-tone
    correct = concat(
        gen_tone(700, 0.08, volume=0.3),
        gen_tone(1050, 0.18, volume=0.35),
    )
    write_wav(os.path.join(OUT_DIR, 'correct.wav'), correct)

    # wrong — short low buzz
    wrong = gen_tone(180, 0.18, volume=0.3, fade_curve=lambda x: 1 - x * 0.5)
    write_wav(os.path.join(OUT_DIR, 'wrong.wav'), wrong)

    # complete — celebratory arpeggio
    complete = concat(
        gen_tone(523.25, 0.1, volume=0.3),  # C5
        gen_tone(659.25, 0.1, volume=0.3),  # E5
        gen_tone(783.99, 0.1, volume=0.3),  # G5
        gen_chord([523.25, 659.25, 783.99], 0.4, volume=0.25),  # C major chord
    )
    write_wav(os.path.join(OUT_DIR, 'complete.wav'), complete)

    # milestone — bigger fanfare
    milestone = concat(
        gen_tone(523.25, 0.12, volume=0.3),
        gen_tone(659.25, 0.12, volume=0.3),
        gen_tone(783.99, 0.12, volume=0.3),
        gen_tone(1046.50, 0.18, volume=0.35),  # C6
        gen_chord([523.25, 659.25, 783.99, 1046.50], 0.7, volume=0.3),
    )
    write_wav(os.path.join(OUT_DIR, 'milestone.wav'), milestone)

    print('Generated 5 WAV files in', OUT_DIR)


if __name__ == '__main__':
    main()
