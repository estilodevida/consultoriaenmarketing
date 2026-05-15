'use client'

import { useEffect, useRef } from 'react'

const fPalette = [
  [209, 188, 255],
  [112, 0, 255],
  [60, 0, 144],
  [143, 253, 0],
  [23, 251, 251],
  [255, 177, 195],
]

export function FooterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx0 = canvas.getContext('2d')
    if (!ctx0) return
    const ctx: CanvasRenderingContext2D = ctx0

    const parent = canvas.parentElement
    if (!parent) return

    const fN = 60
    const fNodes: {
      baseX: number; baseY: number; baseZ: number
      x: number; y: number; z: number
    }[] = []
    const fEdges: { a: number; b: number }[] = []
    const fSparks: {
      a: number; b: number; t: number
      speed: number; ci: number; bounce: boolean
    }[] = []

    let fw = 0, fh = 0, fCx = 0, fCy = 0
    let fTime = 0, fRotY = 0, fRotX = 0.08
    let animId = 0

    function fResize() {
      const c = canvas
      if (!parent || !c) return
      fw = parent.offsetWidth
      fh = parent.offsetHeight
      c.width = fw
      c.height = fh
      fCx = fw / 2
      fCy = fh / 2
    }
    fResize()

    for (let fi = 0; fi < fN; fi++) {
      const ft = Math.random() * Math.PI * 2
      const fp = Math.acos(2 * Math.random() - 1)
      const fr = 60 + Math.random() * 500
      fNodes.push({
        baseX: Math.sin(fp) * Math.cos(ft) * fr,
        baseY: Math.sin(fp) * Math.sin(ft) * fr,
        baseZ: Math.cos(fp) * fr,
        x: 0, y: 0, z: 0,
      })
    }

    const fMAX_EDGE = 600
    for (let fi = 0; fi < fN; fi++) {
      for (let fj = fi + 1; fj < fN; fj++) {
        const dx = fNodes[fi].baseX - fNodes[fj].baseX
        const dy = fNodes[fi].baseY - fNodes[fj].baseY
        const dz = fNodes[fi].baseZ - fNodes[fj].baseZ
        if (dx * dx + dy * dy + dz * dz < fMAX_EDGE * fMAX_EDGE) {
          fEdges.push({ a: fi, b: fj })
        }
      }
    }

    let fSparkTimer = 4

    function fMaybeSpark() {
      if (!fEdges.length) return
      let act = 0
      for (const s of fSparks) if (s) act++
      if (act >= 2) return
      const e = fEdges[Math.floor(Math.random() * fEdges.length)]
      fSparks.push({
        a: e.a, b: e.b, t: 0,
        speed: 0.001 + Math.random() * 0.002,
        ci: 3 + Math.floor(Math.random() * 2),
        bounce: true,
      })
    }

    function fAnim() {
      fTime += 0.016
      fRotY += 0.0003
      fRotX = 0.1 + Math.sin(fTime * 0.008) * 0.04
      ctx.clearRect(0, 0, fw, fh)
      const fCosY = Math.cos(fRotY), fSinY = Math.sin(fRotY)
      const fCosX = Math.cos(fRotX), fSinX = Math.sin(fRotX)

      const prj: { x: number; y: number; z: number; s: number }[] = []

      for (let fi = 0; fi < fN; fi++) {
        const n = fNodes[fi]
        let wx = n.baseX, wy = n.baseY, wz = n.baseZ
        const rx = wy * fCosX - wz * fSinX
        const ry = wy * fSinX + wz * fCosX
        const ry2 = wx * fCosY + ry * fSinY
        const rz = -wx * fSinY + ry * fCosY
        n.x = ry2; n.y = rx; n.z = rz
        const zs = 600 / (600 + Math.abs(rz))
        prj.push({ x: ry2 * zs + fCx, y: -rx * zs + fCy, z: rz, s: zs })
      }

      const se = fEdges.slice().sort((a, b) =>
        (prj[a.a].z + prj[a.b].z) - (prj[b.a].z + prj[b.b].z)
      )

      for (const e of se) {
        const pa = prj[e.a], pb = prj[e.b]
        const az = (pa.z + pb.z) / 2
        const al = Math.max(0, Math.min(1, (500 - Math.abs(az)) / 550))
        if (al < 0.01) continue
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = `rgba(209,188,255,${al * 0.08})`
        ctx.lineWidth = 0.2 + al * 0.3
        ctx.stroke()
      }

      fSparkTimer += 0.016
      if (fSparkTimer > 4) { fSparkTimer = 0; fMaybeSpark() }

      for (let si = fSparks.length - 1; si >= 0; si--) {
        const sp = fSparks[si]
        if (!sp) { fSparks.splice(si, 1); continue }
        sp.t += sp.speed
        if (sp.t >= 1) {
          if (sp.bounce) {
            const conn: { a: number; b: number }[] = []
            for (const e of fEdges) {
              if (e.a === sp.b || e.b === sp.b) conn.push(e)
            }
            if (conn.length > 0 && fSparks.length < 3) {
              const ne = conn[Math.floor(Math.random() * conn.length)]
              sp.a = sp.b
              sp.b = ne.a === sp.b ? ne.b : ne.a
              sp.t = 0
              sp.ci = 3 + Math.floor(Math.random() * 2)
            } else { fSparks.splice(si, 1) }
          } else { fSparks.splice(si, 1) }
          continue
        }
        const spa = prj[sp.a], spb = prj[sp.b]
        if (!spa || !spb) { fSparks.splice(si, 1); continue }
        const st = sp.t
        const sx = spa.x + (spb.x - spa.x) * st
        const sy = spa.y + (spb.y - spa.y) * st
        const sii = Math.sin(st * Math.PI)
        const sc = fPalette[sp.ci]

        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20)
        sg.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]},${0.7 * sii})`)
        sg.addColorStop(0.1, `rgba(${sc[0]},${sc[1]},${sc[2]},${0.2 * sii})`)
        sg.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]},0)`)
        ctx.fillStyle = sg
        ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = `rgba(255,255,255,${0.85 * sii})`
        ctx.beginPath(); ctx.arc(sx, sy, 2 + sii * 3, 0, Math.PI * 2); ctx.fill()
      }

      for (let fi = 0; fi < fN; fi++) {
        const pt = prj[fi]
        const za = Math.max(0, Math.min(1, (500 - Math.abs(pt.z)) / 550))
        if (za < 0.02) continue
        const sz = 1.2 + za * 1.8
        const nc = fPalette[fi % 3]
        ctx.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${0.08 * za})`
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz * 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${0.25 + 0.6 * za})`
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz * 1.2, 0, Math.PI * 2); ctx.fill()
      }

      animId = requestAnimationFrame(fAnim)
    }

    fAnim()
    window.addEventListener('resize', fResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', fResize)
    }
  }, [])

  return <canvas ref={canvasRef} id="footerCanvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, display: 'block' }} />
}
