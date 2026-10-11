# Benchrot

**LLM Beachrot Leaderboard** · 大模型 Beachrot 排行榜 — an original benchmark by @史诗级猫头嘤 on Bilibili.

Single self-contained page: `index.html` (vanilla JS + hand-written SVG, logos inlined, no external requests). Open it in any browser. English by default; the `中文` button switches language and the choice is remembered.

Labs covered (matching the icons in `logos/`): OpenAI, Anthropic, Google, xAI, DeepSeek, Alibaba (Qwen), Moonshot AI (Kimi).

## Video mode

Click **Video mode** (top right), or open `index.html?video=1&ar=16x9` (`ar`: `16x9`, `9x16`, `1x1`).

| Key | Action |
| --- | --- |
| Space | Play / pause |
| ← / → | Previous / next slide |
| A | Cycle aspect ratio |
| M | Sound on / off |
| H | Hide / show controls (or tap the frame) |
| F | Fullscreen |
| Esc | Exit (on phones: the × button or the system back gesture) |

Data as of 2026-10-11. Models, prices and version history live in the `MODELS` and `HIST` tables in `index.html`; every metric and the index are computed on page load.
