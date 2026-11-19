'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { cleanSearchResults, scoreImportedCandidate, findDownloadedFileName } = require('../src/server/server');

test('removes duplicate releases without changing the displayed title', () => {
  const tracks = [
    { id: 'first', title: 'Maple (Official Audio)', artist: 'Chainsaww', platform: 'soundcloud' },
    { id: 'second', title: 'Maple', artist: 'Chainsaww', platform: 'soundcloud' }
  ];

  const result = cleanSearchResults(tracks, 'chainsaww Maple');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].title, 'Maple (Official Audio)');
});

test('removes hour-long and compilation results', () => {
  const tracks = [
    { id: 'song', title: 'Masquerade', artist: 'Sioxxie', platform: 'soundcloud' },
    { id: 'long', title: 'SCP-3008 Friday Theme 1 hour', artist: 'Sioxxie', platform: 'soundcloud' },
    { id: 'mix', title: 'Compilation of Sioxxie songs', artist: 'Sioxxie', platform: 'soundcloud' }
  ];

  assert.deepStrictEqual(
    cleanSearchResults(tracks, 'Sioxxie').map(track => track.id),
    ['song']
  );
});

test('rejects imported stream candidates with a very different duration', () => {
  const expected = { title: 'as the light fades', artist: 'a vow', duration: 138 };

  const correctMatch = scoreImportedCandidate(expected.title, expected.artist, expected.duration, {
    title: 'as the light fades',
    artist: 'a vow',
    duration: 140
  });
  const wrongArtist = scoreImportedCandidate(expected.title, expected.artist, expected.duration, {
    title: 'as the light fades',
    artist: 'another artist',
    duration: 140
  });

  assert.ok(scoreImportedCandidate(expected.title, expected.artist, expected.duration, {
    title: 'as the light fades',
    artist: 'a vow',
    duration: 3588
  }) < 0);
  assert.ok(correctMatch >= 70);
  assert.ok(wrongArtist < 70);
});

test('downloaded track lookup requires an exact artist and title', () => {
  const files = new Map([
    ['a vow - as the light fades (1 hour mix)', 'wrong-audio.mp3']
  ]);

  assert.strictEqual(findDownloadedFileName(files, 'as the light fades', 'a vow'), null);
});
