#!/usr/bin/env node
/* Render the Benchrot video deterministically: every frame is the page's own
   timeline seeked to t = i / fps, screenshotted by headless Chromium and piped
   into ffmpeg; then the music and the synthesized sound effects are mixed in.

   node tools/render_video.js [--ar 16x9|9x16|1x1] [--lang en|zh] [--fps 30]
                              [--out video/benchrot-16x9-en.mp4] [--stills 1000,5000]
   Needs: Playwright (Chromium), ffmpeg, python3 + numpy. */
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }

const ROOT = path.resolve(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1]]]) : a), []));
const AR = args.ar || '16x9', LANG = args.lang || 'en', FPS = +(args.fps || 30);
const OUT = path.resolve(ROOT, args.out || `video/benchrot-${AR}-${LANG}.mp4`);
const MUSIC = path.join(ROOT, '1385b5d9c5851e3ac757295ef4d5d4ec.m4a');
const SIZE = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] }[AR];
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'benchrot-'));

(async () => {
  const exe = fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
  const browser = await pw.chromium.launch(Object.assign({ args: ['--font-render-hinting=none', '--disable-lcd-text'] }, exe));
  const page = await browser.newPage({ viewport: { width: SIZE[0], height: SIZE[1] }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html') + `?capture=1&ar=${AR}&lang=${LANG}`);
  await page.waitForFunction(() => window.__BENCHROT);
  await page.evaluate(() => document.fonts.ready);
  const info = await page.evaluate(() => ({ total: __BENCHROT.total, sfx: __BENCHROT.sfx }));
  const shot = async (ms, file) => { await page.evaluate(t => __BENCHROT.seek(t), ms); return page.screenshot({ type: 'jpeg', quality: 95, path: file }); };

  if (args.stills) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    for (const ms of args.stills.split(',').map(Number)) await shot(ms, OUT.replace(/\.mp4$/, '') + `-${ms}.jpg`);
    await browser.close(); fs.rmSync(TMP, { recursive: true, force: true }); console.log('stills written'); return;
  }

  const frames = Math.ceil(info.total / 1000 * FPS);
  console.log(`${AR} ${LANG}: ${(info.total / 1000).toFixed(2)} s, ${frames} frames @ ${FPS} fps`);
  const silent = path.join(TMP, 'video.mp4');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const buf = await shot(i * 1000 / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (FPS * 10) === 0) console.log(`  frame ${i}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  await browser.close();

  // audio: music (faded out at the end) + quiet synthesized cues
  const cues = path.join(TMP, 'cues.json'), sfx = path.join(TMP, 'sfx.wav');
  fs.writeFileSync(cues, JSON.stringify(info.sfx));
  execFileSync('python3', [path.join(__dirname, 'sfx.py'), cues, sfx, String(info.total)], { stdio: 'inherit' });
  const dur = (info.total / 1000).toFixed(3), fadeAt = (info.total / 1000 - 2.5).toFixed(3);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', silent, '-i', MUSIC, '-i', sfx, '-filter_complex',
    `[1:a]atrim=0:${dur},asetpts=PTS-STARTPTS,afade=t=out:st=${fadeAt}:d=2.5,volume=0.9[m];[2:a]atrim=0:${dur},volume=0.8[s];[m][s]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('wrote', path.relative(ROOT, OUT), `in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})().catch(e => { console.error(e); process.exit(1); });
