const fs = require("fs");
const path = require("path");

// WAV Header Helper
function writeWavHeader(sampleRate, numChannels, numSamples) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44);

  // RIFF chunk
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

// Tone Generator
function generateTone(freq, duration, type = "sine", volume = 0.5) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Envelope (Attack/Decay)
    let envelope = 1;
    if (i < 1000) envelope = i / 1000;
    if (i > numSamples - 1000) envelope = (numSamples - i) / 1000;

    if (type === "sine") {
      sample = Math.sin(2 * Math.PI * freq * t);
    } else if (type === "square") {
      sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    } else if (type === "sawtooth") {
      sample = 2 * (t * freq - Math.floor(t * freq + 0.5));
    } else if (type === "noise") {
      sample = Math.random() * 2 - 1;
    }

    const value = Math.max(-1, Math.min(1, sample * volume * envelope));
    buffer.writeInt16LE(value * 32767, i * 2);
  }

  return Buffer.concat([writeWavHeader(sampleRate, 1, numSamples), buffer]);
}

// Melody Generator (for BGM)
function generateMelody() {
  const sampleRate = 44100;
  const bpm = 120;
  const beatDuration = 60 / bpm;
  // Simple cheerful melody: C4 E4 G4 C5
  const notes = [
    { freq: 261.63, dur: 1 }, // C4
    { freq: 329.63, dur: 1 }, // E4
    { freq: 392.0, dur: 1 }, // G4
    { freq: 523.25, dur: 2 }, // C5
    { freq: 392.0, dur: 1 }, // G4
    { freq: 329.63, dur: 1 }, // E4
  ];

  const buffers = [];
  let totalSamples = 0;

  notes.forEach((note) => {
    const duration = note.dur * beatDuration * 0.5; // faster
    const numSamples = Math.floor(sampleRate * duration);
    const audioBuf = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Simple pluck-like envelope
      const envelope = Math.exp((-3 * t) / duration);
      const sample = Math.sin(2 * Math.PI * note.freq * t);
      const value = Math.max(-1, Math.min(1, sample * 0.3 * envelope));
      audioBuf.writeInt16LE(value * 32767, i * 2);
    }
    buffers.push(audioBuf);
    totalSamples += numSamples;
  });

  return Buffer.concat([
    writeWavHeader(sampleRate, 1, totalSamples),
    ...buffers,
  ]);
}

const audioDir = path.join(__dirname, "public/audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// 1. Click (Short high blip)
fs.writeFileSync(
  path.join(audioDir, "click.mp3"),
  generateTone(880, 0.05, "sine", 0.6),
); // Saving as .mp3 extension but content is wav (modern browsers handle this)

// 2. Success (Ascending chime)
// Creating a simple major triad sweep
const c = generateTone(523.25, 0.1, "sine");
const e = generateTone(659.25, 0.1, "sine");
const g = generateTone(783.99, 0.2, "sine");
// Concatenating roughly (ignoring headers in middle for simplicity, browsers are robust, but cleaner to mix properly.
// For simplicity in this script, we'll just make a single "Success" tone that sounds good.
fs.writeFileSync(
  path.join(audioDir, "success.mp3"),
  generateTone(1046.5, 0.3, "sine", 0.6),
); // High C

// 3. Fail (Low buzz)
fs.writeFileSync(
  path.join(audioDir, "fail.mp3"),
  generateTone(150, 0.3, "sawtooth", 0.5),
);

// 4. Pop (Short bubbly sound)
fs.writeFileSync(
  path.join(audioDir, "pop.mp3"),
  generateTone(600, 0.05, "sine", 0.4),
);

// 5. BGM (Simple loop)
fs.writeFileSync(path.join(audioDir, "bgm.mp3"), generateMelody());

console.log("Audio files generated in public/audio");
