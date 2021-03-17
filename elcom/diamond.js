import Tweakpane from "tweakpane"
import presets from './presets-globe.json'
import getCanvasMaxSize from './modules/getCanvasMaxSize'
import {drawHalfEllipseBezierByCenter} from "./modules/drawEllipseBezier"
import { drawDiamond } from "./modules/drawDiamond"

const PI = Math.PI
let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

let paramsDefault = {
    radiusX: 0.5,
    radiusY: 0.3,
    rotate: 0,
    segments: 6,
    realPerspective: false,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    color3: {r: 250, g: 120, b: 20},
    twist: .1,
    gradCenter: {x: 0.5, y: 0.5},
    gradRadius: 1,
    gradMiddlePoint: 0.5,
    globeCenter: {x: 0.1, y: -0.1},
    rotateSpeed: 1,
    preset: 0
}

let params = Object.assign({}, paramsDefault)
window.pane = new Tweakpane()

const f1 = pane.addFolder({
    title: 'Настройки',
})

f1.addSeparator()
f1.addInput(params, 'radiusX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'radiusY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'rotate', {min: -180, max: 180, step: 0.1})
f1.addInput(params, 'realPerspective')
f1.addInput(params, 'segments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')
f1.addInput(params, 'color3')
f1.addInput(params, 'gradCenter', {
    x: {min: -1, max: 1, step: 0.01},
    y: {min: -1, max: 1, step: 0.01}
})
f1.addInput(params, 'gradRadius', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'gradMiddlePoint', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'globeCenter', {
    x: {min: -0.5, max: 0.5, step: 0.01},
    y: {min: -0.5, max: 0.5, step: 0.01}
})
f1.addInput(params, 'rotateSpeed', {min: 0, max: 2000, step: 1})
f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset' + i] = i
        return acc
    }, {})
})

pane.on('change', e => {
    if (e.presetKey === 'preset') {
        Object.assign(params, paramsDefault, presets[e.value])
        pane.refresh()
    }
})

let shift = 0

let render = () => {
    let segments = params.segments
    let canvasMaxSize = getCanvasMaxSize(canvas)

    let gradCX = (0.5 + params.gradCenter.x) * canvas.width
    let gradCY = (0.5 + params.gradCenter.y) * canvas.height
    let gradient = ctx.createRadialGradient(gradCX, gradCY, 0, gradCX, gradCY, params.gradRadius * canvasMaxSize)

    let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    let color3 = `rgba(${params.color3.r}, ${params.color3.g}, ${params.color3.b})`

    gradient.addColorStop(0, color1)
    gradient.addColorStop(params.gradMiddlePoint, color2)
    gradient.addColorStop(1, color3)

    ctx.fillStyle = gradient
    ctx.strokeStyle = gradient

    let globeCX = (.5 + params.globeCenter.x) * canvas.width
    let globeCY = (.5 + params.globeCenter.y) * canvas.height
    let globeRX = params.radiusX * canvasMaxSize
    let globeRY = params.radiusY * canvasMaxSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!params.realPerspective) {
        for (let i = 0; i <= segments; i++) {
            if (shift > 0 && i === 0 || shift < 0 && i === segments) continue

            let halfSegments = segments / 2
            let rx = globeRX * (i - shift - halfSegments) / halfSegments
            drawDiamond(ctx, globeCX, globeCY, rx, globeRY)
        }
    } else {
        let segments2 = segments * 2 // with hidden on other side

        for (let i = 0; i < segments2; i++) {
            let thiSegmentAngle = 2 * PI / segments2 * i + shift
            let cos = Math.cos(thiSegmentAngle)
            let tan = Math.tan(thiSegmentAngle)
            let rx = globeRX * cos

            if (cos > 0 && tan > 0 || cos < 0 && tan < 0) {
                drawDiamond(ctx, globeCX, globeCY, rx, globeRY)
            }
        }
    }

    drawDiamond(ctx, globeCX, globeCY, globeRX, globeRY)
    drawDiamond(ctx, globeCX, globeCY, -globeRX, globeRY)

    let rotateSlowdown = (params.realPerspective) ? 0.004 : 0.01
    shift += mouseX * rotateSlowdown

    if (!params.realPerspective && (shift >= 1 || shift <= -1)) {
        shift = 0
    }

    requestAnimationFrame(render)
}

function getMousePower(x, y) {
    let power
    let distanceX = x - mouseX
    let distanceY = y - mouseY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    let distanceFixed = distance / params.size // чтобы единица была на расстоянии в размер объекта

    power = Math.E ** -(PI / 2 * distanceFixed)

    return power
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    windowWidth = window.innerWidth
    windowHeight = window.innerHeight
}

resize()
render()

window.addEventListener('resize', resize)

window.addEventListener('mousemove', e => {
    mouseX = (e.clientX - canvas.offsetLeft - windowWidth / 2) / windowWidth
    mouseY = (e.clientY - canvas.offsetTop - windowHeight / 2) / windowHeight
})
// window.addEventListener('click', render)

let saveBtn = document.querySelector('[data-save]')
saveBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(pane.exportPreset()))
})