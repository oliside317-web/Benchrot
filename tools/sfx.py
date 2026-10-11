#!/usr/bin/env python3
"""Synthesize the video's sound-effect track from the cue list the page exports.
Usage: sfx.py cues.json out.wav total_ms
The recipes mirror SND.play() in assets/benchrot.js."""
import json, sys, wave
import numpy as np

SR = 48000

def tone(buf, at, f, dur, g, kind='sine', f2=None):
    n = int(dur * SR); i0 = int(at * SR)
    if i0 >= len(buf): return
    n = min(n, len(buf) - i0)
    t = np.arange(n) / SR
    freq = f if f2 is None else f * (f2 / f) ** (np.clip(t / (dur * .9), 0, 1))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    w = np.sin(ph) if kind == 'sine' else 2 / np.pi * np.arcsin(np.sin(ph))
    att = np.minimum(1, t / .006)
    env = att * np.exp(np.log(1e-4) * t / dur)
    buf[i0:i0 + n] += g * w * env

def cue(buf, at, kind, p):
    if kind == 'tick': tone(buf, at, 520 * 2 ** p, .06, .03)
    elif kind == 'pop': tone(buf, at, 660, .12, .035, f2=880)
    elif kind == 'page':
        tone(buf, at, 392, .2, .02, f2=523.25); tone(buf, at + .04, 784, .16, .008)
    elif kind == 'line':
        g = 220 * 2 ** (p * 2 / 12); tone(buf, at, g, .45, .025, 'tri', g * 1.5)
    elif kind == 'chord':
        for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]): tone(buf, at + i * .06, f, 1.4, .03)

def main():
    cues = json.load(open(sys.argv[1])); total = float(sys.argv[3]) / 1000
    buf = np.zeros(int((total + 2) * SR))
    for t, kind, p in cues: cue(buf, t / 1000, kind, p)
    buf = np.tanh(buf * 6) / 6 * 1.1          # gentle soft-clip, like the page's compressor
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    st = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

main()
