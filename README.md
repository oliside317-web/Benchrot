# Benchrot

**LLM Benchrot Leaderboard** · 大模型 Benchrot 排行榜 — an original benchmark by @史诗级猫头嘤 on Bilibili.

Open `index.html` in a browser (no build step, no external requests). English by default; the `中文` button switches language and the choice is remembered.

Labs covered (matching the icons in `logos/`): OpenAI, Anthropic, Google, xAI, DeepSeek, Alibaba (Qwen), Moonshot AI (Kimi).

```
index.html             page markup
assets/benchrot.css    styles
assets/benchrot.js     data, metrics, charts, profile dialog, video player
assets/logos.js        inlined logos (generated: python3 tools/build_logos.py)
assets/bgm.mp3         MP3 fallback of the music for browsers without AAC
tools/render_video.js  renders the MP4 frame by frame from the page's timeline
tools/sfx.py           synthesizes the sound-effect track for the MP4
video/                 rendered videos
```

## Video

`video/benchrot-16x9-en.mp4` — 1920×1080, 30 fps, under 2 minutes, with the music and sound effects.

Re-render (needs Playwright's Chromium, ffmpeg, python3 + numpy):

```
node tools/render_video.js --ar 16x9 --lang en      # also 9x16 / 1x1, --lang zh
node tools/render_video.js --stills 1000,20000       # a few JPEG stills instead of a video
```

Slides are laid out on the music's grid (108 BPM, one slide = whole bars), so cuts land on downbeats.

## Video mode in the page

Click **Video mode**, or open `index.html?video=1&ar=16x9` (`ar`: `16x9`, `9x16`, `1x1`). Plays with the music; every reveal is driven by the same timeline the renderer uses.

| Key | Action |
| --- | --- |
| Space | Play / pause |
| ← / → | Previous / next slide |
| A | Cycle aspect ratio |
| B | Music on / off |
| M | Sound effects on / off |
| H | Hide / show controls (or tap the frame) |
| F | Fullscreen |
| Esc | Exit (on phones: the × button or the system back gesture) |

## Model profiles

Every radar card (and every model name in the table) opens an animated profile; ← / → or swipe to move between models. Profiles have their own URL, e.g. `index.html#profile-deepseek-v4-1-flash`.

Data as of 2026-10-11. Models, prices and version history live in `MODELS` and `HIST` in `assets/benchrot.js`; every metric and the index are computed on page load.
