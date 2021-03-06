import Tweakpane from 'tweakpane'
import {createGradControls, getActualGradient, gradParams} from './modules/gradient'
import presets from './presets/index'
import getPreset from '../common/utils/getPreset'

let paramsDefault = {
    firstCubeSize: 50,
    cubesCount: 1,
    // firstCubeSize: 5,
    // cubesCount: 10,
    backfaceVisible: false,
    bgLight: true,
    duplicateMethod: 'sum',
    duplicateFactor: 0.4,
    framesOverlay: 0,
    perspective: 1500,
    autorotate: true,
    autorotateSpeed: 25,
    // stepRotate: 1.1,
    innerRotateSpeed: 15,
    revertInnerRotate: false,
    mouseRotatePower: 25,
    mouseRotateInertia: 200,
    zoom: 1,
    size: 1.2,
    centerX: 0.5,
    centerY: 0.5,
    ...gradParams
}
let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

function reduceArrayToObject(acc, curr) {
    acc[curr] = curr
    return acc
}

f1.addInput(params, 'firstCubeSize', {min: 1, max: 100, step: 1})
f1.addInput(params, 'cubesCount', {min: 1, max: 50, step: 1})
f1.addInput(params, 'duplicateFactor', {min: 0.01, max: 3, step: 0.001})
f1.addInput(params, 'duplicateMethod', {
    options: ['sum', 'multiply'].reduce(reduceArrayToObject, {})
})
f1.addInput(params, 'backfaceVisible')
f1.addInput(params, 'autorotate')
f1.addInput(params, 'autorotateSpeed', {min: 0, max: 100, step: 1})
f1.addInput(params, 'revertInnerRotate')
f1.addInput(params, 'innerRotateSpeed', {min: 0, max: 100, step: 1})
f1.addInput(params, 'mouseRotatePower', {min: 1, max: 100, step: 1})
f1.addInput(params, 'mouseRotateInertia', {min: 1, max: 1000, step: 1})
f1.addInput(params, 'centerX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'centerY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'perspective', {min: 0, max: 3000, step: 1})
// f1.addInput(params, 'zoom', {min: 0, max: 1000, step: 1})
f1.addInput(params, 'size', {min: 0.1, max: 4, step: 0.1})
f1.addInput(params, 'framesOverlay', {min: 0, max: 1, step: 0.01})
f1.addSeparator()
createGradControls(f1, params)

f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset ' + (i + 1)] = i
        return acc
    }, {})
})

if (presets.length) {
    Object.assign(params, paramsDefault, presets[0])
    pane.refresh()
}

let saveBtn = f1.addButton({title: 'Copy preset'})
saveBtn.on('click', () => navigator.clipboard.writeText(getPreset(pane.exportPreset())))

document.querySelector('.box').addEventListener('click', () => f1.expanded = false)

let box
let canvas
let ctx
let cubes
let faces
let nx
let ny
let canvasW
let canvasH
let xm = 0
let ym = 0
let cx = 50
let cy = 50
let cz = 0
let cxb = 0
let cyb = 0
let white
let alpha
let fps = 0
let drag = true
let moved
let startX = 0
let startY = 0
let cosY
let sinY
let cosX
let sinX
let cosZ
let sinZ
let minZ
let angleY = 0
let angleX = 0
let angleZ = 0
let destroy = false
let running = true

// to except drawing same edge twice
let drawnLines = []
// fov
// let perspective = 1000
// let zoom = 1000

let gradient

function Point(parent, xyz, project) {
    this.project = project
    this.xo = xyz[0]
    this.yo = xyz[1]
    this.zo = xyz[2]
    this.cube = parent
}

Point.prototype.projection = function() {
    // 3D rotation
    let x = cosY * (sinZ * this.yo + cosZ * this.xo) - sinY * this.zo
    let y = sinX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) + cosX * (cosZ * this.yo - sinZ * this.xo)
    let z = cosX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) - sinX * (cosZ * this.yo - sinZ * this.xo)
    this.x = x
    this.y = y
    this.z = z
    if (this.project) {
        // point visible
        if (z < minZ) minZ = z
        this.visible = (params.zoom + z > 0)

        // 3D to 2D projection
        this.X = (canvasW * params.centerX) + x * (params.perspective / (z + params.zoom))
        this.Y = (canvasH * params.centerY) + y * (params.perspective / (z + params.zoom))
    }
}

// ======= polygon constructor ========
let Face = function(cube, index, normalVector) {
    // parent cube
    this.cube = cube

    // coordinates
    this.p0 = cube.points[index[0]]
    this.p1 = cube.points[index[1]]
    this.p2 = cube.points[index[2]]
    this.p3 = cube.points[index[3]]

    // normal vector
    this.normal = new Point(this, normalVector, false)
}

Face.prototype = {
    faceVisible: function() {
        // points visible
        if (this.p0.visible && this.p1.visible && this.p2.visible && this.p3.visible) {
            if (params.backfaceVisible) {
                this.visible = true
                return true
            }

            // back face culling
            if ((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) < (this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) ^ this.p0.X < this.p1.X == this.p0.X > this.p2.X) {
                // face visible
                this.visible = true
                return true
            }
        }

        // face hidden
        this.visible = false
        this.distance = -99999
        return false
    },

    distanceToCamera: function() {
        // distance to camera
        let dx = (this.p0.x + this.p1.x + this.p2.x + this.p3.x) * 0.25
        let dy = (this.p0.y + this.p1.y + this.p2.y + this.p3.y) * 0.25
        let dz = (params.zoom + params.perspective) + (this.p0.z + this.p1.z + this.p2.z + this.p3.z) * 0.25
        this.distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    },

    draw: function() {
        let r
        let g
        let b

        let drawSingleLine = (line) => {
            let lineSum = line.reduce((acc, val) => acc + val)

            if (drawnLines.indexOf(lineSum) === -1) {
                drawnLines.push(lineSum)
            } else {
                ctx.globalAlpha = 0
                //console.log('skip line')
                //ctx.moveTo(line[2], line[3])
            }
            ctx.lineTo(line[2], line[3])
            ctx.globalAlpha = 1
        }

        // shape face
        ctx.beginPath()

        ctx.moveTo(this.p0.X, this.p0.Y)

        let line = [this.p0.X, this.p0.Y, this.p1.X, this.p1.Y]
        drawSingleLine(line)

        line = [line[2], line[3], this.p2.X, this.p2.Y]
        drawSingleLine(line)

        line = [line[2], line[3], this.p3.X, this.p3.Y]
        drawSingleLine(line)

        line = [line[2], line[3], this.p0.X, this.p0.Y]
        drawSingleLine(line)

        ctx.closePath()

        // flat (lambert) shading
        this.normal.projection()
        let light = (
            white ?
                this.normal.y + this.normal.z * 0.5 :
                this.normal.z
        ) * 256
        r = g = b = light

        // fill
        // ctx.fillStyle = 'rgba(' +
        //     Math.round(r) + ',' +
        //     Math.round(g) + ',' +
        //     Math.round(b) + ',' + this.cube.alpha + ')'
        // ctx.fill()
        ctx.strokeStyle = gradient
        ctx.stroke()
    }
}

// ======== Cube constructor ========
let Cube = function(nx, ny, nz, x, y, z, w) {
    this.w = w
    this.points = []
    let p = [
        [x - w, y - w, z - w],
        [x + w, y - w, z - w],
        [x + w, y + w, z - w],
        [x - w, y + w, z - w],
        [x - w, y - w, z + w],
        [x + w, y - w, z + w],
        [x + w, y + w, z + w],
        [x - w, y + w, z + w]
    ]
    for (let i in p) this.points.push(
        new Point(this, p[i], true)
    )

    // faces coordinates
    let f = [
        [0, 1, 2, 3],
        [0, 4, 5, 1],
        [3, 2, 6, 7],
        [0, 3, 7, 4],
        [1, 5, 6, 2],
        [5, 4, 7, 6]
    ]

    // faces normals
    let nv = [
        [0, 0, 1],
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, -1]
    ]

    // cube transparency
    this.alpha = alpha ? 0.5 : 1
    // push faces
    for (let i in f) {
        faces.push(
            new Face(this, f[i], nv[i])
        )
    }
}


let resize = function() {
    // screen resize
    canvasW = box.offsetWidth
    canvasH = box.offsetHeight
    let o = box
    for (nx = 0, ny = 0; o != null; o = o.offsetParent) {
        nx += o.offsetLeft
        ny += o.offsetTop
    }
    canvas.width = canvasW
    canvas.height = canvasH
}

function reset() {
    cubes = []
    faces = []

    let size = params.firstCubeSize

    for (let i = 0; i < params.cubesCount; i++) {
        cubes.push(new Cube(0, 0, 0, 0, 0, 0, size))

        if (params.duplicateMethod === 'sum') {
            size += params.duplicateFactor * params.firstCubeSize
        } else if (params.duplicateMethod === 'multiply') {
            size *= params.duplicateFactor
        }
    }
}

let init = function() {
    box = document.querySelector('.box')
    canvas = document.querySelector('[data-canvas]')
    ctx = canvas.getContext('2d')

    // unified touch/mouse events handler
    box.ontouchstart = box.onmousedown = function(e) {
        if (!running) return true
        // touchstart
        if (e.target !== canvas) return
        e.preventDefault() // prevents scrolling
        if (box.setCapture) box.setCapture()
        moved = false
        //drag = true
        startX = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx
        startY = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny
    }

    box.ontouchmove = box.onmousemove = function(e) {
        if (!running) return true

        // touchmove
        e.preventDefault()
        xm = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx
        ym = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny

        // detectFaceOver()
        if (drag) {
            cx = cxb + (xm - startX) * params.mouseRotatePower / 100
            cy = cyb - (ym - startY) * params.mouseRotatePower / 100
            //console.log(cx)
        }

        if (Math.abs(xm - startX) > 10 || Math.abs(ym - startY) > 10) {
            // if pointer moves then cancel the tap/click
            moved = true
        }
    }

    // Z axis rotation (mouse wheel)
    // scr.addEventListener('DOMMouseScroll', function(e) {
    //     if (!running) return true
    //     cz += e.detail * 12
    //     return false
    // }, false)

    box.onmousewheel = function(e) {
        if (!running) return true
        cz += e.wheelDelta / 3
        return false
    }

    resize()
    window.addEventListener('resize', resize, false)

    reset()
    updateGradient()
    roundParams()
    run()
    updatePerspective()
}

// main loop
let run = function() {
    drawnLines = []
    ctx.save()


    if (params.gradPreview) {
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        // screen background
        let bg = (params.bgLight) ? '255,255,255' : '0,0,0'

        ctx.fillStyle = `rgba(${bg}, ${1 - params.framesOverlay})`
        ctx.fillRect(0, 0, canvasW, canvasH)

        // ctx.globalCompositeOperation = 'destination-out'
        // ctx.globalCompositeOperation = 'xor'

        // points projection
        minZ = 0
        let i = 0
        let c

        while (c = cubes[i++]) {
            // easing rotations
            angleX += ((cy - angleX) / params.mouseRotateInertia)
            angleY += ((cx - angleY) / params.mouseRotateInertia)
            angleZ += ((cz - angleZ) / params.mouseRotateInertia)

            let rotateFactor = (params.revertInnerRotate)
                ? (params.cubesCount - i + 1)
                : i

            let innerRotateSpeed = params.innerRotateSpeed / 100000

            // pre-calculating trigo
            cosY = Math.cos(angleY * innerRotateSpeed * rotateFactor)
            sinY = Math.sin(angleY * innerRotateSpeed * rotateFactor)
            cosX = Math.cos(angleX * innerRotateSpeed * rotateFactor)
            sinX = Math.sin(angleX * innerRotateSpeed * rotateFactor)
            cosZ = Math.cos(angleZ * innerRotateSpeed * rotateFactor)
            sinZ = Math.sin(angleZ * innerRotateSpeed * rotateFactor)

            let j = 0, p
            while (p = c.points[j++]) {
                p.projection()
            }
        }

        // if (params.autorotate) cz += 1
        if (params.autorotate) cz += params.autorotateSpeed / 10

        // adapt params.zoom
        // let d = -minZ + 100 - params.zoom
        // params.zoom += (d * ((d > 0) ? 0.05 : 0.01))

        // faces light
        let j = 0, f
        while (f = faces[j++]) {
            if (f.faceVisible()) {
                f.distanceToCamera()
            }
        }
        // faces depth sorting
        faces.sort(function(p0, p1) {
            return p1.distance - p0.distance
        })

        // painting faces
        j = 0
        while (f = faces[j++]) {
            if (f.visible) {
                f.draw()
            } else break
        }
    }

    ctx.restore()
    // console.log(drawnLines)
    fps++
    if (running) requestAnimationFrame(run)
}

let updateGradient = () => gradient = getActualGradient(canvas, params)

let updatePerspective = () => params.zoom = params.perspective * params.size
// let updatePerspective = () => params.perspective = params.zoom  * params.size

let roundParams = () => {
    for (let [key, value] of Object.entries(params)) {
        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            params[key] = (Number.isInteger(value))
                ? parseInt(value)
                : parseFloat(value.toFixed(3))
        }
    }
}


window.pane.on('change', (e) => {
    // pane.on('change', (ev) => {
    //     if (ev.presetKey === "gradPreview" && ev.value) {
    //         resize()
    //     }
    // })
    updatePerspective()
    roundParams()
    reset()
    updateGradient()
    // pane.refresh()
})

init()

window.params = params