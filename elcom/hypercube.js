import {multiply} from 'mathjs'
import mouse from './modules/mouse'

let sin = Math.sin
let cos = Math.cos

let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let params = {
    cameraDistance: 5
}

let cube = [
    [-1, -1, -1],
    [-1, 1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, -1, 1],
    [-1, 1, 1],
    [1, -1, 1],
    [1, 1, 1]
]

let cubeEdges = [
    [0, 1],
    [0, 2],
    [0, 4],
    [1, 3],
    [1, 5],
    [2, 3],
    [2, 6],
    [3, 7],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7]
]

let diamondPoints = [
    [0, 1.5, 0],
    [1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [-1, 0, 1],
    [0, -1.5, 0]
]

let diamondEdges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1,2],
    [2,3],
    [3,4],
    [4,1],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4]
]

// let diamondTop = [0 ,0 ,1]
// let diamondBottom = [0 ,0 ,-1]
// let diamondRadius = 1
// let diamondSliceCount = 2
//
// let getSlicePoints = (angle) => {
//     return [
//         diamondTop,
//         [diamondRadius * cos(angle), diamondRadius * sin(angle), 0],
//         [diamondRadius * cos(-angle), diamondRadius * sin(-angle), 0],
//         diamondBottom
//     ]
// }
//
// let diamondSlices = Array(diamondSliceCount).forEach()

// let diamondPoints = diamondSlices.forEach(slice => {
//
// })

// let points = cubePoints
let points = diamondPoints

// let edges = cubeEdges
let edges = diamondEdges

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