import * as dat from 'dat.gui'
import getGradCoords from "./modules/getGradCoords"
import drawRotatedRect from "./modules/drawRotatedRect"

window.gui = new dat.gui.GUI({
    closed: true
})
gui.domElement.id = 'gui';

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

let params = {
    gradDirX: "right",
    gradDirY: "top",
    color1: [0, 251, 235],
    color2: [186, 0, 250],
    maxPower: .3,
    minOpacity: 0.3
}

gui.remember(params)

gui.addColor(params, 'color1')
gui.addColor(params, 'color2')
gui.add(params, 'gradDirX', ['left', 'center', 'right'])
gui.add(params, 'gradDirY', ['top', 'center', 'bottom'])


let render = () => {
    // let size = params.size
    // let step = 20
    // let stepCount = 10
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

    requestAnimationFrame(render)
}

render()

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