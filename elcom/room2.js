import Tweakpane from "tweakpane"
import drawRotatedTriangle from "./modules/drawRotatedTriangle"
import presets from './presets-room2.js'
import getCanvasMaxSize from "./modules/getCanvasMaxSize"

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
    bindTopLeft: false,
    bindTopLeftPos: {x: 0, y: 0},
    bindTopRight: false,
    bindTopRightPos: {x: 1, y: 0},
    bindBottomRight: false,
    bindBottomRightPos: {x: 1, y: 1},
    hideBody: false,
    rotateSpeed: 60,
    mouseEffect: 'rotate',
    preset: 0
}

let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({container: document.querySelector('[data-pane]')})

const f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

let bindPosOptions = {
    x: {min: 0, max: 1, step: 0.01},
    y: {min: 0, max: 1, step: 0.01},
}

f1.addSeparator()
f1.addInput(params, 'width', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'height', {min: 0, max: 2, step: 0.01})
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
f1.addInput(params, 'bindBottomRight')
f1.addInput(params, 'bindBottomRightPos', bindPosOptions)
f1.addInput(params, 'hideBody')
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

f1.addInput(params, 'mouseEffect', {
    options: {
        'rotate' : 1,
        'distort': 2
    }
})

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

let render = () => {
    // console.log('render')
    let time = performance.now() * params.rotateSpeed / 200000
    let canvasMaxSize = getCanvasMaxSize(canvas)
    let segments = params.segments
    let x = params.centerX * canvas.width
    let y = params.centerY * canvas.height
    let frontWidth = params.width * canvas.width
    let frontHeight = params.height * canvas.height
    let backWidth = frontWidth * params.backSize
    let backHeight = frontHeight * params.backSize

    let maxOffsetX = params.parallax * canvas.width
    let maxOffsetY = params.parallax * canvas.height

    // let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY, canvas.width, canvas.height)
    // let grd = ctx.createLinearGradient(...gradientCoords)
    // let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    // let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    // let color3 = `rgb(${params.color3.r}, ${params.color3.g}, ${params.color3.b})`
    // grd.addColorStop(0, color1)
    // grd.addColorStop(1, color2)

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
        // ctx.fill()
    } else {
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

            let points = drawRotatedTriangle(ctx, xShifted, yShifted, width, height, angle, params.hideBody)

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

            if (!params.hideBody) {
                if (i === 0) {
                    pointsFront = points
                } else {
                    pointsBack = points
                    for (let i = 0; i < 3; i++) {
                        let stripesCount = params.crossLines + 1

                        let frontPointX = pointsFront[i][0]
                        let backPointX = pointsBack[i][0]
                        let frontPointY = pointsFront[i][1]
                        let backPointY = pointsBack[i][1]

                        let iNext = i + 1
                        if (iNext > 2) iNext = 0

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
window.addEventListener('click', render)