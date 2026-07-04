// 호흡 단계별 가이드 톤 (Web Audio API)
class BreathTones {
  constructor() {
    this.ctx = null
    this.enabled = true
  }

  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  _playTone({ freq, endFreq, duration, gainPeak, type = 'sine' }) {
    if (!this.enabled) return
    this._init()
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (endFreq) {
      osc.frequency.linearRampToValueAtTime(endFreq, now + duration)
    }

    // 부드러운 envelope: fade in → sustain → fade out
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.06)
    gain.gain.setValueAtTime(gainPeak, now + duration - 0.08)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  // 들이쉬기: 220Hz → 330Hz 상승, 부드럽고 가벼운 느낌
  inhale() {
    this._playTone({ freq: 220, endFreq: 330, duration: 0.55, gainPeak: 0.12 })
  }

  // 참기: 단일 440Hz, 아주 짧고 조용하게
  hold() {
    this._playTone({ freq: 440, duration: 0.25, gainPeak: 0.07 })
  }

  // 내쉬기: 330Hz → 196Hz 하강, 릴랙싱 느낌
  exhale() {
    this._playTone({ freq: 330, endFreq: 196, duration: 0.6, gainPeak: 0.10 })
  }

  setEnabled(val) {
    this.enabled = val
  }
}

export const breathTones = new BreathTones()
