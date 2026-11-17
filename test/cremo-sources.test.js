'use strict';

const test = require('node:test');
const assert = require('node:assert');
const sources = require('../src/server/cremo-sources');
const { xmlText, parseDuration, stationTrack, audiusTrack } = sources._test;

test('xmlText strips CDATA, tags and entities', () => {
  assert.strictEqual(xmlText('<![CDATA[<p>Hola &amp; <b>adiós</b></p>]]>'), 'Hola & adiós');
  assert.strictEqual(xmlText('Caf&#233; &#x2014; &quot;ok&quot;'), 'Café — "ok"');
  assert.strictEqual(xmlText(undefined), '');
});

test('parseDuration reads seconds and h:mm:ss', () => {
  assert.strictEqual(parseDuration('1311'), 1311);
  assert.strictEqual(parseDuration('22:05'), 1325);
  assert.strictEqual(parseDuration('1:02:03'), 3723);
  assert.strictEqual(parseDuration(''), 0);
});

test('stationTrack builds a playable radio track', () => {
  const t = stationTrack({ stationuuid: '960c37c6-0601-11e8-ae97-52543be04c81', name: ' Cadena 100 ', url_resolved: 'http://example.com/live.mp3', country: 'Spain', tags: 'music,pop,hits' });
  assert.strictEqual(t.id, 'cr-radio:960c37c6-0601-11e8-ae97-52543be04c81');
  assert.strictEqual(t.title, 'Cadena 100');
  assert.strictEqual(t.artist, 'Spain · music · pop');
  assert.strictEqual(t.platform, 'radio');
  assert.ok(sources.isCremoId(t.id));
  assert.strictEqual(stationTrack({ stationuuid: 'x', name: 'No url', url: 'ftp://nope' }), null);
});

test('audiusTrack skips gated tracks and points at the stream endpoint', () => {
  const t = audiusTrack({ id: 'Ma0blKV', title: 'Song', user: { name: 'Artist' }, duration: 227, artwork: { '480x480': 'https://img/480.jpg' } });
  assert.strictEqual(t.id, 'cr-audius:Ma0blKV');
  assert.match(t.url, /\/v1\/tracks\/Ma0blKV\/stream\?app_name=Cremo$/);
  assert.strictEqual(audiusTrack({ id: 'a', title: 'Paid', is_stream_gated: true }), null);
});

test('streamInfo answers with the proxied URL, or HLS directly', () => {
  const res = { writeHead(code) { this.code = code; }, end(body) { this.body = JSON.parse(body); } };
  sources.streamInfo(res, 'cr-audius:abc', 'https://api.audius.co/v1/tracks/abc/stream?app_name=Cremo', 38472);
  assert.strictEqual(res.body.success, true);
  assert.match(res.body.streamUrl, /^http:\/\/127\.0\.0\.1:38472\/api\/audio-proxy\?cremo=1&url=/);
  sources.streamInfo(res, 'cr-pod:abc', 'https://cdn.example.com/live/index.m3u8', 38472);
  assert.strictEqual(res.body.isHls, true);
  assert.strictEqual(res.body.streamUrl, 'https://cdn.example.com/live/index.m3u8');
  sources.streamInfo(res, 'cr-pod:abc', 'file:///etc/passwd', 38472);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(sources.isCremoId('dQw4w9WgXcQ'), false);
});
