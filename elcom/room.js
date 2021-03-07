import Tweakpane from "tweakpane"
import drawRotatedRect from "./modules/drawRotatedRect2"
import getGradCoords from "../canvas-mesh/modules/getGradCoords"

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

let params = {
    centerX: 0.5,
    centerY: 0.5,
    width: 0.8,
    height: 0.5,
    backSize: 0.3,
    parallax: 0.7,
    segments: 5,
    crossLines: 3,
    color1: {r: 0, g: 251, b: 235},
    color2: {r: 186, g: 0, b: 250},
    maxPower: .3,
    minOpacity: 0.3,
    gradDirX: "right",
    gradDirY: "top",
    bindTopLeft: false,
    bindTopRight: false,
    bindBottomLeft: false,
    bindBottomRight: false,
    hideBody: false
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
f1.addInput(params, 'crossLines', {min: 1, max: 40, step: 1})
f1.addInput(params, 'backSize', {min: 0, max: 1, step: 0.05})
// f1.addInput(params, 'timeSlowdown', {min: 1, max: 2000, step: 20})
f1.addInput(params, 'parallax', {min: 0, max: 1, step: 0.05})
f1.addInput(params, 'maxPower', {min: 0, max: 5, step: 0.1})
f1.addInput(params, 'minOpacity', {min: 0, max: 1, step: 0.1})
// f1.addInput(params, 'perspective', {min: 0, max: 1, step: 0.1})
// f1.addInput(params, 'step', {min: 0, max: 100, step: 1})
// f1.addInput(params, 'rotateRadius', {min: 0, max: 300, step: 10})
// f1.addInput(params, 'segmentRotation', {min: 0, max: 7, step: 0.01})

f1.addInput(params, 'bindTopLeft')
f1.addInput(params, 'bindTopRight')
f1.addInput(params, 'bindBottomLeft')
f1.addInput(params, 'bindBottomRight')
f1.addInput(params, 'hideBody')
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

    for (let i = 0; i < segments; i++) {
        let segmentPower = i / segments
        let width = frontWidth - (frontWidth - backWidth) * segmentPower
        let height = frontHeight - (frontHeight - backHeight) * segmentPower

        let xShifted = x - mouseX * maxOffsetX * (i - segments / 2) / segments
        let yShifted = y - mouseY * maxOffsetY * (i - segments / 2) / segments

        let points = drawRotatedRect(ctx, xShifted, yShifted, width, height, 0, params.hideBody)

        if (i === 0) {
            pointsFront = points
        }
        if (i === segments - 1) {
            pointsBack = points
        }

        if (params.bindTopLeft) {
            for (let j = 0; j < points.length; j++) {
                if (j === 2) continue
                ctx.moveTo(0, 0)
                ctx.lineTo(points[j][0], points[j][1])
            }
        }
        if (params.bindTopRight) {
            for (let j = 0; j < points.length; j++) {
                if (j === 3) continue
                ctx.moveTo(canvas.width, 0)
                ctx.lineTo(points[j][0], points[j][1])
            }
        }
        if (params.bindBottomRight) {
            for (let j = 0; j < points.length; j++) {
                if (j === 0) continue
                ctx.moveTo(canvas.width, canvas.height)
                ctx.lineTo(points[j][0], points[j][1])
            }
        }
        if (params.bindBottomLeft) {
            for (let j = 0; j < points.length; j++) {
                if (j === 1) continue
                ctx.moveTo(0, canvas.height)
                ctx.lineTo(points[j][0], points[j][1])
            }
        }

        ctx.stroke()
        ctx.closePath()
    }

    for (let i = 0; i < 4; i++) {
        // ctx.moveTo(pointsFirst[i][0], pointsFirst[i][1])
        // ctx.lineTo(pointsLast[i][0], pointsLast[i][1])

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

    ctx.stroke()

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