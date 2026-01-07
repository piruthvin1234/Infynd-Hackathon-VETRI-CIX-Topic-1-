import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const canvasRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width, height
        let time = 0
        let tilt = { x: 0, y: 0 }
        let animationFrameId

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
        }

        const handleMouseMove = (e) => {
            tilt.x = (e.clientX / width - 0.5) * 15
            tilt.y = (e.clientY / height - 0.5) * 8

            const cursor = document.getElementById('rover-cursor')
            if (cursor) {
                cursor.style.left = e.clientX + 'px'
                cursor.style.top = e.clientY + 'px'
            }
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouseMove)
        resize()

        // --- DATA ---
        const dataRear = [
            { value: 45, color: "#ff0055" },
            { value: 20, color: "#ff5500" },
            { value: 35, color: "#ffcc00" }
        ]
        const dataFront = [
            { value: 65, color: "#00f3ff" },
            { value: 25, color: "#00ff66" },
            { value: 10, color: "#3366ff" }
        ]

        const drawHexHub = (x, y, r, color) => {
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i
                ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
            }
            ctx.closePath()
            ctx.fillStyle = "#000"
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.stroke()
        }

        class Wheel {
            constructor(data, color) {
                this.data = data
                this.baseColor = color
                this.rotation = 0
                this.radius = 75
            }

            draw(cx, cy) {
                this.rotation += 0.05
                ctx.save()
                ctx.translate(cx, cy)

                drawHexHub(0, 0, 25, this.baseColor)

                let startAngle = this.rotation
                const total = 100
                this.data.forEach(item => {
                    const slice = (item.value / total) * Math.PI * 2
                    const end = startAngle + slice

                    ctx.beginPath()
                    ctx.arc(0, 0, this.radius, startAngle, end - 0.1)
                    ctx.strokeStyle = item.color
                    ctx.lineWidth = 12
                    ctx.shadowColor = item.color
                    ctx.shadowBlur = 20
                    ctx.stroke()

                    const mid = startAngle + slice / 2
                    ctx.beginPath()
                    ctx.moveTo(Math.cos(mid) * 25, Math.sin(mid) * 25)
                    ctx.lineTo(Math.cos(mid) * (this.radius - 10), Math.sin(mid) * (this.radius - 10))
                    ctx.lineWidth = 2
                    ctx.shadowBlur = 0
                    ctx.stroke()

                    startAngle += slice
                })

                ctx.beginPath()
                ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2)
                ctx.strokeStyle = "rgba(255,255,255,0.15)"
                ctx.lineWidth = 1
                ctx.setLineDash([2, 8])
                ctx.stroke()
                ctx.setLineDash([])

                ctx.restore()
            }
        }

        class CyberCar {
            constructor() {
                this.rearWheel = new Wheel(dataRear, "#ff0055")
                this.frontWheel = new Wheel(dataFront, "#00f3ff")
            }

            draw(cx, cy) {
                const hoverY = Math.sin(time * 0.04) * 6
                const rearX = cx - 180
                const frontX = cx + 180
                const wheelY = cy + 60
                const bodyY = cy + hoverY - 20

                this.rearWheel.draw(rearX, wheelY)
                this.frontWheel.draw(frontX, wheelY)

                ctx.save()
                ctx.beginPath()
                ctx.moveTo(rearX - 90, bodyY + 30)
                ctx.bezierCurveTo(rearX - 60, bodyY + 30, rearX - 60, bodyY - 40, rearX, bodyY - 40)
                ctx.bezierCurveTo(rearX + 60, bodyY - 40, rearX + 60, bodyY + 30, rearX + 90, bodyY + 30)
                ctx.lineTo(frontX - 90, bodyY + 30)
                ctx.bezierCurveTo(frontX - 60, bodyY + 30, frontX - 60, bodyY - 40, frontX, bodyY - 40)
                ctx.bezierCurveTo(frontX + 60, bodyY - 40, frontX + 60, bodyY + 30, frontX + 90, bodyY + 30)
                ctx.lineTo(frontX + 130, bodyY + 20)
                ctx.lineTo(frontX + 110, bodyY - 20)
                ctx.lineTo(frontX - 50, bodyY - 70)
                ctx.lineTo(rearX - 20, bodyY - 70)
                ctx.lineTo(rearX - 100, bodyY + 0)
                ctx.lineTo(rearX - 90, bodyY + 30)
                ctx.closePath()

                const bodyGrad = ctx.createLinearGradient(rearX - 100, bodyY - 100, frontX + 100, bodyY + 50)
                bodyGrad.addColorStop(0, "#0a0a0a")
                bodyGrad.addColorStop(0.3, "#1a1a24")
                bodyGrad.addColorStop(0.6, "#112")
                bodyGrad.addColorStop(1, "#050a10")
                ctx.fillStyle = bodyGrad
                ctx.fill()

                ctx.beginPath()
                ctx.moveTo(rearX - 20, bodyY - 65)
                ctx.lineTo(frontX - 55, bodyY - 65)
                ctx.lineTo(frontX + 20, bodyY - 25)
                ctx.lineTo(rearX - 40, bodyY - 25)
                ctx.closePath()
                ctx.fillStyle = "rgba(0, 243, 255, 0.1)"
                ctx.fill()
                ctx.strokeStyle = "rgba(0, 243, 255, 0.3)"
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(rearX - 100, bodyY + 0)
                ctx.lineTo(rearX - 20, bodyY - 70)
                ctx.lineTo(frontX - 50, bodyY - 70)
                ctx.lineTo(frontX + 110, bodyY - 20)
                ctx.lineTo(frontX + 130, bodyY + 20)
                ctx.shadowColor = "#00f3ff"
                ctx.shadowBlur = 15
                ctx.strokeStyle = "#fff"
                ctx.lineWidth = 2
                ctx.stroke()
                ctx.shadowBlur = 0

                // Headlight
                ctx.beginPath()
                ctx.moveTo(frontX + 125, bodyY + 22)
                ctx.lineTo(frontX + 100, bodyY + 22)
                ctx.strokeStyle = "#00f3ff"
                ctx.lineWidth = 3
                ctx.shadowColor = "#00f3ff"
                ctx.shadowBlur = 20
                ctx.stroke()
                ctx.shadowBlur = 0

                // Taillight
                ctx.beginPath()
                ctx.moveTo(rearX - 100, bodyY + 5)
                ctx.lineTo(rearX - 95, bodyY + 25)
                ctx.strokeStyle = "#ff0055"
                ctx.lineWidth = 4
                ctx.shadowColor = "#ff0055"
                ctx.shadowBlur = 20
                ctx.stroke()
                ctx.shadowBlur = 0

                ctx.restore()

                // Logo
                ctx.save()
                const logoX = cx
                const logoY = bodyY - 140
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = "900 70px 'Orbitron'"

                const textGrad = ctx.createLinearGradient(logoX, logoY - 40, logoX, logoY + 40)
                textGrad.addColorStop(0, "#fff")
                textGrad.addColorStop(0.5, "#88ccff")
                textGrad.addColorStop(1, "#00f3ff")
                ctx.fillStyle = textGrad

                const pulse = 20 + Math.sin(time * 0.1) * 10
                ctx.shadowColor = "#00f3ff"
                ctx.shadowBlur = pulse
                ctx.fillText("VETRI CIX", logoX, logoY)

                ctx.font = "500 18px 'Rajdhani'"
                ctx.fillStyle = "#fff"
                ctx.shadowBlur = 0
                ctx.letterSpacing = "12px"
                ctx.fillText("AUTOMATED INTELLIGENCE", logoX, logoY + 50)

                ctx.globalAlpha = 0.3
                ctx.strokeStyle = "#00f3ff"
                ctx.beginPath()
                ctx.moveTo(logoX, logoY + 70)
                ctx.lineTo(logoX, bodyY - 70)
                ctx.setLineDash([2, 4])
                ctx.stroke()
                ctx.globalAlpha = 1.0
                ctx.restore()

                ctx.globalCompositeOperation = "screen"
                const glowGrad = ctx.createRadialGradient(cx, wheelY + 20, 50, cx, wheelY + 20, 350)
                glowGrad.addColorStop(0, "rgba(0, 243, 255, 0.4)")
                glowGrad.addColorStop(1, "transparent")
                ctx.fillStyle = glowGrad
                ctx.fillRect(rearX - 100, wheelY + 20, 560, 40)
                ctx.globalCompositeOperation = "source-over"
            }
        }

        const rover = new CyberCar()

        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            time++

            const cx = width / 2 + tilt.x
            const cy = height / 2 + tilt.y

            rover.draw(cx, cy)

            ctx.beginPath()
            ctx.moveTo(0, cy + 130)
            ctx.lineTo(width, cy + 130)
            ctx.strokeStyle = "#00f3ff"
            ctx.lineWidth = 1
            ctx.shadowColor = "#00f3ff"
            ctx.shadowBlur = 10
            ctx.stroke()

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        // Navigation Timer
        const redirectTimer = setTimeout(() => {
            navigate('/dashboard')
        }, 6000)

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
            clearTimeout(redirectTimer)
        }
    }, [navigate])

    return (
        <div style={{
            margin: 0,
            backgroundColor: '#030305',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Rajdhani', sans-serif",
            color: '#fff',
            cursor: 'none',
            position: 'relative'
        }}>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');
                
                .grid-floor {
                    position: absolute;
                    bottom: 0;
                    width: 200%;
                    height: 45%;
                    left: -50%;
                    background: 
                        linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px);
                    background-size: 80px 80px;
                    transform: perspective(600px) rotateX(75deg);
                    opacity: 0.3;
                    mask-image: linear-gradient(to top, rgba(0,0,0,1), transparent);
                    z-index: 1;
                }
                
                .horizon-glow {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    height: 60%;
                    background: linear-gradient(to top, rgba(0, 243, 255, 0.15), transparent);
                    z-index: 0;
                }

                #rover-cursor {
                    position: fixed;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #fff;
                    transform: translate(-50%, -50%) rotate(45deg);
                    pointer-events: none;
                    z-index: 100;
                    mix-blend-mode: overlay;
                    transition: width 0.2s, height 0.2s;
                }

                .loading-progress {
                    position: absolute;
                    bottom: 10%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 20;
                    text-align: center;
                }

                .progress-bar-container {
                    width: 300px;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 10px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ff0055, #00f3ff);
                    width: 0%;
                    animation: loading 6s linear forwards;
                }

                @keyframes loading {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }

                .skip-hint {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.4);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    z-index: 30;
                    cursor: pointer;
                }
                `}
            </style>

            <div className="horizon-glow"></div>
            <div className="grid-floor"></div>
            <div id="rover-cursor"></div>

            <div className="skip-hint" onClick={() => navigate('/dashboard')}>
                [ Skip Introduction ]
            </div>

            <canvas ref={canvasRef} style={{ position: 'relative', zIndex: 10 }} />

            <div className="loading-progress">
                <div style={{ fontSize: '12px', letterSpacing: '4px', color: '#00f3ff', textTransform: 'uppercase' }}>
                    Initializing Intelligence Units
                </div>
                <div className="progress-bar-container">
                    <div className="progress-fill"></div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
