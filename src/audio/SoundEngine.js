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

    // ── 귀뚜라미 레이어 ──────────────────────────────────────────
    // 귀뚜라미 여러 마리: 4000~4800Hz 대역, 빠른 AM 변조로 '찌르르' 표현
    const cricketFreqs = [4150, 4320, 4550, 4780, 4050]
    cricketFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const oscGain = this._gain(0)
      osc.type = 'sine'
      osc.frequency.value = freq

      // AM LFO — 각 귀뚜라미마다 약간 다른 chirp 속도 (28~36Hz)
      const chirpLfo = ctx.createOscillator()
      const chirpLfoGain = this._gain(0.08 + Math.random() * 0.04)
      chirpLfo.type = 'sine'
      chirpLfo.frequency.value = 28 + i * 1.8
      oscGain.gain.value = 0.09

      chirpLfo.connect(chirpLfoGain)
      chirpLfoGain.connect(oscGain.gain)

      // 귀뚜라미별 느린 ON/OFF 패턴 LFO (각자 다른 위상)
      const phaseLfo = ctx.createOscillator()
      const phaseLfoGain = this._gain(0.07)
      phaseLfo.type = 'sine'
      phaseLfo.frequency.value = 0.12 + i * 0.04

      phaseLfo.connect(phaseLfoGain)
      phaseLfoGain.connect(oscGain.gain)

      osc.connect(oscGain)
      oscGain.connect(this.masterGain)
      osc.start(); chirpLfo.start(); phaseLfo.start()
      nodes.push(osc, oscGain, chirpLfo, chirpLfoGain, phaseLfo, phaseLfoGain)
    })

    // 배경 고주파 노이즈 (벌레 무리의 잡음)
    const bgNoise = this._noise('pink')
    const bgHpf = this._hpf(3000)
    const bgLpf = this._lpf(6000)
    const bgGain = this._gain(0.06)
    bgNoise.connect(bgHpf); bgHpf.connect(bgLpf); bgLpf.connect(bgGain)
    bgGain.connect(this.masterGain)
    bgNoise.start()
    nodes.push(bgNoise, bgHpf, bgLpf, bgGain)

    // ── 개구리 레이어 ──────────────────────────────────────────
    // 개구리 2마리: 250~350Hz 범위, 랜덤 타이밍으로 "개굴" 연출
    const frogConfigs = [
      { baseFreq: 260, modFreq: 18, interval: 2800, offset: 0 },
      { baseFreq: 310, modFreq: 22, interval: 3700, offset: 1400 },
    ]

    frogConfigs.forEach(cfg => {
      // 개구리 FM 합성: carrier + modulator
      const carrier = ctx.createOscillator()
      const modulator = ctx.createOscillator()
      const modGain = this._gain(80) // FM depth
      const frogEnv = this._gain(0)
      const frogLpf = this._lpf(700)

      carrier.type = 'sine'
      carrier.frequency.value = cfg.baseFreq
      modulator.type = 'sine'
      modulator.frequency.value = cfg.modFreq

      modulator.connect(modGain)
      modGain.connect(carrier.frequency)
      carrier.connect(frogLpf)
      frogLpf.connect(frogEnv)
      frogEnv.connect(this.masterGain)

      carrier.start(); modulator.start()

      // 개구리 울음 envelope 스케줄링 (반복 타이머)
      const croak = () => {
        const now = ctx.currentTime
        // "개굴개굴" — 짧은 버스트 2번
        const burst = (t) => {
          frogEnv.gain.setValueAtTime(0, t)
          frogEnv.gain.linearRampToValueAtTime(0.18, t + 0.04)
          frogEnv.gain.linearRampToValueAtTime(0.12, t + 0.08)
          frogEnv.gain.linearRampToValueAtTime(0, t + 0.14)
        }
        burst(now)
        burst(now + 0.2)  // 두 번째 음절
      }

      // offset으로 두 개구리 타이밍 엇갈리게
      const timerId = setTimeout(() => {
        croak()
        const id = setInterval(croak, cfg.interval)
        nodes.push({ stop: () => clearInterval(id), disconnect: () => {} })
      }, cfg.offset)

      nodes.push(
        carrier, modulator, modGain, frogEnv, frogLpf,
        { stop: () => clearTimeout(timerId), disconnect: () => {} }
      )
    })

    // ── 배경 저음 (밤의 공기감) ──────────────────────────────
    const nightNoise = this._noise('brown')
    const nightLpf = this._lpf(300)
    const nightGain = this._gain(0.08)
    nightNoise.connect(nightLpf); nightLpf.connect(nightGain)
    nightGain.connect(this.masterGain)
    nightNoise.start()
    nodes.push(nightNoise, nightLpf, nightGain)

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
