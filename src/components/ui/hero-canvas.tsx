'use client'

import { useEffect, useRef } from 'react'

const PALETTE = [
  [209, 188, 255],
  [112, 0, 255],
  [60, 0, 144],
  [143, 253, 0],
  [23, 251, 251],
  [255, 177, 195],
]

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx0 = canvas.getContext('2d')
    if (!ctx0) return
    const ctx: CanvasRenderingContext2D = ctx0

    const hero0 = canvas.parentElement
    if (!hero0) return
    const hero: HTMLElement = hero0

    const NN = 160
    const nodes: {
      baseX: number; baseY: number; baseZ: number
      x: number; y: number; z: number
      r: number
    }[] = []
    const edges: { a: number; b: number }[] = []
    const sparks: {
      a: number; b: number; t: number
      speed: number; ci: number; bounce: boolean
    }[] = []

    let w = 0, h = 0, cx = 0, cy = 0
    let mouseActive = false
    let mMX = 0.5, mMY = 0.5
    let mSX = 0.5, mSY = 0.5
    let cloudOX = 0, cloudOY = 0
    let nTime = 0
    let nRotY = 0, nRotX = 0, nRotZ = 0
    let animId = 0

    function resize() {
      const c = canvas
      if (!c) return
      w = hero.offsetWidth
      h = hero.offsetHeight
      c.width = w
      c.height = h
      cx = w / 2
      cy = h / 2
    }
    resize()

    for (let i = 0; i < NN; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 60 + Math.random() * 1400
      nodes.push({
        baseX: Math.sin(phi) * Math.cos(theta) * r,
        baseY: Math.sin(phi) * Math.sin(theta) * r * 0.65,
        baseZ: Math.cos(phi) * r * 0.55,
        x: 0, y: 0, z: 0,
        r,
      })
    }

    const MAX_EDGE = 600
    for (let i = 0; i < NN; i++) {
      for (let j = i + 1; j < NN; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX
        const dy = nodes[i].baseY - nodes[j].baseY
        const dz = nodes[i].baseZ - nodes[j].baseZ
        if (dx * dx + dy * dy + dz * dz < MAX_EDGE * MAX_EDGE) {
          edges.push({ a: i, b: j })
        }
      }
    }

    let sparkTimer = 3

    function maybeCreateSpark() {
      if (edges.length === 0) return
      let active = 0
      for (const s of sparks) if (s) active++
      if (active >= 3) return
      const e = edges[Math.floor(Math.random() * edges.length)]
      sparks.push({
        a: e.a, b: e.b, t: 0,
        speed: 0.001 + Math.random() * 0.003,
        ci: 3 + Math.floor(Math.random() * 2),
        bounce: Math.random() > 0.3,
      })
    }

    function norm3(x: number, y: number, z: number) {
      const len = Math.sqrt(x * x + y * y + z * z) || 1
      return { x: x / len, y: y / len, z: z / len }
    }

    function anim() {
      nTime += 0.016
      const dt = 0.016

      const lerp = mouseActive ? 0.1 : 0.02
      mSX += (mMX - mSX) * lerp
      mSY += (mMY - mSY) * lerp

      const tx = (mSX - 0.5) * 2
      const ty = (mSY - 0.5) * 2
      const follow = mouseActive ? 0.06 : 0.01
      cloudOX += (tx * 320 - cloudOX) * follow
      cloudOY += (ty * 200 - cloudOY) * follow

      nRotY += 0.00025
      nRotX = 0.12 + Math.sin(nTime * 0.01) * 0.06
      nRotZ = Math.sin(nTime * 0.008) * 0.03

      ctx.clearRect(0, 0, w, h)
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const cosY = Math.cos(nRotY), sinY = Math.sin(nRotY)
      const cosX = Math.cos(nRotX), sinX = Math.sin(nRotX)
      const cosZ = Math.cos(nRotZ), sinZ = Math.sin(nRotZ)

      const mAngleH = (mSX - 0.5) * Math.PI * 0.9
      const mAngleV = (mSY - 0.5) * Math.PI * 0.6
      const mDirX = Math.sin(mAngleV) * Math.cos(mAngleH)
      const mDirY = Math.sin(mAngleV) * Math.sin(mAngleH)
      const mDirZ = Math.cos(mAngleV)

      const pr: { x: number; y: number; z: number; s: number }[] = []

      for (let i = 0; i < NN; i++) {
        const no = nodes[i]
        const nd = norm3(no.baseX, no.baseY, no.baseZ)

        const cosAng = nd.x * mDirX + nd.y * mDirY + nd.z * mDirZ
        const dAngle = Math.acos(Math.max(-1, Math.min(1, cosAng)))

        const w1 = Math.sin(dAngle * 1.8 - nTime * 0.18)
        const w2 = Math.sin(dAngle * 3.2 + nTime * 0.09)
        const w3 = Math.sin(dAngle * 5.0 - nTime * 0.28) * 0.5
        const w4 = Math.sin(dAngle * 7.0 + nTime * 0.12) * 0.3
        const wave = (w1 * 0.5 + w2 * 0.25 + w3 * 0.15 + w4 * 0.1) * 0.16

        const waveR = no.r * (1 + wave)
        let wx = nd.x * waveR
        let wy = nd.y * waveR * 0.65
        let wz = nd.z * waveR * 0.55

        let rz1 = wx * cosZ - wy * sinZ
        let rz2 = wx * sinZ + wy * cosZ
        wx = rz1; wy = rz2
        const rx1 = wy * cosX - wz * sinX
        const rx2 = wy * sinX + wz * cosX
        wy = rx1
        const ry1 = wx * cosY + rx2 * sinY
        const ry2 = -wx * sinY + rx2 * cosY

        no.x = ry1; no.y = wy; no.z = ry2

        const zs = 600 / (600 + Math.abs(no.z))
        const depthOff = 1 + zs * 0.15
        pr.push({
          x: no.x * zs + cx + cloudOX * depthOff,
          y: -no.y * zs + cy + cloudOY * depthOff,
          z: no.z, s: zs,
        })
      }

      const sortedEdges = edges.slice().sort((a, b) =>
        (pr[a.a].z + pr[a.b].z) - (pr[b.a].z + pr[b.b].z)
      )

      for (const e of sortedEdges) {
        const pa = pr[e.a], pb = pr[e.b]
        const az = (pa.z + pb.z) / 2
        const al = Math.max(0, Math.min(1, (500 - Math.abs(az)) / 550))
        if (al < 0.015) continue
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = isDark
          ? `rgba(209,188,255,${al * 0.045})`
          : `rgba(112,0,255,${al * 0.08})`
        ctx.lineWidth = 0.15 + al * 0.25
        ctx.stroke()
      }

      sparkTimer += dt
      if (sparkTimer > 3) { sparkTimer = 0; maybeCreateSpark() }

      for (let si = sparks.length - 1; si >= 0; si--) {
        const sp = sparks[si]
        if (!sp) { sparks.splice(si, 1); continue }
        sp.t += sp.speed
        if (sp.t >= 1) {
          if (sp.bounce) {
            const conn: { a: number; b: number }[] = []
            for (const e of edges) {
              if (e.a === sp.b || e.b === sp.b) conn.push(e)
            }
            if (conn.length > 0 && sparks.length < 4) {
              const ne = conn[Math.floor(Math.random() * conn.length)]
              sp.a = sp.b
              sp.b = ne.a === sp.b ? ne.b : ne.a
              sp.t = 0
              sp.ci = 3 + Math.floor(Math.random() * 2)
            } else {
              sparks.splice(si, 1)
            }
          } else {
            sparks.splice(si, 1)
          }
          continue
        }
        const spa = pr[sp.a], spb = pr[sp.b]
        if (!spa || !spb) { sparks.splice(si, 1); continue }
        const st = sp.t
        const sx = spa.x + (spb.x - spa.x) * st
        const sy = spa.y + (spb.y - spa.y) * st
        const sii = Math.sin(st * Math.PI)
        const sc = PALETTE[sp.ci]

        const sgrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30)
        sgrad.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]},${0.85 * sii})`)
        sgrad.addColorStop(0.1, `rgba(${sc[0]},${sc[1]},${sc[2]},${0.25 * sii})`)
        sgrad.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]},0)`)
        ctx.fillStyle = sgrad
        ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = `rgba(255,255,255,${0.95 * sii})`
        ctx.beginPath(); ctx.arc(sx, sy, 2.5 + sii * 4, 0, Math.PI * 2); ctx.fill()

        const tgrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 55)
        tgrad.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]},${0.12 * sii})`)
        tgrad.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]},0)`)
        ctx.fillStyle = tgrad
        ctx.beginPath(); ctx.arc(sx, sy, 55, 0, Math.PI * 2); ctx.fill()
      }

      for (let i = 0; i < NN; i++) {
        const pt = pr[i]
        const za = Math.max(0, Math.min(1, (500 - Math.abs(pt.z)) / 550))
        if (za < 0.02) continue
        const sz = 1 + za * 2
        const nc = PALETTE[i % 3]
        ctx.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${0.12 * za})`
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz * 7, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${0.3 + 0.6 * za})`
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz * 1.3, 0, Math.PI * 2); ctx.fill()
      }

      const pls = 0.5 + Math.sin(nTime * 0.4) * 0.15
      const ng = ctx.createRadialGradient(cx + cloudOX, cy + cloudOY, 0, cx + cloudOX, cy + cloudOY, 160 + pls * 50)
      const nuc = PALETTE[1]
      ng.addColorStop(0, `rgba(${nuc[0]},${nuc[1]},${nuc[2]},${0.06 * pls})`)
      ng.addColorStop(0.5, `rgba(${PALETTE[4][0]},${PALETTE[4][1]},${PALETTE[4][2]},${0.025 * pls})`)
      ng.addColorStop(1, `rgba(${nuc[0]},${nuc[1]},${nuc[2]},0)`)
      ctx.fillStyle = ng
      ctx.beginPath(); ctx.arc(cx + cloudOX, cy + cloudOY, 180, 0, Math.PI * 2); ctx.fill()

      animId = requestAnimationFrame(anim)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = hero.getBoundingClientRect()
      mMX = (e.clientX - rect.left) / rect.width
      mMY = (e.clientY - rect.top) / rect.height
      mouseActive = true
    }

    function onMouseLeave() {
      mouseActive = false
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const t = e.touches[0]
      const rect = hero.getBoundingClientRect()
      mMX = (t.clientX - rect.left) / rect.width
      mMY = (t.clientY - rect.top) / rect.height
      mouseActive = true
    }

    function onTouchEnd() {
      mouseActive = false
    }

    hero.addEventListener('mousemove', onMouseMove)
    hero.addEventListener('mouseleave', onMouseLeave)
    hero.addEventListener('touchmove', onTouchMove, { passive: false })
    hero.addEventListener('touchend', onTouchEnd)

    anim()

    const onWindowResize = resize
    window.addEventListener('resize', onWindowResize)

    return () => {
      cancelAnimationFrame(animId)
      hero.removeEventListener('mousemove', onMouseMove)
      hero.removeEventListener('mouseleave', onMouseLeave)
      hero.removeEventListener('touchmove', onTouchMove as EventListener)
      hero.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
