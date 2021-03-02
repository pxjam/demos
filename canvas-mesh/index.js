import getGradCoords from "./modules/getGradCoords"
import drawRotatedRect from "./modules/drawRotatedRect"

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

let params = {
    rotateCenterX: canvas.width * 0.4,
    rotateCenterY: canvas.height * 0.2,
    gradDirX: "right",
    gradDirY: "top",
    size: 220,
    color1: [0, 251, 235],
    color2: [186, 0, 250],
    maxPower: .3
}

let drawRect = () => {
    let size = params.size
    let step = 14
    let stepCount = 30
    let time = performance.now() / 500

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    let grd = ctx.createLinearGradient(...gradientCoords)
    let color1 = `rgba(${params.color1.join(',')})`
    let color2 = `rgba(${params.color2.join(',')})`
    grd.addColorStop(0, color1)
    grd.addColorStop(1, color2)

    ctx.strokeStyle = grd

    for (let i = 1; i < stepCount; i++) {
        let x0 = params.rotateCenterX + 140 * Math.sin((time + i) / 12)
        let y0 = params.rotateCenterY + 140 * Math.cos((time + i) / 12)

        ctx.globalAlpha = i / stepCount

        let x = x0 + i * step
        let y = y0 + i * step

        let power = getMousePower(x, y)

        let width = size * (1 + params.maxPower * power)
        let height = width

        drawRotatedRect(ctx, x, y, width, height, time + i)
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