import Tweakpane from 'tweakpane'
import {createGradControls, gradParams, getActualGradient} from './modules/gradient'
import mouse from './modules/mouse'
import {PI} from './modules/math'
import {Cube} from './geometry/Cube'
import {Globe} from './geometry/Globe'

let paramsDefault = {
    firstCubeSize: 300,
    cubesCount: 1,
    // firstCubeSize: 5,
    // cubesCount: 10,
    bgLight: true,
    duplicateMethod: 'sum',
    duplicateFactor: 1.15,
    framesOverlay: 0,
    focal: 2000,
    param: 0.1,
    mouse: false,
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
f1.addInput(params, 'duplicateFactor', {min: 0.5, max: 3, step: 0.001})
f1.addInput(params, 'bgLight')
f1.addInput(params, 'mouse', false)
f1.addInput(params, 'focal', {min: 0, max: 400, step: 1})
f1.addInput(params, 'param', {min: 0, max: 1, step: 0.1})
f1.addInput(params, 'framesOverlay', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'duplicateMethod', {
    options: ['sum', 'multiply'].reduce(reduceArrayToObject, {})
})
f1.addSeparator()
createGradControls(f1, params)

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
let autorotate = false
let destroy = false
let running = true
// fov
let fl = 250
let zoom = 0

let gradient

export function Point(parent, xyz, project) {
    this.project = project
    this.xo = xyz[0]
    this.yo = xyz[1]
    this.zo = xyz[2]
    this.parent = parent
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
        this.visible = (zoom + z > 0)
        // this.visible = true

        // 3D to 2D projection
        this.X = (canvasW * 0.5) + x * (fl / (z + zoom))
        this.Y = (canvasH * 0.5) + y * (fl / (z + zoom))
    }
}

// ======= polygon constructor ========
export let Face = function(parent, index, normalVector) {
    // parent parent
    this.parent = parent
    this.length = index.length
    this.hasGt3Points = index.length === 4

    // coordinates
    this.p0 = parent.points[index[0]]
    this.p1 = parent.points[index[1]]
    this.p2 = parent.points[index[2]]

    if (this.hasGt3Points) {
        this.p3 = parent.points[index[3]]
    }

    // normal vector
    this.normal = new Point(this, normalVector, false)
}

Face.prototype = {
    faceVisible3: function() {
        this.visible = true
        return
        // points visible
        if (this.p0.visible && this.p1.visible && this.p2.visible) {
            // back face culling
            if ((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) < (this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X)) {
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

    faceVisible4: function() {
        // points visible
        if (this.p0.visible && this.p1.visible && this.p2.visible && this.p3.visible) {
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
        let avgFactor = 1 / this.length

        let p3x = this.hasGt3Points ? this.p3.x : 0
        let p3y = this.hasGt3Points ? this.p3.y : 0
        let p3z = this.hasGt3Points ? this.p3.z : 0

        // distance to camera
        let dx = (this.p0.x + this.p1.x + this.p2.x + p3x) * avgFactor
        let dy = (this.p0.y + this.p1.y + this.p2.y + p3y) * avgFactor
        let dz = (zoom + fl) + (this.p0.z + this.p1.z + this.p2.z + p3z) * avgFactor
        this.distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    },

    draw: function() {
        let r
        let g
        let b

        // shape face
        ctx.beginPath()
        ctx.moveTo(...mouseShift(this.p0.X, this.p0.Y))
        ctx.lineTo(...mouseShift(this.p1.X, this.p1.Y))
        ctx.lineTo(...mouseShift(this.p2.X, this.p2.Y))

        if (this.length > 3) {
            ctx.lineTo(...mouseShift(this.p3.X, this.p3.Y))
        }
        ctx.closePath()

        // flat (lambert) shading
        this.normal.projection()
        let light = (
            white ?
                this.normal.y + this.normal.z * 0.5 :
                this.normal.z
        ) * 256
        r = g = b = light

        ctx.strokeStyle = gradient
        ctx.stroke()
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
        //let newCube = new Cube(0, 0, 0, size)

        let newCube = new Globe(size)

        cubes.push(newCube)
        faces.push(...newCube.faces)

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
            cx = cxb + (xm - startX)
            cy = cyb - (ym - startY)
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
        cz += e.wheelDelta / 5
        return false
    }

    resize()
    window.addEventListener('resize', resize, false)

    // fps count
    setInterval(function() {
        document.getElementById('fps').innerHTML = fps * 2
        fps = 0
    }, 500) // update every 1/2 seconds

    document.getElementById('alpha').onchange = function() {
        alpha = this.checked
    }

    document.getElementById('autor').onchange = function() {
        autorotate = this.checked
    }

    document.getElementById('stopgo').onclick = function() {
        running = !running
        document.getElementById('stopgo').value = running ? 'STOP' : 'GO!'
        if (running) run()
    }

    reset()
    updateGradient()
    roundParams()
    run()
}

// main loop
let run = function() {
    if (params.gradPreview) {
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        // screen background
        let bg = (params.bgLight) ? '255,255,255' : '0,0,0'
        ctx.fillStyle = `rgba(${bg}, ${1 - params.framesOverlay})`
        ctx.fillRect(0, 0, canvasW, canvasH)

        // easing rotations
        angleX += ((cy - angleX) * 0.001)
        angleY += ((cx - angleY) * 0.001)
        angleZ += ((cz - angleZ) * 0.001)
        if (autorotate) cz += 1

        // pre-calculating trigo
        cosY = Math.cos(angleY * 0.01)
        sinY = Math.sin(angleY * 0.01)
        cosX = Math.cos(angleX * 0.01)
        sinX = Math.sin(angleX * 0.01)
        cosZ = Math.cos(angleZ * 0.01)
        sinZ = Math.sin(angleZ * 0.01)

        // points projection
        minZ = 0
        let i = 0, c
        while (c = cubes[i++]) {
            let j = 0, p
            while (p = c.points[j++]) {
                p.projection()
            }
        }
        // adapt zoom
        let d = -minZ + 100 - zoom
        //zoom += (d * ((d > 0) ? 0.05 : 0.01))
        zoom = 500

        // faces light
        let j = 0, f
        while (f = faces[j++]) {
            if (
                f.length === 3 && f.faceVisible3()
                || f.length === 4 && f.faceVisible4()
            ) {
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
    fps++
    if (running) requestAnimationFrame(run)
}

let updateGradient = () => gradient = getActualGradient(canvas, params)

let roundParams = () => {
    for (let [key, value] of Object.entries(params)) {
        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            params[key] = (Number.isInteger(value))
                ? parseInt(value)
                : parseFloat(value.toFixed(3))
        }
    }
}

function mouseShift(x, y) {
    if (!params.mouse) return  [x,y]
    let power
    let distanceX = x - mouse.cx
    let distanceY = y - mouse.cy
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    // let distanceFixed = distance / params.baseSize / params.mouseDistance
    let distanceFixed = distance / 500
    power = Math.E ** -(PI / 2 * distanceFixed)

    let shiftX = distanceX * power
    let shiftY = distanceY * power

    return [x + shiftX, y + shiftY]
}

window.pane.on('change', (e) => {
    // pane.on('change', (ev) => {
    //     if (ev.presetKey === "gradPreview" && ev.value) {
    //         resize()
    //     }
    // })
    roundParams()
    reset()
    updateGradient()
})

init()

window.params = params