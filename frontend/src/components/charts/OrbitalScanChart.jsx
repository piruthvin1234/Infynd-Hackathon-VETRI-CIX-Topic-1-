import React, { useEffect, useRef } from 'react'

const OrbitalScanChart = ({ data = [] }) => {
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

        const drawGyroscope = () => {
            ctx.clearRect(0, 0, width, height)
            const cx = width / 2
            const cy = height / 2

            ctx.lineWidth = 4
            ctx.lineCap = 'round'

            // Draw Central Core
            ctx.beginPath()
            ctx.arc(cx, cy, 25, 0, Math.PI * 2)
            ctx.fillStyle = "#0a1220"
            ctx.fill()
            ctx.strokeStyle = "rgba(0, 234, 255, 0.5)"
            ctx.stroke()

            // Core pulse
            const pulse = Math.abs(Math.sin(globalTime * 0.5))
            ctx.shadowColor = "#00eaff"
            ctx.shadowBlur = 10 + pulse * 10
            ctx.beginPath()
            ctx.arc(cx, cy, 10, 0, Math.PI * 2)
            ctx.fillStyle = "#00eaff"
            ctx.fill()
            ctx.shadowBlur = 0

            let currentRadius = 50
            const radiusStep = 20

            // Base total on data sum
            const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1

            data.forEach((item, index) => {
                const rotationOffset = globalTime * (0.2 + index * 0.1) * (index % 2 === 0 ? 1 : -1)
                const startAngle = -Math.PI / 2 + rotationOffset
                const sliceAngle = (item.value / total) * (Math.PI * 2)
                const endAngle = startAngle + sliceAngle

                // 1. Orbital Track
                ctx.beginPath()
                ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
                ctx.lineWidth = 1
                ctx.stroke()

                // 2. Active Arc
                ctx.beginPath()
                ctx.arc(cx, cy, currentRadius, startAngle, endAngle)
                ctx.strokeStyle = item.color || '#00eaff'
                ctx.lineWidth = 6
                ctx.shadowColor = item.color || '#00eaff'
                ctx.shadowBlur = 15
                ctx.stroke()
                ctx.shadowBlur = 0

                // 3. Node
                const nodeX = cx + Math.cos(endAngle) * currentRadius
                const nodeY = cy + Math.sin(endAngle) * currentRadius

                ctx.beginPath()
                ctx.arc(nodeX, nodeY, 6, 0, Math.PI * 2)
                ctx.fillStyle = "#fff"
                ctx.fill()
                ctx.shadowColor = item.color || '#00eaff'
                ctx.shadowBlur = 20
                ctx.beginPath()
                ctx.arc(nodeX, nodeY, 3, 0, Math.PI * 2)
                ctx.fillStyle = item.color || '#00eaff'
                ctx.fill()
                ctx.shadowBlur = 0

                currentRadius += radiusStep
            })
        }

        const animate = () => {
            globalTime += 0.02
            drawGyroscope()
            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [data])

    return (
        <div className="w-full h-full relative group flex flex-col items-center">
            <canvas ref={canvasRef} className="w-full h-full max-w-[350px] max-h-[350px]" />
            <div className="legend mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[12px] font-rajdhani text-gray-400 uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-sm shadow-[0_0_5px]" style={{ backgroundColor: d.color, color: d.color }} />
                        <span>{d.name || d.label} ({d.value}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrbitalScanChart
