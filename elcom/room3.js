import Tweakpane from "tweakpane"
// import drawRotatedRect from "./modules/drawRotatedRect"
import presets from './presets.json'
import getCanvasMaxSize from "./modules/getCanvasMaxSize"

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
let mouseAbsX = 0
let mouseAbsY = 0
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

let paramsDefault = {
    centerX: 0.72,
    centerY: 0.5,
    width: 1.00,
    height: 0.78,
    backSize: 0.3,
    mouseRotate: 0.78,
    segments: 15,
    crossLines: 5,
    color1: {r: 186, g: 0, b: 250},
    color2: {r: 0, g: 126, b: 255},
    color3: {r: 0, g: 251, b: 235},
    twist: .1,
    maxPower: .3,
    minOpacity: 0,
    gradCenter: {x: 0.5, y: 0.5},
    gradRadius: 1,
    gradMiddlePoint: 0.5,
    gradPreview: false,
    gradDirX: "right",
    gradDirY: "top",
    rotateSpeed: 60,
    mouseRadius: 150,
    mousePower: 0.8,
    // mouseEffect: 'rotate',
    mouseEffect: 'push',
    preset: 0
}

let params = Object.assign({}, paramsDefault)

let size = canvas.width * params.width

window.pane = new Tweakpane()

const f1 = pane.addFolder({
    title: 'Настройки',
})

f1.addSeparator()
f1.addInput(params, 'width', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'height', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'centerX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'centerY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'segments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'crossLines', {min: 0, max: 100, step: 1})
f1.addInput(params, 'backSize', {min: 0, max: 1, step: 0.05})
f1.addInput(params, 'mouseRotate', {min: 0, max: 1, step: 0.05})
f1.addInput(params, 'twist', {min: 0, max: Math.PI, step: 0.01})
f1.addInput(params, 'minOpacity', {min: 0, max: 1, step: 0.1})
f1.addInput(params, 'rotateSpeed', {min: 0, max: 2000, step: 1})
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')
f1.addInput(params, 'color3')
f1.addInput(params, 'gradCenter', {
    x: {min: -1, max: 1, step: 0.01},
    y: {min: -1, max: 1, step: 0.01}
})
f1.addInput(params, 'gradRadius', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'gradMiddlePoint', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'gradPreview')
pane.on('change', (ev) => {
    if (ev.presetKey === "gradPreview" && ev.value) {
        resize()
    }
})

f1.addInput(params, 'mouseRadius', {min: 0, max: 2000, step: 1})
f1.addInput(params, 'mousePower', {min: 0, max: 5, step: 0.01})
f1.addInput(params, 'mouseEffect', {
    options: {
        rotate: 'rotate',
        push: 'push'
    }
})

f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset' + i] = i
        return acc
    }, {})
})

document.querySelector('.box').addEventListener('click', () => f1.expanded = false)

pane.on('change', e => {
    if (e.presetKey === 'preset') {
        Object.assign(params, paramsDefault, presets[e.value])
        pane.refresh()
    }
})

let render = () => {
    let time = performance.now() * params.rotateSpeed / 200000
    let canvasMaxSize = getCanvasMaxSize(canvas)
    let segments = params.segments
    let x = params.centerX * canvas.width
    let y = params.centerY * canvas.height
    let frontWidth = params.width * canvas.width
    let frontHeight = params.height * canvas.height
    let backWidth = frontWidth * params.backSize
    let backHeight = frontHeight * params.backSize

    let maxOffsetX = params.mouseRotate * canvas.width
    let maxOffsetY = params.mouseRotate * canvas.height

    let gradCX = (0.5 + params.gradCenter.x) * canvas.width
    let gradCY = (0.5 + params.gradCenter.y) * canvas.height
    let gradient = ctx.createRadialGradient(gradCX, gradCY, 0, gradCX, gradCY, params.gradRadius * canvasMaxSize)

    let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    let color3 = `rgba(${params.color3.r}, ${params.color3.g}, ${params.color3.b})`

    gradient.addColorStop(0, color1)
    gradient.addColorStop(params.gradMiddlePoint, color2)
    gradient.addColorStop(1, color3)

    ctx.strokeStyle = gradient
    ctx.fillStyle = gradient

    if (params.gradPreview) {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let prevSegmentPoints = []

        for (let segmentId = 0; segmentId <= segments; segmentId++) {
            let segmentPower = segmentId / segments
            let width = frontWidth - (frontWidth - backWidth) * segmentPower
            let height = frontHeight - (frontHeight - backHeight) * segmentPower

            let segmentCX = x
            let segmentCY = y

            if (true || params.mouseEffect === 'rotate') {
                segmentCX = x - mouseX * maxOffsetX * (segmentId - segments / 2) / segments
                segmentCY = y - mouseY * maxOffsetY * (segmentId - segments / 2) / segments
            }
            let degrees = 30 * Math.sin(time + segmentId * params.twist)

            ctx.beginPath()
            let theta = degrees * Math.PI / 180

            let w2 = width / 2
            let h2 = height / 2

            let sin = Math.sin(theta)
            let cos = Math.cos(theta)

            function rotatePoint(pointX, pointY) {
                return [
                    cos * (pointX - segmentCX) - sin * (pointY - segmentCY) + segmentCX,
                    sin * (pointX - segmentCX) + cos * (pointY - segmentCY) + segmentCY
                ]
            }

            let corners = [
                rotatePoint(segmentCX - w2, segmentCY - h2),
                rotatePoint(segmentCX + w2, segmentCY - h2),
                rotatePoint(segmentCX + w2, segmentCY + h2),
                rotatePoint(segmentCX - w2, segmentCY + h2)
            ]

            let lastCornerPointX = corners[3][0]
            let lastCornerPointY = corners[3][1]

            ctx.moveTo(...mouseShift(lastCornerPointX, lastCornerPointY))

            let prevCornerPoint = corners[3]
            let pointId = 0

            for (let cornerId = 0; cornerId < 4; cornerId++) {
                let thisCornerPoint = corners[cornerId]
                let crossStripesCount = params.crossLines + 1

                let stepX = (thisCornerPoint[0] - prevCornerPoint[0]) / crossStripesCount
                let stepY = (thisCornerPoint[1] - prevCornerPoint[1]) / crossStripesCount

                let pointOnEdgeX = prevCornerPoint[0]
                let pointOnEdgeY = prevCornerPoint[1]

                for (let lineId = 0; lineId <= params.crossLines; lineId++) {
                    pointOnEdgeX += stepX
                    pointOnEdgeY += stepY

                    ctx.lineTo(...mouseShift(pointOnEdgeX, pointOnEdgeY))

                    if (segmentId > 0 && prevSegmentPoints.length) {
                        ctx.moveTo(...mouseShift(prevSegmentPoints[pointId][0], prevSegmentPoints[pointId][1]))
                        ctx.lineTo(...mouseShift(pointOnEdgeX, pointOnEdgeY))
                    }

                    prevSegmentPoints[pointId] = [pointOnEdgeX, pointOnEdgeY]
                    pointId++
                }

                prevCornerPoint = thisCornerPoint
            }

            ctx.closePath()

            ctx.globalAlpha = 1 - (1 - params.minOpacity) * segmentId / segments
            ctx.stroke()
            ctx.closePath()
        }
    }

    requestAnimationFrame(render)
}

function mouseShift(x, y) {
    let power
    let distanceX = x - mouseAbsX
    let distanceY = y - mouseAbsY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    let distanceFixed = distance / params.mouseRadius
    let mousePower = 1 / params.mousePower
    power = Math.E ** -(mousePower * distanceFixed)

    let shiftX = distanceX * power
    let shiftY = distanceY * power

    return [x + shiftX, y + shiftY]
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    windowWidth = window.innerWidth
    windowHeight = window.innerHeight

    size = canvas.width * params.width
}

resize()
render()

window.addEventListener('resize', resize)

window.addEventListener('mousemove', e => {
    mouseAbsX = e.clientX - canvas.offsetLeft
    mouseAbsY = e.clientY - canvas.offsetTop
    mouseX = (mouseAbsX - windowWidth / 2) / windowWidth
    mouseY = (mouseAbsY - windowHeight / 2) / windowHeight
})
window.addEventListener('click', render)

let saveBtn = document.querySelector('[data-save]')
saveBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(pane.exportPreset()))
})

window.params = params