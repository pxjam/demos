import {multiply} from 'mathjs'
import mouse from "./modules/mouse"
// import {points, edges} from "./3d/chrystal"
import Cube from "./3d/Cube"
import Chrystal from "./3d/Chrystal"

let needLog = false

let sin = Math.sin
let cos = Math.cos

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// let mouse = {
//     absX: 0,
//     absY: 0,
//     absCX: canvas.width / 2,
//     absCY: canvas.height / 2
// }

let params = {
    mouseDistance: 0.1,
    baseSize: 1000,
    orthographic: false,
    distance: 3,
    perspective: 3
}

let model = new Cube()
// let model = new Chrystal({
//     height: 2,
//     radius: 2,
//     segments: 10
// })
let points = model.points
let edges = model.edges

function projection3D(points3D, rotationX, rotationY,) {

    let rotatedPoints = []
    points3D.forEach(point => {
        let pointRotatedByX = multiply(
            [
                [1, 0, 0],
                [0, cos(rotationX), sin(rotationX)],
                [0, -sin(rotationX), cos(rotationX)]
            ],
            point
        )

        let pointRotatedByY = multiply(
            [
                [cos(rotationY), 0, sin(rotationY)],
                [0, 1, 0],
                [-sin(rotationY), 0, cos(rotationY)]
            ],
            pointRotatedByX
        )

        rotatedPoints.push(pointRotatedByY)
    })

    let points2D = []

    rotatedPoints.forEach(point => {
        let correction = params.distance / params.perspective

        let scale = (params.orthographic)
            ? 1 / params.distance
            : 1 / (params.perspective - point[2])

        let scaledX = point[0] * scale / correction / params.distance
        let scaledY = point[1] * scale / correction / params.distance
        points2D.push([scaledX, scaledY])

    })

    return points2D
}

function drawShape(points, edges, zoom) {
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2) // Origin is screen centre

    ctx.beginPath()

    edges.forEach((edge, i) => {
        let x1 = points[edge[0]][0] * zoom // Multiplying by a zoom factor so image isn't tiny
        let y1 = points[edge[0]][1] * zoom

        let x2 = points[edge[1]][0] * zoom
        let y2 = points[edge[1]][1] * zoom

        let log = false
        if (i === 0) log = true

        ctx.moveTo(...mouseShift(x1, y1, log))

        //ctx.fillRect(x1 - 3, y1 - 3, 6, 6)
        // console.log(x1)

        ctx.lineTo(...mouseShift(x2, y2))
    })
    ctx.stroke()
    ctx.restore()
}

function update() {
    // let time0 = performance.now()

    let time = performance.now()
    //let time = 20000 //performance.now()
    angleX = cos(time / 30000)

    angleX = 0.2 * cos(time / 10000)
    angleY = time / 10000

    // angleX += mouse.y / 100
    // angleY += mouse.x / 100

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let projectedPoints = projection3D(points, angleX, angleY)
    drawShape(projectedPoints, edges, params.baseSize)

    requestAnimationFrame(update)

    // let time1 = performance.now()
    // measure(time0, time1)
}

function mouseShift(x, y, log) {
    let power
    let distanceX = x - mouse.absCX
    let distanceY = y - mouse.absCY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    let distanceFixed = distance / params.baseSize / params.mouseDistance
    power = Math.E ** -(Math.PI / 2 * distanceFixed)
    
    if (log && needLog) {
        // console.log('distance', distance)
        // console.log('power', power)
        needLog = false
    }

    let shiftX = distanceX * power
    let shiftY = distanceY * power

    // console.log(distanceX)

    return [x + shiftX, y + shiftY]
}

let angleX = 0
let angleY = 0
let rotateSpeed = 0.002
ctx.strokeStyle = '#0000ff'

// window.addEventListener('click', e => {
//     mouse.absX = e.clientX
//     mouse.absY = e.clientY
//     mouse.absCX = e.clientX - canvas.width / 2
//     mouse.absCY = e.clientY - canvas.height / 2
//
//     needLog = true
//     //console.log(mouse.absCX, mouse.absCY)
// })

update()

window.params = params