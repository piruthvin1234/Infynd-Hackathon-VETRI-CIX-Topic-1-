import React, { useEffect, useRef } from 'react'

const ScraperRadar = ({ activeScrapes = 0 }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width, height
        let time = 0
        let animationFrameId

        const resize = () => {
            width = canvas.offsetWidth
            height = canvas.offsetHeight
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        window.addEventListener('resize', resize)
        resize()

        const blips = []
        const createBlip = () => {
            if (activeScrapes === 0 && Math.random() > 0.1) return
            const angle = Math.random() * Math.PI * 2
            const dist = Math.random() * 0.8
            blips.push({
                angle,
                dist,
                life: 1.0,
                speed: 0.005 + Math.random() * 0.01,
                size: 2 + Math.random() * 4
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            time += 0.03

            const cx = width / 2
            const cy = height / 2
            const maxR = Math.min(width, height) * 0.45

            // Background Rings
            ctx.strokeStyle = "rgba(0, 243, 255, 0.1)"
            ctx.lineWidth = 1
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath()
                ctx.arc(cx, cy, maxR * (i / 4), 0, Math.PI * 2)
                ctx.stroke()
            }

            // Crosshairs
            ctx.beginPath()
            ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy)
            ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR)
            ctx.stroke()

            // Radar Sweep
            const sweepAngle = time % (Math.PI * 2)
            const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
            sweepGrad.addColorStop(0, "rgba(0, 243, 255, 0.2)")
            sweepGrad.addColorStop(1, "rgba(0, 243, 255, 0)")

            ctx.save()
            ctx.translate(cx, cy)
            ctx.rotate(sweepAngle)

            // Sweep Gradient Arc
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, maxR, -0.5, 0)
            ctx.fillStyle = "rgba(0, 243, 255, 0.1)"
            ctx.fill()

            // Lead Edge
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(maxR, 0)
            ctx.strokeStyle = "rgba(0, 243, 255, 0.8)"
            ctx.lineWidth = 2
            ctx.shadowBlur = 10
            ctx.shadowColor = "#00f3ff"
            ctx.stroke()
            ctx.restore()

            // Data Blips
            if (time % 10 < 0.1) createBlip()

            ctx.shadowBlur = 0
            for (let i = blips.length - 1; i >= 0; i--) {
                const b = blips[i]
                const x = cx + Math.cos(b.angle) * (maxR * b.dist)
                const y = cy + Math.sin(b.angle) * (maxR * b.dist)

                // Only show blip when sweep passes over it (approx)
                const angleDiff = Math.abs((b.angle % (Math.PI * 2)) - (sweepAngle % (Math.PI * 2)))
                if (angleDiff < 0.2) b.life = 1.0

                if (b.life > 0) {
                    ctx.beginPath()
                    ctx.arc(x, y, b.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(0, 243, 255, ${b.life})`
                    ctx.shadowBlur = 10 * b.life
                    ctx.shadowColor = "#00f3ff"
                    ctx.fill()
                    b.life -= 0.01
                } else if (b.life <= 0) {
                    // blips.splice(i, 1) // Keep them for next sweep or remove
                }
            }

            // HUD Title
            ctx.fillStyle = "#00f3ff"
            ctx.font = "bold 10px Orbitron"
            ctx.textAlign = "center"
            ctx.fillText("NETWORK_INFILTRATION_RADAR", cx, cy + maxR + 25)

            const activeCount = activeScrapes || Math.floor(Math.random() * 5 + 2)
            ctx.fillStyle = "#fff"
            ctx.font = "bold 14px Rajdhani"
            ctx.fillText(`${activeCount} ACTIVE_NODES`, cx, cy + maxR + 45)

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [activeScrapes])

    return (
        <div className="w-full h-full relative bg-[#020612] rounded-xl overflow-hidden shadow-2xl border border-blue-900/30">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute top-4 right-4 pointer-events-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 animate-pulse rounded-full" />
                    <span className="text-[10px] text-red-500 font-orbitron tracking-widest">INGEST_ACTIVE</span>
                </div>
            </div>
        </div>
    )
}

export default ScraperRadar
