import React, { useEffect, useRef } from 'react'

const OmniViewChart = ({ data = [] }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width, height
        let time = 0
        let mouse = { x: 0, y: 0 }
        let tilt = { x: 0, y: 0 }
        let animationFrameId

        const resize = () => {
            width = canvas.offsetWidth
            height = canvas.offsetHeight
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
            tilt.x = (mouse.x / width - 0.5) * 20
            tilt.y = (mouse.y / height - 0.5) * 20
        }

        window.addEventListener('resize', resize)
        canvas.addEventListener('mousemove', handleMouseMove)
        resize()

        const drawHexagon = (x, y, r, color, glow) => {
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i
                ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
            }
            ctx.closePath()
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.shadowBlur = glow ? 20 : 0
            ctx.shadowColor = color
            ctx.stroke()
            ctx.shadowBlur = 0
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            time += 0.05

            const cx = width / 2 + tilt.x
            const cy = height / 2 + tilt.y

            // --- ORBITAL PIE ---
            const rotation = time * 0.1
            const baseRadius = Math.min(width, height) * 0.25

            // Core
            ctx.save()
            ctx.translate(cx, cy)
            ctx.beginPath()
            ctx.arc(0, 0, 30, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
            ctx.fill()
            drawHexagon(0, 0, 30, "#00f3ff", true)
            ctx.restore()

            let startAngle = rotation
            const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1

            data.forEach((field, i) => {
                const sliceAngle = (field.value / total) * Math.PI * 2
                const endAngle = startAngle + sliceAngle

                // Interaction
                const dx = mouse.x - cx
                const dy = mouse.y - cy
                const dist = Math.sqrt(dx * dx + dy * dy)
                const isHovered = dist > 40 && dist < baseRadius + 100

                const expand = isHovered ? 10 : 0

                ctx.beginPath()
                ctx.arc(cx, cy, 40 + (i * 12) + expand, startAngle, endAngle - 0.1)
                ctx.strokeStyle = field.color || '#00f3ff'
                ctx.lineWidth = 6
                ctx.shadowColor = field.color || '#00f3ff'
                ctx.shadowBlur = isHovered ? 20 : 5
                ctx.stroke()

                // Label
                const midAngle = startAngle + sliceAngle / 2
                const lx = cx + Math.cos(midAngle) * (baseRadius + 20)
                const ly = cy + Math.sin(midAngle) * (baseRadius + 20)

                ctx.shadowBlur = 0
                ctx.strokeStyle = "rgba(255,255,255,0.1)"
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(cx + Math.cos(midAngle) * (40 + i * 12), cy + Math.sin(midAngle) * (40 + i * 12))
                ctx.lineTo(lx, ly)
                ctx.stroke()

                ctx.fillStyle = "#fff"
                ctx.font = "bold 10px Orbitron"
                ctx.textAlign = lx > cx ? "left" : "right"
                ctx.fillText(field.name.toUpperCase(), lx + (lx > cx ? 10 : -10), ly)

                ctx.fillStyle = field.color || '#00f3ff'
                ctx.font = "bold 14px Rajdhani"
                ctx.fillText(`${field.value} companies`, lx + (lx > cx ? 10 : -10), ly + 15)

                startAngle += sliceAngle
            })

            // HUD Decorations
            ctx.strokeStyle = "rgba(0, 243, 255, 0.05)"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(cx - 50, cy); ctx.lineTo(cx + 50, cy)
            ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50)
            ctx.stroke()

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
        <div className="w-full h-full relative overflow-hidden bg-[#030305] rounded-xl">
            <div className="absolute top-4 left-4 z-10">
                <div className="text-[10px] text-[#00f3ff] font-orbitron tracking-widest opacity-70">SECTOR_ANALYSIS</div>
                <div className="text-white font-bold text-sm">OMNI_VIEW_CORE_v2</div>
            </div>

            <div className="absolute inset-0 z-0 opacity-20">
                <div className="w-full h-full" style={{
                    background: `linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    maskImage: 'radial-gradient(circle, black, transparent)'
                }} />
            </div>

            <canvas ref={canvasRef} className="w-full h-full relative z-10 cursor-crosshair" />
        </div>
    )
}

export default OmniViewChart
