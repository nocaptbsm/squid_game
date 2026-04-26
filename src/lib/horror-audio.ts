/**
 * Horror Audio Engine — INTENSE MODE
 * Procedurally generated via Web Audio API. All volumes maxed for maximum impact.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** White noise buffer */
function noiseBuffer(ac: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ac.sampleRate
  const buffer = ac.createBuffer(1, sampleRate * duration, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** Hard clip distortion — makes everything sound crushed and gritty */
function makeDistortion(ac: AudioContext, amount = 400): WaveShaperNode {
  const dist = ac.createWaveShaper()
  const samples = 512
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x))
  }
  dist.curve = curve
  dist.oversample = '4x'
  return dist
}

/** Master compressor — soft limiting to prevent clipping crackle */
function makeMaster(ac: AudioContext): DynamicsCompressorNode {
  const comp = ac.createDynamicsCompressor()
  comp.threshold.setValueAtTime(-6, ac.currentTime)
  comp.knee.setValueAtTime(6, ac.currentTime)
  comp.ratio.setValueAtTime(8, ac.currentTime)        // softer ratio — less pumping/crackle
  comp.attack.setValueAtTime(0.003, ac.currentTime)   // slightly longer attack — no harsh transients
  comp.release.setValueAtTime(0.25, ac.currentTime)
  comp.connect(ac.destination)
  return comp
}

// ─── HEARTBEAT — Smooth, deep, chest-felt thud ──────────────────────────────

export function playHeartbeat() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    // Pure sine thud — NO distortion, NO noise click → smooth & clean
    function thud(t: number, freq: number, peakGain: number) {
      // Primary sub-bass body — sine only
      const sub = ac.createOscillator()
      const subGain = ac.createGain()
      sub.type = 'sine'
      sub.frequency.setValueAtTime(freq, t)
      sub.frequency.exponentialRampToValueAtTime(freq * 0.28, t + 0.18) // pitch drop = thud feel
      subGain.gain.setValueAtTime(0, t)
      subGain.gain.linearRampToValueAtTime(peakGain, t + 0.008)          // fast but NOT instant
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.30)         // long natural decay
      sub.connect(subGain)
      subGain.connect(master)
      sub.start(t)
      sub.stop(t + 0.35)

      // Harmonic overtone — quiet sine octave up for fullness
      const harm = ac.createOscillator()
      const harmGain = ac.createGain()
      harm.type = 'sine'
      harm.frequency.setValueAtTime(freq * 2, t)
      harm.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.12)
      harmGain.gain.setValueAtTime(0, t)
      harmGain.gain.linearRampToValueAtTime(peakGain * 0.18, t + 0.008)
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      harm.connect(harmGain)
      harmGain.connect(master)
      harm.start(t)
      harm.stop(t + 0.2)
    }

    thud(now,        55, 0.85)   // LUB — primary beat
    thud(now + 0.15, 46, 0.60)   // DUB — echo beat, slightly quieter/lower

    // Very gentle sub-rumble — pure sine, no distortion
    const rumble = ac.createOscillator()
    const rumbleGain = ac.createGain()
    rumble.type = 'sine'
    rumble.frequency.setValueAtTime(30, now)
    rumbleGain.gain.setValueAtTime(0, now)
    rumbleGain.gain.linearRampToValueAtTime(0.22, now + 0.05)
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    rumble.connect(rumbleGain)
    rumbleGain.connect(master)
    rumble.start(now)
    rumble.stop(now + 0.6)
  } catch {}
}

// ─── EKG FLATLINE — Long sustained, creepy ─────────────────────────────────

export function playFlatline() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.5, now + 0.05)
    g.gain.setValueAtTime(0.5, now + 0.9)
    g.gain.linearRampToValueAtTime(0, now + 1.1)
    osc.connect(g)
    g.connect(master)
    osc.start(now)
    osc.stop(now + 1.2)
  } catch {}
}

// ─── STATIC BURST — White noise flash ──────────────────────────────────────

export function playStatic(duration = 0.2, volume = 0.9) {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    const source = ac.createBufferSource()
    source.buffer = noiseBuffer(ac, duration + 0.05)

    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(0.4, now)

    const g = ac.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(volume, now + 0.008)
    g.gain.exponentialRampToValueAtTime(0.001, now + duration)

    source.connect(filter)
    filter.connect(g)
    g.connect(master)
    source.start(now)
    source.stop(now + duration + 0.05)
  } catch {}
}

// ─── HORROR STING — Elimination sound ─────────────────────────────────────

export function playHorrorSting() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    // Instant noise explosion
    const burst = ac.createBufferSource()
    burst.buffer = noiseBuffer(ac, 0.1)
    const burstFilter = ac.createBiquadFilter()
    burstFilter.type = 'lowpass'
    burstFilter.frequency.setValueAtTime(3000, now)
    const burstGain = ac.createGain()
    burstGain.gain.setValueAtTime(1.2, now)
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    burst.connect(burstFilter)
    burstFilter.connect(burstGain)
    burstGain.connect(master)
    burst.start(now)

    // Deep impact boom
    const boom = ac.createOscillator()
    const boomGain = ac.createGain()
    boom.type = 'sine'
    boom.frequency.setValueAtTime(80, now)
    boom.frequency.exponentialRampToValueAtTime(20, now + 0.5)
    boomGain.gain.setValueAtTime(0, now)
    boomGain.gain.linearRampToValueAtTime(1.5, now + 0.01)
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    boom.connect(boomGain)
    boomGain.connect(master)
    boom.start(now)
    boom.stop(now + 0.7)

    // Screeching descent — 5 harmonics
    for (let i = 0; i < 5; i++) {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      const dist = makeDistortion(ac, 800)
      const t = now + i * 0.06

      osc.type = i % 2 === 0 ? 'sawtooth' : 'square'
      osc.frequency.setValueAtTime(900 - i * 100, t)
      osc.frequency.exponentialRampToValueAtTime(60 - i * 8, t + 1.0)

      g.gain.setValueAtTime(0.55 - i * 0.05, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1)

      osc.connect(dist)
      dist.connect(g)
      g.connect(master)
      osc.start(t)
      osc.stop(t + 1.2)
    }

    // Sub rumble throughout
    const sub = ac.createOscillator()
    const subGain = ac.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(35, now)
    sub.frequency.linearRampToValueAtTime(18, now + 1.5)
    subGain.gain.setValueAtTime(0, now)
    subGain.gain.linearRampToValueAtTime(0.9, now + 0.08)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
    sub.connect(subGain)
    subGain.connect(master)
    sub.start(now)
    sub.stop(now + 1.7)

    // Trailing noise
    setTimeout(() => playStatic(0.35, 1.0), 80)
  } catch {}
}

// ─── RELIEF TONE — Survived ────────────────────────────────────────────────

export function playRelief() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    // Short initial tension-break noise
    playStatic(0.06, 0.4)

    // C-E-G major chord, warm
    const notes = [261, 329, 392, 523]
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      const t = now + i * 0.07

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)

      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.25, t + 0.04)
      g.gain.setValueAtTime(0.25, t + 0.35)
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1)

      osc.connect(g)
      g.connect(master)
      osc.start(t)
      osc.stop(t + 1.2)
    })
  } catch {}
}

// ─── INTRO DRONE — Landing page ───────────────────────────────────────────

export function playIntroDrone() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    // Massive sub bass
    const sub = ac.createOscillator()
    const subGain = ac.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(22, now)
    sub.frequency.linearRampToValueAtTime(28, now + 2.8)
    subGain.gain.setValueAtTime(0, now)
    subGain.gain.linearRampToValueAtTime(0.9, now + 0.5)
    subGain.gain.setValueAtTime(0.9, now + 2.2)
    subGain.gain.linearRampToValueAtTime(0, now + 2.9)
    sub.connect(subGain)
    subGain.connect(master)
    sub.start(now)
    sub.stop(now + 3.0)

    // Eerie high tone descending
    const eerie = ac.createOscillator()
    const eerieGain = ac.createGain()
    eerie.type = 'sine'
    eerie.frequency.setValueAtTime(520, now + 0.3)
    eerie.frequency.linearRampToValueAtTime(280, now + 2.8)
    eerieGain.gain.setValueAtTime(0, now + 0.3)
    eerieGain.gain.linearRampToValueAtTime(0.18, now + 0.9)
    eerieGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9)
    eerie.connect(eerieGain)
    eerieGain.connect(master)
    eerie.start(now + 0.3)
    eerie.stop(now + 3.0)

    // Mid growl — detuned sawtooth for dissonance
    const growl = ac.createOscillator()
    const growlGain = ac.createGain()
    growl.type = 'sawtooth'
    growl.frequency.setValueAtTime(55, now + 0.6)
    growl.frequency.linearRampToValueAtTime(42, now + 2.8)
    growlGain.gain.setValueAtTime(0, now + 0.6)
    growlGain.gain.linearRampToValueAtTime(0.22, now + 1.0)
    growlGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9)
    growl.connect(growlGain)
    growlGain.connect(master)
    growl.start(now + 0.6)
    growl.stop(now + 3.0)

    // Static crackles
    setTimeout(() => playStatic(0.15, 0.7), 400)
    setTimeout(() => playStatic(0.10, 0.5), 1300)
    setTimeout(() => playStatic(0.20, 0.9), 2600)
  } catch {}
}

// ─── ERROR — Access denied ─────────────────────────────────────────────────

export function playError() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    // Harsh buzzer descend
    const osc = ac.createOscillator()
    const g = ac.createGain()
    const dist = makeDistortion(ac, 900)
    osc.type = 'square'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.linearRampToValueAtTime(80, now + 0.35)
    g.gain.setValueAtTime(0.8, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(dist)
    dist.connect(g)
    g.connect(master)
    osc.start(now)
    osc.stop(now + 0.45)

    playStatic(0.15, 0.8)
  } catch {}
}

// ─── SUCCESS — Login ok ───────────────────────────────────────────────────

export function playSuccess() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    ;[440, 550].forEach((freq, i) => {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      const t = now + i * 0.13
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.35, t + 0.03)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(g)
      g.connect(master)
      osc.start(t)
      osc.stop(t + 0.35)
    })
  } catch {}
}

// ─── SCAN BLIP ────────────────────────────────────────────────────────────

export function playScanBlip() {
  try {
    const ac = getCtx()
    const master = makeMaster(ac)
    const now = ac.currentTime

    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.linearRampToValueAtTime(900, now + 0.12)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.45, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(g)
    g.connect(master)
    osc.start(now)
    osc.stop(now + 0.2)
  } catch {}
}

// ─── HEARTBEAT LOOP ───────────────────────────────────────────────────────

export function startHeartbeatLoop(bpm = 70): () => void {
  const interval = (60 / bpm) * 1000
  playHeartbeat()
  const id = setInterval(playHeartbeat, interval)
  return () => clearInterval(id)
}
