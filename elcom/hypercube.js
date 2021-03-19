import {multiply} from 'mathjs'
// import {points, edges} from "./3d/chrystal"
import Chrystal from "./3d/Chrystal"

let sin = Math.sin
let cos = Math.cos

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let params = {
    cameraDistance: 5
}

// let model = new Cube()
let model = new Chrystal({
    height: 2,
    radius: 2,
    segments: 10
})
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
                //[-sin(rotation), 0, -cos(rotation)],
                [0, 1, 0],
                // [0, 1, 0],
                [-sin(rotationY), 0, cos(rotationY)]
            ],
            pointRotatedByX
        )

        rotatedPoints.push(pointRotatedByY)
    })

    let points2D = []

    rotatedPoints.forEach(point => {

        let scale = 1 / (params.cameraDistance - point[2])

        let scaledX = point[0] * scale
        let scaledY = point[1] * scale
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

        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
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
    drawShape(projection3D(points, angleX, angleY), edges, 1000)
    requestAnimationFrame(update)
}

let angleX = 0
let angleY = 0
let rotateSpeed = 0.002
ctx.strokeStyle = '#0000ff'

update()

window.params = params