// SVG → PNG icon generator using canvas API (Node built-in via Blob)
// Uses @resvg/resvg-js if available, otherwise falls back to sharp or manual PNG

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background — deep navy #131314
  ctx.fillStyle = '#131314'
  ctx.beginPath()
  roundRect(ctx, 0, 0, size, size, size * 0.22)
  ctx.fill()

  // Outer glow ring
  const cx = size / 2, cy = size / 2
  const r1 = size * 0.38

  const grad = ctx.createRadialGradient(cx, cy - size * 0.05, r1 * 0.3, cx, cy, r1)
  grad.addColorStop(0, 'rgba(196,192,252,0.18)')
  grad.addColorStop(1, 'rgba(196,192,252,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r1 * 1.4, 0, Math.PI * 2)
  ctx.fill()

  // Outer circle stroke
  ctx.strokeStyle = 'rgba(193,198,217,0.25)'
  ctx.lineWidth = size * 0.018
  ctx.beginPath()
  ctx.arc(cx, cy, r1, 0, Math.PI * 2)
  ctx.stroke()

  // Inner circle
  const r2 = size * 0.24
  ctx.strokeStyle = 'rgba(196,192,252,0.4)'
  ctx.lineWidth = size * 0.014
  ctx.beginPath()
  ctx.arc(cx, cy, r2, 0, Math.PI * 2)
  ctx.stroke()

  // Moon crescent (bedtime icon approximation)
  const moonR = size * 0.17
  ctx.fillStyle = 'rgba(196,192,252,0.9)'
  ctx.beginPath()
  ctx.arc(cx, cy, moonR, 0, Math.PI * 2)
  ctx.fill()

  // Cut-out to make crescent
  ctx.fillStyle = '#131314'
  ctx.beginPath()
  ctx.arc(cx + moonR * 0.45, cy - moonR * 0.1, moonR * 0.78, 0, Math.PI * 2)
  ctx.fill()

  // Stars
  const stars = [
    [cx + r1 * 0.55, cy - r1 * 0.55, size * 0.022],
    [cx - r1 * 0.6,  cy - r1 * 0.35, size * 0.014],
    [cx + r1 * 0.3,  cy + r1 * 0.65, size * 0.012],
  ]
  ctx.fillStyle = 'rgba(221,226,246,0.85)'
  stars.forEach(([x, y, sr]) => {
    ctx.beginPath()
    ctx.arc(x, y, sr, 0, Math.PI * 2)
    ctx.fill()
  })

  return canvas.toBuffer('image/png')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192))
writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512))
console.log('✓ icon-192.png')
console.log('✓ icon-512.png')
