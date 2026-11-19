'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { parse, skipRanges } = require('../src/server/silence')._test;

const log = (lines) => [
  "Input #0, matroska,webm, from 'x.webm':",
  '  Duration: 00:03:00.00, start: -0.007000, bitrate: 96 kb/s',
  ...lines
].join('\n');

test('parse reads duration, progress time and silences', () => {
  const r = parse(log([
    '[silencedetect @ 0] silence_start: -0.0065',
    '[silencedetect @ 0] silence_end: 1.5 | silence_duration: 1.5',
    'size=N/A time=00:01:30.00 bitrate=N/A speed=400x\rsize=N/A time=00:03:00.00 bitrate=N/A speed=500x',
    '[silencedetect @ 0] silence_start: 170'
  ]));
  assert.strictEqual(r.duration, 180);
  assert.strictEqual(r.decoded, 180);
  assert.deepStrictEqual(r.silences, [[0, 1.5], [170, null]]);
});

test('skipRanges keeps the start, the end and long gaps only', () => {
  const ranges = skipRanges({ duration: 180, decoded: 180, silences: [[0, 1.5], [60, 63], [90, 100], [170, null]] });
  assert.deepStrictEqual(ranges, [[0, 1.4], [90.2, 99.9], [170.2, 180]]);
});

test('skipRanges ignores a short silence at the start', () => {
  assert.deepStrictEqual(skipRanges({ duration: 180, decoded: 180, silences: [[0, 0.3]] }), []);
});

test('a read cut short is not taken as the end of the song', () => {
  // ffmpeg stopped at 2:00 of a 3:00 song while it was quiet.
  assert.deepStrictEqual(skipRanges({ duration: 180, decoded: 120, silences: [[117, null]] }), []);
});

test('head scans only report the leading silence', () => {
  const r = skipRanges({ duration: 180, decoded: 30, silences: [[0, 2], [20, 29]] }, true);
  assert.deepStrictEqual(r, [[0, 1.9]]);
});

test('a file that is all silence is left alone', () => {
  assert.deepStrictEqual(skipRanges({ duration: 10, decoded: 10, silences: [[0, 10]] }), []);
});
