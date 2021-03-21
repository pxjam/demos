import {multiply} from 'mathjs'
import mouse from "../src/core/mouse"
import Cube from "../src/geometry/Cube"
import {cos, sin, PI} from '../src/core/math'
import {canvas, ctx} from '../src/core/scene'

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

function projection(points3D, rotationX, rotationY,) {
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

        ctx.moveTo(...mouseShift(x1, y1))
        ctx.lineTo(...mouseShift(x2, y2))
    })
    ctx.stroke()
    ctx.restore()
}

function update() {
    ctx.strokeStyle = '#0033ff'

    let time = performance.now()
    angleX = cos(time / 30000)

    angleX = 0.2 * cos(time / 10000)
    angleY = time / 10000

    // angleX += mouse.y / 100
    // angleY += mouse.x / 100

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let projectedPoints = projection(points, angleX, angleY)
    drawShape(projectedPoints, edges, params.baseSize)

    requestAnimationFrame(update)
}

function mouseShift(x, y) {
    let power
    let distanceX = x - mouse.cx
    let distanceY = y - mouse.cy
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    let distanceFixed = distance / params.baseSize / params.mouseDistance
    power = Math.E ** -(PI / 2 * distanceFixed)

    let shiftX = distanceX * power
    let shiftY = distanceY * power

    return [x + shiftX, y + shiftY]
}

let angleX = 0
let angleY = 0
let rotateSpeed = 0.002

update()

window.params = params