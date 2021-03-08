import Tweakpane from "tweakpane"
import drawRotatedRect from "./modules/drawRotatedRect2"
import getGradCoords from "../canvas-mesh/modules/getGradCoords"
import presets from './presets.json'

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

let paramsDefault = {
    centerX: 0.72,
    centerY: 0.5,
    width: 1.00,
    height: 0.78,
    backSize: 0.3,
    parallax: 0.78,
    segments: 15,
    crossLines: 5,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    twist: .1,
    maxPower: .3,
    minOpacity: 0,
    gradDirX: "right",
    gradDirY: "top",
    bindTopLeft: false,
    bindTopLeftPos: {x: 0, y: 0},
    bindTopRight: false,
    bindTopRightPos: {x: 1, y: 0},
    bindBottomLeft: false,
    bindBottomLeftPos: {x: 0, y: 1},
    bindBottomRight: false,
    bindBottomRightPos: {x: 1, y: 1},
    hideBody: false,
    rotateSpeed: 60,
    preset: 0
}

let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane()

const f1 = pane.addFolder({
    title: 'Настройки',
})

let bindPosOptions = {
    x: {min: 0, max: 1, step: 0.01},
    y: {min: 0, max: 1, step: 0.01},
}

f1.addSeparator()
f1.addInput(params, 'width', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'height', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'centerX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'centerY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'segments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'crossLines', {min: 0, max: 100, step: 1})
f1.addInput(params, 'backSize', {min: 0, max: 1, step: 0.05})
f1.addInput(params, 'parallax', {min: 0, max: 1, step: 0.05})
f1.addInput(params, 'twist', {min: 0, max: Math.PI, step: 0.01})
// f1.addInput(params, 'maxPower', {min: 0, max: 5, step: 0.1})
f1.addInput(params, 'minOpacity', {min: 0, max: 1, step: 0.1})
f1.addInput(params, 'bindTopLeft')
f1.addInput(params, 'bindTopLeftPos', bindPosOptions)
f1.addInput(params, 'bindTopRight')
f1.addInput(params, 'bindTopRightPos', bindPosOptions)
f1.addInput(params, 'bindBottomLeft')
f1.addInput(params, 'bindBottomLeftPos', bindPosOptions)
f1.addInput(params, 'bindBottomRight')
f1.addInput(params, 'bindBottomRightPos', bindPosOptions)
f1.addInput(params, 'hideBody')
f1.addInput(params, 'rotateSpeed', {min: 0, max: 2000, step: 1})
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')

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

let render = () => {
    let time = performance.now() * params.rotateSpeed / 200000
    let segments = params.segments
    let x = params.centerX * canvas.width
    let y = params.centerY * canvas.height
    let frontWidth = params.width * canvas.width
    let frontHeight = params.height * canvas.height
    let backWidth = frontWidth * params.backSize
    let backHeight = frontHeight * params.backSize

    let maxOffsetX = params.parallax * canvas.width
    let maxOffsetY = params.parallax * canvas.height

    let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    let grd = ctx.createLinearGradient(...gradientCoords)
    let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    grd.addColorStop(0, color1)
    grd.addColorStop(1, color2)
    ctx.strokeStyle = grd

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let pointsFront
    let pointsBack

    for (let i = 0; i <= segments; i++) {
        let segmentPower = i / segments
        let width = frontWidth - (frontWidth - backWidth) * segmentPower
        let height = frontHeight - (frontHeight - backHeight) * segmentPower

        let xShifted = x - mouseX * maxOffsetX * (i - segments / 2) / segments
        let yShifted = y - mouseY * maxOffsetY * (i - segments / 2) / segments

        let angle = 30 * Math.sin(time + i * params.twist)

        let points = drawRotatedRect(ctx, xShifted, yShifted, width, height, angle, params.hideBody)

        if (params.bindTopLeft) {
            ctx.moveTo(params.bindTopLeftPos.x * canvas.width, params.bindTopLeftPos.y * canvas.height)
            ctx.lineTo(points[0][0], points[0][1])
        }
        if (params.bindTopRight) {
            ctx.moveTo(params.bindTopRightPos.x * canvas.width, params.bindTopRightPos.y * canvas.height)
            ctx.lineTo(points[1][0], points[1][1])
        }
        if (params.bindBottomRight) {
            ctx.moveTo(params.bindBottomRightPos.x * canvas.width, params.bindBottomRightPos.y * canvas.height)
            ctx.lineTo(points[2][0], points[2][1])
        }
        if (params.bindBottomLeft) {
            ctx.moveTo(params.bindBottomLeftPos.x * canvas.width, params.bindBottomLeftPos.y * canvas.height)
            ctx.lineTo(points[3][0], points[3][1])
        }

        if (!params.hideBody) {
            if (i === 0) {
                pointsFront = points
            } else {
                pointsBack = points
                for (let i = 0; i < 4; i++) {
                    let stripesCount = params.crossLines + 1

                    let frontPointX = pointsFront[i][0]
                    let backPointX = pointsBack[i][0]
                    let frontPointY = pointsFront[i][1]
                    let backPointY = pointsBack[i][1]

                    let iNext = i + 1
                    if (iNext > 3) iNext = 0

                    let frontPointNextX = pointsFront[iNext][0]
                    let backPointNextX = pointsBack[iNext][0]
                    let frontPointNextY = pointsFront[iNext][1]
                    let backPointNextY = pointsBack[iNext][1]

                    let frontDistanceX = (frontPointNextX - frontPointX)
                    let frontDistanceY = (frontPointNextY - frontPointY)
                    let backDistanceX = (backPointNextX - backPointX)
                    let backDistanceY = (backPointNextY - backPointY)

                    for (let j = 0; j <= stripesCount; j++) {
                        let x0 = frontPointX + frontDistanceX * j / stripesCount
                        let y0 = frontPointY + frontDistanceY * j / stripesCount
                        let x1 = backPointX + backDistanceX * j / stripesCount
                        let y1 = backPointY + backDistanceY * j / stripesCount

                        ctx.moveTo(x0, y0)
                        ctx.lineTo(x1, y1)
                    }
                }
                pointsFront = points
            }
        }

        ctx.globalAlpha = 1 - (1 - params.minOpacity) * i / segments
        ctx.stroke()
        ctx.closePath()
    }

    requestAnimationFrame(render)
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

    windowWidth = window.innerWidth
    windowHeight = window.innerHeight

    render()
}

resize()

window.addEventListener('resize', resize)

window.addEventListener('mousemove', e => {
    mouseX = (e.clientX - canvas.offsetLeft - windowWidth / 2) / windowWidth
    mouseY = (e.clientY - canvas.offsetTop - windowHeight / 2) / windowHeight
})
window.addEventListener('click', render)

let saveBtn = document.querySelector('[data-save]')
saveBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(pane.exportPreset()))
})