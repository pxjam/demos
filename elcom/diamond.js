import Tweakpane from "tweakpane"
import presets from './presets-diamond.json'
import getCanvasMaxSize from './modules/getCanvasMaxSize'
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
    parallels: 100,
    realPerspective: false,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    color3: {r: 250, g: 120, b: 20},
    twist: .1,
    gradCenter: {x: 0.5, y: 0.5},
    gradRadius: 1,
    gradMiddlePoint: 0.5,
    meshCenter: {x: 0.1, y: -0.1},
    rotateSpeed: 1,
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
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')
f1.addInput(params, 'color3')
f1.addInput(params, 'gradCenter', {
    x: {min: -1, max: 1, step: 0.01},
    y: {min: -1, max: 1, step: 0.01}
})
f1.addInput(params, 'gradRadius', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'gradMiddlePoint', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'meshCenter', {
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
let saveBtn = f1.addButton({title: 'Copy preset'});
saveBtn.on('click', () => navigator.clipboard.writeText(JSON.stringify(pane.exportPreset())));

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

    let meshCX = (.5 + params.meshCenter.x) * canvas.width
    let meshCY = (.5 + params.meshCenter.y) * canvas.height
    let meshRX = params.radiusX * canvasMaxSize
    let meshRY = params.radiusY * canvasMaxSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!params.realPerspective) {
        for (let i = 0; i <= segments; i++) {
            if (shift > 0 && i === 0 || shift < 0 && i === segments) continue

            let halfSegments = segments / 2
            let rx = meshRX * (i - shift - halfSegments) / halfSegments
            drawDiamond(ctx, meshCX, meshCY, rx, meshRY)
        }
    } else {
        let segments2 = segments * 2 // with hidden on other side

        for (let i = 0; i < segments2; i++) {
            let thiSegmentAngle = 2 * PI / segments2 * i + shift
            let cos = Math.cos(thiSegmentAngle)
            let tan = Math.tan(thiSegmentAngle)
            let rx = meshRX * cos

            if (cos > 0 && tan > 0 || cos < 0 && tan < 0) {
                drawDiamond(ctx, meshCX, meshCY, rx, meshRY)
            }
        }
    }

    drawDiamond(ctx, meshCX, meshCY, meshRX, meshRY)
    drawDiamond(ctx, meshCX, meshCY, -meshRX, meshRY)

    let y0 = meshCY - meshRY
    let x0 = meshCX
    let stepY = meshRY * 2 / (parallels + 1)
    let stepX = meshRX * 2 / (parallels + 1)

    for (let i = 1; i <= parallels + 1; i++) {
        ctx.save()
        let y = y0 + i * stepY
        let x1, x2

        if (i <= parallels / 2) {
            x1 = x0 - i * stepX
            x2 = x0 + i * stepX
        } else {
            x1 = x0 - (parallels + 1 - i) * stepX
            x2 = x0 + (parallels + 1 - i) * stepX
        }

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.moveTo(x1, y)
        ctx.lineTo(x2, y)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }

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

if(presets.length) {
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