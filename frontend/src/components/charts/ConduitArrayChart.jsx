import React, { useEffect, useRef } from 'react'

const ConduitArrayChart = ({ data = [] }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width, height
        let animationFrameId
        let globalTime = 0

        const resize = () => {
            width = canvas.offsetWidth
            height = canvas.offsetHeight
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        window.addEventListener('resize', resize)
        resize()

        // Particle system
        const particles = []
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * 450, // width reference
                y: Math.random() * 350, // height reference
                speed: 0.5 + Math.random() * 1.5,
                size: Math.random() * 2
            })
        }

        const drawConduits = () => {
            ctx.clearRect(0, 0, width, height)

            const chartHeight = height * 0.7
            const bottomY = height - 40
            const topY = bottomY - chartHeight
            const startX = 40
            const colWidth = 40
            const gap = (width - 80 - (data.length * colWidth)) / (data.length - 1)

            // Grid lines
            ctx.strokeStyle = "rgba(255,255,255,0.03)"
            ctx.lineWidth = 1
            for (let i = 0; i <= 5; i++) {
                const y = bottomY - (chartHeight / 5) * i
                ctx.beginPath()
                ctx.moveTo(startX - 10, y)
                ctx.lineTo(width - 20, y)
                ctx.stroke()

                ctx.fillStyle = "rgba(255,255,255,0.3)"
                ctx.font = "10px Rajdhani"
                ctx.fillText(i * 20 + "%", startX - 35, y + 3)
            }

            // Find max value for normalization
            const maxVal = Math.max(...data.map(d => d.value), 100)

            data.forEach((item, i) => {
                const x = startX + i * (colWidth + gap)
                const targetHeight = (item.value / maxVal) * chartHeight
                const currentY = bottomY - targetHeight

                // 1. Housing
                ctx.fillStyle = "rgba(12, 20, 35, 0.5)"
                ctx.strokeStyle = "rgba(0, 234, 255, 0.1)"
                ctx.lineWidth = 2
                ctx.fillRect(x, topY, colWidth, chartHeight)
                ctx.strokeRect(x, topY, colWidth, chartHeight)

                // 2. Plasma Fill
                ctx.save()
                ctx.beginPath()
                ctx.rect(x, currentY, colWidth, targetHeight)
                ctx.clip()

                const grad = ctx.createLinearGradient(x, bottomY, x, currentY)
                grad.addColorStop(0, "rgba(0,0,0,0.1)")
                grad.addColorStop(0.8, item.color || "#00eaff")
                grad.addColorStop(1, "#fff")
                ctx.fillStyle = grad
                ctx.fillRect(x, currentY, colWidth, targetHeight)

                // Rising particles
                ctx.fillStyle = "rgba(255,255,255,0.5)"
                particles.forEach(p => {
                    const relativeX = (p.x / 450) * width
                    const relativeY = (p.y / 350) * height
                    if (relativeX > x && relativeX < x + colWidth) {
                        ctx.beginPath()
                        ctx.arc(relativeX, relativeY, p.size, 0, Math.PI * 2)
                        ctx.fill()
                    }
                })

                ctx.restore()

                // 3. Energy Cap
                ctx.beginPath()
                ctx.moveTo(x, currentY)
                ctx.lineTo(x + colWidth, currentY)
                ctx.strokeStyle = "#fff"
                ctx.lineWidth = 3
                ctx.shadowColor = item.color || "#00eaff"
                ctx.shadowBlur = 20
                ctx.stroke()
                ctx.shadowBlur = 0

                // 4. Labels
                ctx.fillStyle = "rgba(106, 137, 168, 1)"
                ctx.font = "600 12px Chakra Petch"
                ctx.textAlign = "center"
                ctx.fillText(item.name || item.label, x + colWidth / 2, bottomY + 25)

                ctx.fillStyle = item.color || "#00eaff"
                ctx.fillText(item.value + "%", x + colWidth / 2, currentY - 10)
            })

            // Update particles
            particles.forEach(p => {
                p.y -= p.speed
                if ((p.y / 350) * height < topY) p.y = (bottomY / height) * 350
            })
        }

        const animate = () => {
            globalTime += 0.02
            drawConduits()
            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [data])

    return (
        <div className="w-full h-full relative group">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    )
}

export default ConduitArrayChart
