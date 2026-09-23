const lamejs = require('./node_modules/lamejs');

const sampleRate = 44100;
const durationSec = 1;
const totalSamples = sampleRate * durationSec;
const left = new Float32Array(totalSamples);

// Generate 440 Hz sine wave
for (let i = 0; i < totalSamples; i++) {
  left[i] = Math.sin(2 * Math.PI * 440 * (i / sampleRate));
}

const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
const sampleBlockSize = 1152;
const mp3Data = [];

for (let i = 0; i < totalSamples; i += sampleBlockSize) {
  const len = Math.min(sampleBlockSize, totalSamples - i);
  const leftChunk = new Int16Array(len);
  for (let j = 0; j < len; j++) {
    const s = Math.max(-1, Math.min(1, left[i + j]));
    leftChunk[j] = s < 0 ? s * 32768 : s * 32767;
  }
  const chunk = encoder.encodeBuffer(leftChunk);
  if (chunk.length > 0) mp3Data.push(Buffer.from(chunk));
}

const flush = encoder.flush();
if (flush.length > 0) mp3Data.push(Buffer.from(flush));

const totalLength = mp3Data.reduce((acc, b) => acc + b.length, 0);
console.log('MP3 encoded successfully, total bytes:', totalLength);
