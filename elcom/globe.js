import Tweakpane from "tweakpane"
import presets from './presets-globe.json'
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
    gradPreview: false,
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
f1.addInput(params, 'parallels', {min: 0, max: 100, step: 1})
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

            if (cos > 0 && tan > 0 || cos < 0 && tan < 0) {
                drawHalfEllipseBezierByCenter(ctx, globeCX, globeCY, rx, globeRY)
            }
        }
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

        let yc = globeCY
        let ry = globeRY
        let rx = globeRX
        let xc = globeCX

        //let xx = Math.sqrt(1 - ((y - yc) ** 2 / ry ** 2 + 1 ) / rx ** 2) + xc
        // let xx = ry / rx * Math.sqrt((yc - ry) ** 2 + y ** 2)
        //console.log(xx)

        let xx = ellipseLine(globeCX, globeCY, globeRX, globeRY, 0, y, canvas.width, y)
        //console.log(y, xx)

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

let lineXEllipse = (y) => {
    let x1 = 0
    let x2 = canvas.width

    return ellipseLine(globeCX, globeCY, globeRX, globeRY, x1, y, x2, y)
}

window.lineXEllipse = lineXEllipse
// window.addEventListener('click', render)

let saveBtn = document.querySelector('[data-save]')
saveBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(pane.exportPreset()))
})