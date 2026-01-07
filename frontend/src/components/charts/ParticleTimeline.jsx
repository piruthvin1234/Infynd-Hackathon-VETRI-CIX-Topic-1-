import React, { useEffect, useRef } from 'react'

const ParticleTimeline = ({ data = [] }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width, height
        let animationFrameId
        let time = 0
        let hoveredPoint = null

        const resize = () => {
            const rect = canvas.getBoundingClientRect()
            width = rect.width
            height = rect.height
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        window.addEventListener('resize', resize)
        resize()

        // Animation Particles
        const particles = []
        const PARTICLE_COUNT = 40
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                t: Math.random(),
                speed: 0.002 + Math.random() * 0.003,
                size: Math.random() * 2 + 1
            })
        }

        const getPointCoordinates = (index) => {
            const paddingX = 60
            const paddingY = 60
            const availWidth = width - (paddingX * 2)
            const availHeight = height - (paddingY * 2)

            const maxVal = Math.max(...data.map(d => d.companies || 1), 10)

            const x = paddingX + (index / (data.length - 1)) * availWidth
            const y = (height - paddingY) - ((data[index].companies || 0) / maxVal) * availHeight
            return { x, y }
        }

        const drawSpline = (ctx, points, tension = 0.5) => {
            if (points.length < 2) return
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)

            for (let i = 0; i < points.length - 1; i++) {
                const p0 = i > 0 ? points[i - 1] : points[0]
                const p1 = points[i]
                const p2 = points[i + 1]
                const p3 = i !== points.length - 2 ? points[i + 2] : p2

                const cp1x = p1.x + (p2.x - p0.x) / 6 * tension
                const cp1y = p1.y + (p2.y - p0.y) / 6 * tension
                const cp2x = p2.x - (p3.x - p1.x) / 6 * tension
                const cp2y = p2.y - (p3.y - p1.y) / 6 * tension

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
            }
            ctx.stroke()
        }

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            const mouseX = (e.clientX - rect.left) * window.devicePixelRatio
            const mouseY = (e.clientY - rect.top) * window.devicePixelRatio

            let found = null
            const points = data.map((_, i) => getPointCoordinates(i))
            points.forEach((p, i) => {
                const dx = (mouseX / window.devicePixelRatio) - p.x
                const dy = (mouseY / window.devicePixelRatio) - p.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 30) found = i
            })
            hoveredPoint = found
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            time += 0.05

            // Perspective Floor
            ctx.save()
            ctx.strokeStyle = "rgba(0, 212, 255, 0.05)"
            ctx.lineWidth = 1
            ctx.beginPath()
            const horizonY = height - 40
            for (let i = -10; i <= 20; i++) {
                ctx.moveTo(width / 2 + (i * 80), horizonY)
                ctx.lineTo(width / 2 + (i * 120), height)
            }
            for (let i = 0; i < 6; i++) {
                const y = horizonY + (i * 20)
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
            }
            ctx.stroke()
            ctx.restore()

            const points = data.map((_, i) => getPointCoordinates(i))

            // Glow Line
            ctx.shadowBlur = 15
            ctx.shadowColor = "#00d4ff"
            ctx.strokeStyle = "#00d4ff"
            ctx.lineWidth = 2
            drawSpline(ctx, points)

            // Reflection
            ctx.shadowBlur = 0
            ctx.strokeStyle = "rgba(0, 212, 255, 0.05)"
            ctx.lineWidth = 1
            ctx.save()
            ctx.transform(1, 0, 0, -0.5, 0, height + 100)
            drawSpline(ctx, points)
            ctx.restore()

            // Particles
            ctx.fillStyle = "#ffffff"
            ctx.shadowBlur = 8
            ctx.shadowColor = "#ffffff"
            particles.forEach(p => {
                p.t += p.speed
                if (p.t > 1) p.t = 0
                const segmentT = p.t * (points.length - 1)
                const index = Math.floor(segmentT)
                const localT = segmentT - index
                if (index < points.length - 1) {
                    const p1 = points[index]
                    const p2 = points[index + 1]
                    const px = p1.x + (p2.x - p1.x) * localT
                    const py = p1.y + (p2.y - p1.y) * localT
                    const wobble = Math.sin(time + p.t * 10) * 3
                    ctx.beginPath()
                    ctx.arc(px, py + wobble, p.size, 0, Math.PI * 2)
                    ctx.fill()
                }
            })

            // Data Nodes
            points.forEach((p, i) => {
                const isHovered = hoveredPoint === i

                // Connector
                ctx.beginPath()
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(p.x, height - 40)
                ctx.strokeStyle = "rgba(0, 212, 255, 0.1)"
                ctx.lineWidth = 1
                ctx.setLineDash([4, 4])
                ctx.stroke()
                ctx.setLineDash([])

                // Orb
                ctx.beginPath()
                ctx.arc(p.x, p.y, isHovered ? 10 : 5, 0, Math.PI * 2)
                ctx.fillStyle = "#020612"
                ctx.fill()
                ctx.strokeStyle = isHovered ? "#fff" : "#00d4ff"
                ctx.lineWidth = 2
                ctx.shadowBlur = isHovered ? 25 : 10
                ctx.stroke()

                if (isHovered) {
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(p.x, 0)
                    const grad = ctx.createLinearGradient(p.x, p.y, p.x, 0)
                    grad.addColorStop(0, "rgba(0, 212, 255, 0.3)")
                    grad.addColorStop(1, "rgba(0, 212, 255, 0)")
                    ctx.strokeStyle = grad
                    ctx.lineWidth = 30
                    ctx.stroke()

                    // Mini Tooltip on Canvas
                    ctx.fillStyle = "#fff"
                    ctx.font = "bold 14px Rajdhani"
                    ctx.textAlign = "center"
                    ctx.fillText(`${data[i].companies} Analyzed`, p.x, p.y - 25)
                    ctx.font = "10px Orbitron"
                    ctx.fillStyle = "#00d4ff"
                    ctx.fillText(data[i].name.toUpperCase(), p.x, p.y - 45)
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [data])

    return (
        <div className="w-full h-full relative group">
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="text-[10px] text-[#00d4ff] font-orbitron tracking-[3px] uppercase opacity-50">System Stream</div>
                <div className="text-white font-bold tracking-tight">DATA_FLOW_04</div>
            </div>
            <div className="absolute bottom-4 right-4 pointer-events-none flex space-x-2">
                <div className="w-2 h-2 bg-[#00d4ff] animate-pulse rounded-full" />
                <div className="text-[8px] text-[#00d4ff] font-orbitron">REAL_TIME_NODE</div>
            </div>
        </div>
    )
}

export default ParticleTimeline
