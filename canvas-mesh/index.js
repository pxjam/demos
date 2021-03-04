import Tweakpane from "tweakpane"
import getGradCoords from "./modules/getGradCoords"
import drawRotatedRect2 from "./modules/drawRotatedRect2"

let pane = new Tweakpane

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

let params = {
    mode: 0,
    rotateCenterX: canvas.width * 0.5,
    rotateCenterY: canvas.height * 0.4,
    gradDirX: "right",
    gradDirY: "top",
    size: 350,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    maxPower: 1.1,
    minOpacity: 0.3,
    perspective: 0.5,
    segments: 20,
    timeSlowdown: 500,
    step: 20,
    rotateRadius: 40,
    segmentRotation: 0.15
}

let mode = 0
let phantom = false

const f1 = pane.addFolder({
    title: 'Настройки',
});
const modeBtn = f1.addButton({
    title: 'Сменить режим',
})

modeBtn.on('click', () => {
    mode++
    if (mode > 4) mode = 0
    phantom = (mode > 2)
})
// canvas.addEventListener('click', switchMode)

f1.addSeparator()
f1.addInput(params, 'size', {min: 10, max: 800, step: 10})
f1.addInput(params, 'segments', {min: 1, max: 40, step: 1})
f1.addInput(params, 'timeSlowdown', {min: 1, max: 2000, step: 20})
f1.addInput(params, 'maxPower', {min: 0, max: 5, step: 0.1})
f1.addInput(params, 'minOpacity', {min: 0, max: 1, step: 0.1})
f1.addInput(params, 'perspective', {min: 0, max: 1, step: 0.1})
f1.addInput(params, 'step', {min: 0, max: 100, step: 1})
f1.addInput(params, 'rotateRadius', {min: 0, max: 300, step: 10})
f1.addInput(params, 'segmentRotation', {min: 0, max: 7, step: 0.01})
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')


let drawRect = () => {
    let size = params.size
    let step = params.step
    let stepCount = params.segments
    let segmentRotation = params.segmentRotation
    let time = performance.now() / params.timeSlowdown

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    let grd = ctx.createLinearGradient(...gradientCoords)
    let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    grd.addColorStop(0, color1)
    grd.addColorStop(1, color2)

    ctx.strokeStyle = grd

    let prevPoints = null

    for (let i = 0; i < stepCount; i++) {
        let x0 = params.rotateCenterX + params.rotateRadius * Math.cos((-time + i) * segmentRotation)
        let y0 = params.rotateCenterY + params.rotateRadius * Math.sin((-time + i) * segmentRotation)

        // ctx.globalAlpha = params.minOpacity + i / stepCount * (1 - params.minOpacity)
        ctx.globalAlpha = 1 - (1 - params.minOpacity) * i / stepCount
        let perspectiveFactor = 1 - params.perspective * i / stepCount

        let x = x0 + i * step
        let y = y0 + i * step

        let power = getMousePower(x, y)

        let width = size * perspectiveFactor * (1 + params.maxPower * power)
        let height = width

        let points = drawRotatedRect2(ctx, x, y, width, height, time + i, phantom)

        if (prevPoints && [1, 2, 3].includes(mode)) {
            for (let i = 0; i < 4; i++) {
                ctx.moveTo(...prevPoints[i])
                ctx.lineTo(...points[i])

                //ctx.moveTo(prevPoints[i][0] - prevPoints[i][0], prevPoints[i][1] - prevPoints[i][1])
                // ctx.moveTo(canvas.width, 0)
                // ctx.lineTo(...prevPoints[i])
            }
        }

        if ([2, 3, 4].includes(mode)) {
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
