import Tweakpane from "tweakpane"
import presets from './presets-globe.js'
import getCanvasMaxSize from './modules/getCanvasMaxSize'
import {drawHalfEllipseBezierByCenter} from "./modules/drawEllipseBezier"
import ellipseLine from "./modules/ellipseLine"

const PI = Math.PI
let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

let globeCX
let globeCY
let globeRX
let globeRY

let paramsDefault = {
    radiusX: 0.35,
    radiusY: 0.25,
    rotate: 0,
    segments: 7,
    parallels: 4,
    realPerspective: true,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    color3: {r: 250, g: 120, b: 20},
    twist: .1,
    gradCenter: {x: 0.5, y: 0.5},
    gradRadius: 1,
    gradMiddlePoint: 0.5,
    globeCenter: {x: 0.01, y: -0.01},
    rotateSpeed: 19,
    backfaceOpacity: 0.25,
    gradPreview: false,
    preset: 0
}

let params = Object.assign({}, paramsDefault)
window.pane = new Tweakpane({container: document.querySelector('[data-pane]')})

const f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

f1.addSeparator()
f1.addInput(params, 'radiusX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'radiusY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'rotate', {min: -180, max: 180, step: 0.1})
f1.addInput(params, 'realPerspective')
f1.addInput(params, 'segments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'parallels', {min: 0, max: 100, step: 1})
f1.addInput(params, 'backfaceOpacity', {min: 0, max: 1, step: 0.01})
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
f1.addInput(params, 'rotateSpeed', {min: 0, max: 200, step: 1})
f1.addInput(params, 'gradPreview')
pane.on('change', (ev) => {
    if (ev.presetKey === "gradPreview" && ev.value) {
        resize()
    }
})
f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset' + i] = i
        return acc
    }, {})
})
let saveBtn = f1.addButton({title: 'Copy preset'})
saveBtn.on('click', () => navigator.clipboard.writeText(JSON.stringify(pane.exportPreset())))

document.querySelector('.box').addEventListener('click', () => f1.expanded = false)

pane.on('change', e => {
    if (e.presetKey === 'preset') {
        Object.assign(params, paramsDefault, presets[e.value])
        pane.refresh()
    }
})

let shift = 0

let render = () => {
    let segments = params.segments
    let parallels = params.parallels
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

    globeCX = (.5 + params.globeCenter.x) * canvas.width
    globeCY = (.5 + params.globeCenter.y) * canvas.height
    globeRX = params.radiusX * canvasMaxSize
    globeRY = params.radiusY * canvasMaxSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!params.realPerspective) {
        for (let i = 0; i <= segments; i++) {
            if (shift > 0 && i === 0 || shift < 0 && i === segments) continue

            let halfSegments = segments / 2
            let rx = globeRX * (i - shift - halfSegments) / halfSegments
            drawHalfEllipseBezierByCenter(ctx, globeCX, globeCY, rx, globeRY)
        }
    } else {
        let segments2 = segments * 2 // with hidden on other side

        for (let i = 0; i < segments2; i++) {
            let thiSegmentAngle = 2 * PI / segments2 * i + shift
            let cos = Math.cos(thiSegmentAngle)
            let tan = Math.tan(thiSegmentAngle)
            let rx = globeRX * cos


            if (cos >= 0 && tan >= 0 || cos <= 0 && tan <= 0) {
                ctx.globalAlpha = 1
            } else {
                ctx.globalAlpha = params.backfaceOpacity
            }
            drawHalfEllipseBezierByCenter(ctx, globeCX, globeCY, rx, globeRY)
        }
        ctx.globalAlpha = 1
    }

    drawHalfEllipseBezierByCenter(ctx, globeCX, globeCY, globeRX, globeRY)
    drawHalfEllipseBezierByCenter(ctx, globeCX, globeCY, -globeRX, globeRY)

    let y0 = globeCY - globeRY
    let stepY = globeRY * 2 / (parallels + 1)

    for (let i = 1; i <= parallels; i++) {
        ctx.save()
        let y = y0 + i * stepY
        ctx.beginPath()
        ctx.moveTo(0, y)

        let xx = ellipseLine(globeCX, globeCY, globeRX, globeRY, 0, y, canvas.width, y)

        ctx.moveTo(xx[0] * canvas.width, y)
        ctx.lineTo(xx[1] * canvas.width, y)

        ctx.stroke()

        ctx.closePath()
        ctx.restore()
    }

    let rotateSlowdown = (params.realPerspective) ? 0.0004 : 0.001
    shift += mouseX * rotateSlowdown * params.rotateSpeed

    if (!params.realPerspective && (shift >= 1 || shift <= -1)) {
        shift = 0
    }

    if (params.gradPreview) {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fill()
    }

    requestAnimationFrame(render)
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    windowWidth = window.innerWidth
    windowHeight = window.innerHeight
}

if (presets.length) {
    Object.assign(params, paramsDefault, presets[0])
    pane.refresh()
}
resize()
render()

window.addEventListener('resize', resize)

window.addEventListener('mousemove', e => {
    mouseX = (e.clientX - canvas.offsetLeft - windowWidth / 2) / windowWidth
    mouseY = (e.clientY - canvas.offsetTop - windowHeight / 2) / windowHeight
})
// window.addEventListener('click', render)