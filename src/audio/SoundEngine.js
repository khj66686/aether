// Web Audio API로 환경 소리를 실시간 합성
class SoundEngine {
  constructor() {
    this.ctx = null
    this.nodes = []
    this.masterGain = null
    this.currentSound = null
  }

  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  _noise(type = 'white') {
    const bufSize = this.ctx.sampleRate * 2
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1
      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      } else if (type === 'brown') {
        b0 = (b0 + (0.02 * white)) / 1.02
        data[i] = b0 * 3.5
      } else {
        data[i] = white
      }
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    return src
  }

  _lpf(freq) {
    const f = this.ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = freq
    return f
  }

  _hpf(freq) {
    const f = this.ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = freq
    return f
  }

  _gain(val) {
    const g = this.ctx.createGain()
    g.gain.value = val
    return g
  }

  _buildRain() {
    // 굵은 빗방울: 핑크 노이즈 + 하이패스
    const rain1 = this._noise('pink')
    const hpf1 = this._hpf(1200)
    const g1 = this._gain(0.9)
    rain1.connect(hpf1); hpf1.connect(g1); g1.connect(this.masterGain)

    // 잔잔한 빗소리: 화이트 노이즈 + 로우패스
    const rain2 = this._noise('white')
    const lpf2 = this._lpf(3000)
    const g2 = this._gain(0.3)
    rain2.connect(lpf2); lpf2.connect(g2); g2.connect(this.masterGain)

    rain1.start(); rain2.start()
    return [rain1, rain2, hpf1, lpf2, g1, g2]
  }

  _buildOcean() {
    const nodes = []
    // 파도 3개를 다른 주기로
    for (let i = 0; i < 3; i++) {
      const noise = this._noise('brown')
      const lpf = this._lpf(600 + i * 120)
      const g = this._gain(0)
      const lfo = this.ctx.createOscillator()
      const lfoGain = this._gain(0.5)
      lfo.frequency.value = 0.08 + i * 0.03
      lfo.type = 'sine'
      lfo.connect(lfoGain); lfoGain.connect(g.gain)
      g.gain.value = 0.6
      noise.connect(lpf); lpf.connect(g); g.connect(this.masterGain)
      noise.start(); lfo.start()
      nodes.push(noise, lpf, g, lfo, lfoGain)
    }
    return nodes
  }

  _buildWind() {
    const noise = this._noise('pink')
    const lpf = this._lpf(800)
    const hpf = this._hpf(100)
    const g = this._gain(0.5)

    // 바람 세기 LFO
    const lfo = this.ctx.createOscillator()
    const lfoGain = this._gain(0.25)
    lfo.frequency.value = 0.12
    lfo.type = 'sine'
    lfo.connect(lfoGain); lfoGain.connect(g.gain)
    g.gain.value = 0.4

    noise.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(this.masterGain)
    noise.start(); lfo.start()
    return [noise, lpf, hpf, g, lfo, lfoGain]
  }

  _buildForest() {
    // 새소리 느낌의 고주파 핑크노이즈 + 잎사귀 바스락
    const leaves = this._noise('pink')
    const lpf1 = this._lpf(2000)
    const hpf1 = this._hpf(600)
    const g1 = this._gain(0.3)

    const breeze = this._noise('brown')
    const lpf2 = this._lpf(500)
    const g2 = this._gain(0.5)

    const lfo = this.ctx.createOscillator()
    const lfoGain = this._gain(0.15)
    lfo.frequency.value = 0.2
    lfo.type = 'sine'
    lfo.connect(lfoGain); lfoGain.connect(g1.gain)
    g1.gain.value = 0.3

    leaves.connect(hpf1); hpf1.connect(lpf1); lpf1.connect(g1); g1.connect(this.masterGain)
    breeze.connect(lpf2); lpf2.connect(g2); g2.connect(this.masterGain)
    leaves.start(); breeze.start(); lfo.start()
    return [leaves, breeze, lpf1, lpf2, hpf1, g1, g2, lfo, lfoGain]
  }

  _buildSilence() {
    // 극히 낮은 브라운 노이즈 (완전 정적보다 자연스러움)
    const noise = this._noise('brown')
    const lpf = this._lpf(200)
    const g = this._gain(0.05)
    noise.connect(lpf); lpf.connect(g); g.connect(this.masterGain)
    noise.start()
    return [noise, lpf, g]
  }

  _buildInsects() {
    const nodes = []
    const ctx = this.ctx
    let _stopped = false

    // ── 귀뚜라미 레이어 ─────────────────────────────────────────────
    // 6마리 귀뚜라미 — 각자 독립적인 랜덤 스케줄링 (LFO 없음)
    const cricketDefs = [
      { freq: 4100, bw: 280, vol: 0.11 },
      { freq: 4350, bw: 240, vol: 0.09 },
      { freq: 4600, bw: 300, vol: 0.10 },
      { freq: 3900, bw: 260, vol: 0.08 },
      { freq: 4800, bw: 220, vol: 0.09 },
      { freq: 4200, bw: 350, vol: 0.07 },
    ]

    cricketDefs.forEach(def => {
      // 귀뚜라미 소리 채널: BP 필터된 노이즈 → 개별 gain envelope
      const noiseNode = this._noise('pink')
      const bpf = ctx.createBiquadFilter()
      bpf.type = 'bandpass'
      bpf.frequency.value = def.freq
      bpf.Q.value = def.freq / def.bw

      const envGain = this._gain(0)
      noiseNode.connect(bpf)
      bpf.connect(envGain)
      envGain.connect(this.masterGain)
      noiseNode.start()
      nodes.push(noiseNode, bpf, envGain)

      // 귀뚜라미 한 번 울음 (chirp): 빠른 attack → 짧은 sustain → decay
      const chirp = (peakVol) => {
        if (_stopped) return
        const now = ctx.currentTime
        const dur = 0.025 + Math.random() * 0.015  // 25-40ms
        envGain.gain.cancelScheduledValues(now)
        envGain.gain.setValueAtTime(0, now)
        envGain.gain.linearRampToValueAtTime(peakVol, now + 0.006)
        envGain.gain.setValueAtTime(peakVol * 0.85, now + dur * 0.4)
        envGain.gain.linearRampToValueAtTime(0, now + dur)
      }

      // 한 그룹: 3-5번 연속 울고 랜덤 침묵
      const scheduleGroup = () => {
        if (_stopped) return
        // 랜덤하게 침묵하는 귀뚜라미 (약 20% 확률로 이번 사이클 건너뜀)
        if (Math.random() < 0.2) {
          const silenceMs = 800 + Math.random() * 2000
          setTimeout(scheduleGroup, silenceMs)
          return
        }
        const count = 3 + Math.floor(Math.random() * 3)   // 3~5 chirps
        const spacing = 0.055 + Math.random() * 0.035     // 55-90ms 간격
        const peakVol = def.vol * (0.75 + Math.random() * 0.5) // 볼륨 변동

        for (let i = 0; i < count; i++) {
          const delay = i * spacing * 1000
          setTimeout(() => { if (!_stopped) chirp(peakVol) }, delay)
        }

        // 다음 그룹까지 쉬는 시간: 400ms-2.5s (자연스러운 침묵 포함)
        const pauseMs = 400 + Math.random() * 2100
        setTimeout(scheduleGroup, count * spacing * 1000 + pauseMs)
      }

      // 첫 시작은 각 귀뚜라미마다 다른 랜덤 지연
      setTimeout(scheduleGroup, Math.random() * 1500)
    })

    // 배경 귀뚜라미 무리 소음 (아주 낮게, 공기감)
    const bgNoise = this._noise('pink')
    const bgHpf = this._hpf(3500)
    const bgLpf = this._lpf(7000)
    const bgGain = this._gain(0.03)
    bgNoise.connect(bgHpf); bgHpf.connect(bgLpf); bgLpf.connect(bgGain)
    bgGain.connect(this.masterGain)
    bgNoise.start()
    nodes.push(bgNoise, bgHpf, bgLpf, bgGain)

    // ── 개구리 레이어 ──────────────────────────────────────────────
    // 개구리 2마리 — 완전 랜덤 타이밍으로 "개굴" FM 합성
    const frogDefs = [
      { baseFreq: 255, modFreq: 20, vol: 0.16 },
      { baseFreq: 305, modFreq: 16, vol: 0.13 },
    ]

    frogDefs.forEach(def => {
      const carrier = ctx.createOscillator()
      const modulator = ctx.createOscillator()
      const modGain = this._gain(60)
      const frogEnv = this._gain(0)
      const frogLpf = this._lpf(800)

      carrier.type = 'sine'
      carrier.frequency.value = def.baseFreq
      modulator.type = 'sine'
      modulator.frequency.value = def.modFreq

      modulator.connect(modGain)
      modGain.connect(carrier.frequency)
      carrier.connect(frogLpf)
      frogLpf.connect(frogEnv)
      frogEnv.connect(this.masterGain)
      carrier.start(); modulator.start()
      nodes.push(carrier, modulator, modGain, frogEnv, frogLpf)

      // 한 번 개구리 울음: 단일 또는 "개굴개굴" 2-3음절
      const croak = () => {
        if (_stopped) return
        const now = ctx.currentTime
        const syllables = Math.random() < 0.4 ? 1 : (Math.random() < 0.6 ? 2 : 3)
        const vol = def.vol * (0.7 + Math.random() * 0.4)
        for (let i = 0; i < syllables; i++) {
          const t = now + i * 0.22
          frogEnv.gain.setValueAtTime(0, t)
          frogEnv.gain.linearRampToValueAtTime(vol, t + 0.035)
          frogEnv.gain.setValueAtTime(vol * 0.7, t + 0.09)
          frogEnv.gain.linearRampToValueAtTime(0, t + 0.16)
        }
      }

      const scheduleFrog = () => {
        if (_stopped) return
        croak()
        // 다음 울음까지 3-9초 완전 랜덤
        const waitMs = 3000 + Math.random() * 6000
        setTimeout(scheduleFrog, waitMs)
      }

      // 첫 울음은 1-5초 뒤 시작 (두 마리 타이밍 엇갈리게)
      const initDelay = 1000 + Math.random() * 4000
      const timerId = setTimeout(scheduleFrog, initDelay)
      nodes.push({ stop: () => clearTimeout(timerId), disconnect: () => {} })
    })

    // ── 밤의 공기감 ────────────────────────────────────────────────
    const nightNoise = this._noise('brown')
    const nightLpf = this._lpf(250)
    const nightGain = this._gain(0.06)
    nightNoise.connect(nightLpf); nightLpf.connect(nightGain)
    nightGain.connect(this.masterGain)
    nightNoise.start()
    nodes.push(nightNoise, nightLpf, nightGain)

    // stop() 호출 시 모든 setTimeout 루프도 즉시 중단
    nodes.push({ stop: () => { _stopped = true }, disconnect: () => {} })

    return nodes
  }

  play(soundId, volume = 0.6) {
    this._init()
    this.stop()

    const builders = {
      rain: () => this._buildRain(),
      ocean: () => this._buildOcean(),
      insects: () => this._buildInsects(),
      forest: () => this._buildForest(),
      silence: () => this._buildSilence(),
    }

    const builder = builders[soundId]
    if (!builder) return

    this.nodes = builder()
    this.currentSound = soundId
    this.setVolume(volume)
  }

  setVolume(vol) {
    if (!this.masterGain) return
    // 0~100 → 0~1 (로그 스케일로 자연스럽게)
    const v = Math.max(0, Math.min(1, vol / 100))
    const logVol = v === 0 ? 0 : Math.pow(v, 2)
    this.masterGain.gain.setTargetAtTime(logVol, this.ctx.currentTime, 0.1)
  }

  stop() {
    this.nodes.forEach(n => {
      try { n.stop?.() } catch (_) {}
      try { n.disconnect?.() } catch (_) {}
    })
    this.nodes = []
    this.currentSound = null
  }

  suspend() {
    this.ctx?.suspend()
  }

  resume() {
    this.ctx?.resume()
  }
}

export const soundEngine = new SoundEngine()
