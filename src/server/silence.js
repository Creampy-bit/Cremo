'use strict';
// Cremo: finds the silent stretches of a track with ffmpeg's silencedetect,
// so the player can skip the silence at the start and end of a song and long
// silent gaps in the middle (the ones before "hidden tracks").

const { spawn } = require('child_process');

const NOISE_DB = -60;   // quieter than this counts as silence
const MIN_LEAD = 0.5;   // seconds of silence at the start worth skipping
const MIN_TAIL = 1;     // ... at the end
const MIN_GAP = 8;      // ... in the middle (shorter pauses are part of the music)
const MAX_TRACK = 20 * 60; // longer files (mixes, podcasts) are not scanned

const hms = (h, m, s) => Number(h) * 3600 + Number(m) * 60 + Number(s);

// Reads ffmpeg's stderr: the file's duration, how far ffmpeg actually got
// (the last progress "time="), and each silence_start/silence_end.
function parse(stderr) {
  const text = String(stderr);
  const d = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = d ? hms(d[1], d[2], d[3]) : 0;
  let decoded = 0;
  for (const m of text.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)) decoded = hms(m[1], m[2], m[3]);
  const silences = [];
  let open = null;
  for (const line of text.split(/\r\n|\r|\n/)) {
    let m = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/);
    if (m) { open = Math.max(0, Number(m[1])); continue; }
    m = line.match(/silence_end:\s*(\d+(?:\.\d+)?)/);
    if (m && open !== null) { silences.push([open, Number(m[1])]); open = null; }
  }
  if (open !== null) silences.push([open, null]); // still silent when the read stopped
  return { duration, decoded, silences };
}

// Turns raw silences into ranges the player should jump over.
// head = only the first seconds were read, so only the leading silence is known.
// A silence still open when ffmpeg stopped ends where ffmpeg stopped: if the
// read was cut short, that is not the end of the song and nothing is skipped.
function skipRanges({ duration, decoded = 0, silences }, head = false) {
  const out = [];
  for (const [s, e0] of silences) {
    const e = e0 === null ? (decoded || (head ? null : duration)) : e0;
    if (e === null || !(e > s)) continue;
    if (s <= 0.05) {
      if (e >= MIN_LEAD && (!duration || e < duration - 1)) out.push([0, round(Math.max(0, e - 0.1))]);
    } else if (head) {
      continue;
    } else if (duration && e >= duration - 0.75) {
      if (e - s >= MIN_TAIL) out.push([round(s + 0.2), round(duration)]);
    } else if (e - s >= MIN_GAP) {
      out.push([round(s + 0.2), round(e - 0.1)]);
    }
  }
  return out;
}

const round = (n) => Math.round(n * 100) / 100;

function run(ffmpegBin, input, head, timeoutMs) {
  return new Promise((resolve, reject) => {
    const args = ['-hide_banner', '-nostdin', '-i', input];
    if (head) args.push('-t', String(head));
    args.push('-map', '0:a:0', '-af', `silencedetect=noise=${NOISE_DB}dB:d=${MIN_LEAD}`, '-f', 'null', '-');
    const proc = spawn(ffmpegBin, args, { windowsHide: true });
    let err = '';
    proc.stderr.on('data', (c) => { if (err.length < 2e6) err += c; });
    const timer = setTimeout(() => { try { proc.kill('SIGKILL'); } catch (_) {} }, timeoutMs);
    proc.on('error', (e) => { clearTimeout(timer); reject(e); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error('ffmpeg exit ' + code));
      resolve(parse(err));
    });
  });
}

// One scan at a time, and each answer is remembered for the session.
const results = new Map();
let queue = Promise.resolve();

function scan(ffmpegBin, input, { key = input, head = 0, timeoutMs = 90000 } = {}) {
  const k = key + (head ? '#head' : '');
  if (results.has(k)) return results.get(k);
  const p = queue.then(() => run(ffmpegBin, input, head, timeoutMs)).then((raw) => {
    if (raw.duration > MAX_TRACK) return { duration: raw.duration, skip: [] };
    return { duration: raw.duration, skip: skipRanges(raw, !!head) };
  });
  queue = p.catch(() => {});
  results.set(k, p);
  p.catch(() => results.delete(k));
  if (results.size > 300) results.delete(results.keys().next().value);
  return p;
}

module.exports = { scan, _test: { parse, skipRanges } };
