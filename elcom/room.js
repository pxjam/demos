import Tweakpane from "tweakpane"
import drawRotatedRect from "./modules/drawRotatedRect"

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

let params = {
    centerX: 0.5,
    centerY: 0.5,
    width: 0.8,
    height: 0.5,
    backSize: 0.3,
    segments: 3,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    maxPower: .3,
    minOpacity: 0.3,
    gradDirX: "right",
    gradDirY: "top",
}

let pane = new Tweakpane()

const f1 = pane.addFolder({
    title: 'Настройки',
})

f1.addSeparator()
f1.addInput(params, 'width', {min: 0.01, max: 1, step: 0.01})
f1.addInput(params, 'height', {min: 0.01, max: 1, step: 0.01})
f1.addInput(params, 'centerX', {min: 0.01, max: 1, step: 0.01})
f1.addInput(params, 'centerY', {min: 0.01, max: 1, step: 0.01})
f1.addInput(params, 'segments', {min: 1, max: 40, step: 1})
f1.addInput(params, 'backSize', {min: 0, max: 1, step: 0.05})
// f1.addInput(params, 'timeSlowdown', {min: 1, max: 2000, step: 20})
f1.addInput(params, 'maxPower', {min: 0, max: 5, step: 0.1})
f1.addInput(params, 'minOpacity', {min: 0, max: 1, step: 0.1})
// f1.addInput(params, 'perspective', {min: 0, max: 1, step: 0.1})
// f1.addInput(params, 'step', {min: 0, max: 100, step: 1})
// f1.addInput(params, 'rotateRadius', {min: 0, max: 300, step: 10})
// f1.addInput(params, 'segmentRotation', {min: 0, max: 7, step: 0.01})

f1.addInput(params, 'color1')
f1.addInput(params, 'color2')


let render = () => {
    let size = params.size
    // let step = 20
    let segments = params.segments
    let x = params.centerX * canvas.width
    let y = params.centerY * canvas.height
    let frontWidth = params.width * canvas.width
    let frontHeight = params.height * canvas.height
    let backWidth = frontWidth * params.backSize
    let backHeight = frontHeight * params.backSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < segments; i++) {
        let width = frontWidth - (frontWidth - backWidth) * i / segments
        let height = frontHeight - (frontHeight - backHeight) * i / segments

        //console.log('height', height)
        console.log('i', i)
        console.log('frontWidth', frontWidth)
        console.log('backWidth', backWidth)
        console.log('width', width)
        drawRotatedRect(ctx, x, y, width, height, 0)
        // ctx.strokeRect(100,100, width,height)
        ctx.stroke()
    }

    // let time = performance.now() / 500
    //
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    //
    // let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    // let grd = ctx.createLinearGradient(...gradientCoords)
    // let color1 = `rgba(${params.color1.join(',')})`
    // let color2 = `rgba(${params.color2.join(',')})`
    // grd.addColorStop(0, color1)
    // grd.addColorStop(1, color2)
    //
    // ctx.strokeStyle = grd
    //
    // for (let i = 1; i < stepCount; i++) {
    //     let x0 = params.rotateCenterX + 40 * Math.sin((time + i) / 6)
    //     let y0 = params.rotateCenterY + 40 * Math.cos((time + i) / 6)
    //
    //     ctx.globalAlpha = params.minOpacity + i / stepCount * (1 - params.minOpacity)
    //
    //     let x = x0 + i * step
    //     let y = y0 + i * step
    //
    //     let power = getMousePower(x, y)
    //
    //     let width = size * (1 + params.maxPower * power)
    //     let height = width
    //
    //     drawRotatedRect(ctx, x, y, width, height, time + i)
    //
    //     ctx.moveTo(x + width / 2 * Math.sin(-(time + i) / 62), y + height / 2 * Math.cos(-(time + i) / 62))
    //
    //     let xn = x0 + (i + 1) * step
    //     let yn = y0 + (i + 1) * step
    //     ctx.lineTo(xn + width / 2 * Math.sin(-(time + i + 1) / 62), yn + height / 2 * Math.cos(-(time + i + 1) / 62))
    //
    //     ctx.stroke()
    // }


    // requestAnimationFrame(render)
}

function getMousePower(x, y) {
    let power
    let distanceX = x - mouseX
    let distanceY = y - mouseY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    let distanceFixed = distance / params.size // чтобы единица была на расстоянии в размер объекта

    power = Math.E ** -(Math.PI / 2 * distanceFixed)
    return power
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    render()
}

resize()

window.addEventListener('resize', resize)

window.addEventListener('mousemove', e => {
    mouseX = e.clientX - canvas.offsetLeft
    mouseY = e.clientY - canvas.offsetTop
})
window.addEventListener('click', render)