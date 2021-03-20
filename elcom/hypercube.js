import {multiply} from 'mathjs'
import mouse from "./modules/mouse"
// import {points, edges} from "./3d/chrystal"
import Cube from "./3d/Cube"

let sin = Math.sin
let cos = Math.cos

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let params = {
    orthographic: false,
    distance: 4,
    perspective: 2
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
    edges.forEach(edge => {

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
    let time = performance.now()
    //angleX = cos(time / 10000)
    angleX = 0.2 * cos(time / 10000)
    angleY = time / 1000

    // angleX += mouse.y / 100
    // angleY += mouse.x / 100

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let projectedPoints = projection3D(points, angleX, angleY)
    drawShape(projectedPoints, edges, 1000)

    requestAnimationFrame(update)
}

function mouseShift(x, y) {
    let power
    let distanceX = x - mouse.absX
    let distanceY = y - mouse.absY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    let distanceFixed = distance * 0.95

    power = Math.E ** -(Math.PI * distanceFixed)

    let shiftX = distanceX * power
    let shiftY = distanceY * power

    // console.log(distanceX)

    return [x + shiftX, y + shiftY]
}

let angleX = 0
let angleY = 0
let rotateSpeed = 0.002
ctx.strokeStyle = '#0000ff'

update()

window.params = params