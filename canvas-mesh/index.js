import getGradCoords from "./modules/getGradCoords"
import drawRotatedRect2 from "./modules/drawRotatedRect2"

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

let params = {
    rotateCenterX: canvas.width * 0.5,
    rotateCenterY: canvas.height * 0.4,
    gradDirX: "right",
    gradDirY: "top",
    size: 350,
    color1: [0, 251, 235],
    color2: [186, 0, 250],
    maxPower: 1.1,
    minOpacity: 0.3,
    perspective: 0.5
}

let mode = 0

let drawRect = () => {
    let size = params.size
    let step = 20
    let stepCount = 7
    let time = performance.now() / 500

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    let grd = ctx.createLinearGradient(...gradientCoords)
    let color1 = `rgba(${params.color1.join(',')})`
    let color2 = `rgba(${params.color2.join(',')})`
    grd.addColorStop(0, color1)
    grd.addColorStop(1, color2)

    ctx.strokeStyle = grd

    let prevPoints = null

    for (let i = 0; i < stepCount; i++) {
        let x0 = params.rotateCenterX + 40 * Math.cos((-time + i) / 6)
        let y0 = params.rotateCenterY + 40 * Math.sin((-time + i) / 6)

        // ctx.globalAlpha = params.minOpacity + i / stepCount * (1 - params.minOpacity)
        ctx.globalAlpha = 1 - (1 - params.minOpacity) * i / stepCount
        let perspectiveFactor = 1 - params.perspective * i / stepCount

        let x = x0 + i * step
        let y = y0 + i * step

        let power = getMousePower(x, y)

        let width = size * perspectiveFactor * (1 + params.maxPower * power)
        let height = width

        let points = drawRotatedRect2(ctx, x, y, width, height, time + i)

        if (prevPoints && [1, 2].includes(mode)) {
            for (let i = 0; i < 4; i++) {
                ctx.moveTo(...prevPoints[i])
                ctx.lineTo(...points[i])

                //ctx.moveTo(prevPoints[i][0] - prevPoints[i][0], prevPoints[i][1] - prevPoints[i][1])
                // ctx.moveTo(canvas.width, 0)
                // ctx.lineTo(...prevPoints[i])
            }
        }

        if (mode === 2) {
            for (let i = 0; i < 4; i++) {
                ctx.moveTo(0, 0)
                ctx.lineTo(...points[i])
            }
        }

        prevPoints = points

        ctx.stroke()
    }

    requestAnimationFrame(drawRect)
}

drawRect()

function getMousePower(x, y) {
    let power
    let distanceX = x - mouseX
    let distanceY = y - mouseY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    let distanceFixed = distance / params.size // чтобы единица была на расстоянии в размер объекта

    power = Math.E ** -(Math.PI / 2 * distanceFixed)
    return power
}

window.addEventListener('mousemove', e => {
    mouseX = e.clientX - canvas.offsetLeft
    mouseY = e.clientY - canvas.offsetTop
})

window.addEventListener('click', () => {
    mode++
    if (mode > 2) mode = 0
})