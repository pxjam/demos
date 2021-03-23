// ======== private vars ========

let params = {
    firstCubeSize: 5,
    cubesCount: 10
}

let scr
let canvas
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
let ncube
let npoly
let faceOver
let drag
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
let bkgColor1 = 'rgba(0,0,0,0.1)'
let autorotate = false
let destroy = false
let running = true
// ---- fov ----
let fl = 250
let zoom = 0

function Canvas(id) {
    this.container = document.getElementById(id)
    this.ctx = this.container.getContext('2d')
    this.resize = function(w, h) {
        this.container.width = w
        this.container.height = h
    }
}

function Point(parent, xyz, project) {
    this.project = project
    this.xo = xyz[0]
    this.yo = xyz[1]
    this.zo = xyz[2]
    this.cube = parent
}

Point.prototype.projection = function() {
    // ---- 3D rotation ----
    let x = cosY * (sinZ * this.yo + cosZ * this.xo) - sinY * this.zo
    let y = sinX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) + cosX * (cosZ * this.yo - sinZ * this.xo)
    let z = cosX * (cosY * this.zo + sinY * (sinZ * this.yo + cosZ * this.xo)) - sinX * (cosZ * this.yo - sinZ * this.xo)
    this.x = x
    this.y = y
    this.z = z
    if (this.project) {
        // ---- point visible ----
        if (z < minZ) minZ = z
        this.visible = (zoom + z > 0)
        // ---- 3D to 2D projection ----
        this.X = (canvasW * 0.5) + x * (fl / (z + zoom))
        this.Y = (canvasH * 0.5) + y * (fl / (z + zoom))
    }
}

// ======= polygon constructor ========
let Face = function(cube, index, normalVector) {
    // ---- parent cube ----
    this.cube = cube
    // ---- coordinates ----
    this.p0 = cube.points[index[0]]
    this.p1 = cube.points[index[1]]
    this.p2 = cube.points[index[2]]
    this.p3 = cube.points[index[3]]
    // ---- normal vector ----
    this.normal = new Point(this, normalVector, false)
    // ---- # faces ----
    npoly++
    document.getElementById('npoly').innerHTML = npoly
}

Face.prototype = {
    faceVisible: function() {
        // ---- points visible ----
        if (this.p0.visible && this.p1.visible && this.p2.visible && this.p3.visible) {
            // ---- back face culling ----
            if ((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) < (this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) ^ this.p0.X < this.p1.X == this.p0.X > this.p2.X) {
                // ---- face visible ----
                this.visible = true
                return true
            }
        }
        // ---- face hidden ----
        this.visible = false
        this.distance = -99999
        return false
    },

    distanceToCamera: function() {
        // ---- distance to camera ----
        let dx = (this.p0.x + this.p1.x + this.p2.x + this.p3.x) * 0.25
        let dy = (this.p0.y + this.p1.y + this.p2.y + this.p3.y) * 0.25
        let dz = (zoom + fl) + (this.p0.z + this.p1.z + this.p2.z + this.p3.z) * 0.25
        this.distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    },

    draw: function() {
        let r
        let g
        let b
        // ---- shape face ----
        canvas.ctx.beginPath()
        canvas.ctx.moveTo(this.p0.X, this.p0.Y)
        canvas.ctx.lineTo(this.p1.X, this.p1.Y)
        canvas.ctx.lineTo(this.p2.X, this.p2.Y)
        canvas.ctx.lineTo(this.p3.X, this.p3.Y)
        canvas.ctx.closePath()

        // ---- flat (lambert) shading ----
        this.normal.projection()
        let light = (
            white ?
                this.normal.y + this.normal.z * 0.5 :
                this.normal.z
        ) * 256
        r = g = b = light

        // ---- fill ----
        // canvas.ctx.fillStyle = 'rgba(' +
        //     Math.round(r) + ',' +
        //     Math.round(g) + ',' +
        //     Math.round(b) + ',' + this.cube.alpha + ')'
        // canvas.ctx.fill()
        canvas.ctx.strokeStyle = 'rgba(255,255,255,1)'
        canvas.ctx.stroke()
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

    // ---- faces coordinates ----
    let f = [
        [0, 1, 2, 3],
        [0, 4, 5, 1],
        [3, 2, 6, 7],
        [0, 3, 7, 4],
        [1, 5, 6, 2],
        [5, 4, 7, 6]
    ]
    // ---- faces normals ----
    let nv = [
        [0, 0, 1],
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, -1]
    ]
    // ---- cube transparency ----
    this.alpha = alpha ? 0.5 : 1
    // ---- push faces ----
    for (let i in f) {
        faces.push(
            new Face(this, f[i], nv[i])
        )
    }
    ncube++
}


let resize = function() {
    // ---- screen resize ----
    canvasW = scr.offsetWidth
    canvasH = scr.offsetHeight
    let o = scr
    for (nx = 0, ny = 0; o != null; o = o.offsetParent) {
        nx += o.offsetLeft
        ny += o.offsetTop
    }
    canvas.resize(canvasW, canvasH)
}

let reset = function() {
    // ---- create first cube ----
    cubes = []
    faces = []
    ncube = 0
    npoly = 0

    let size = params.firstCubeSize
    for (let i = 0; i < params.cubesCount; i++) {
        cubes.push(new Cube(0, 0, 0, 0, 0, 0, size))
        size *= 1.618
    }
}

let init = function() {
    scr = document.getElementById('screen')
    canvas = new Canvas('canvas')

    // ======== unified touch/mouse events handler ========
    scr.ontouchstart = scr.onmousedown = function(e) {
        if (!running) return true
        // ---- touchstart ----
        if (e.target !== canvas.container) return
        e.preventDefault() // prevents scrolling
        if (scr.setCapture) scr.setCapture()
        moved = false
        drag = true
        startX = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx
        startY = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny
    }

    scr.ontouchmove = scr.onmousemove = function(e) {
        if (!running) return true
        // ---- touchmove ----
        e.preventDefault()
        xm = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - nx
        ym = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY) - ny
        // detectFaceOver()
        if (drag) {
            cx = cxb + (xm - startX)
            cy = cyb - (ym - startY)
        }
        if (Math.abs(xm - startX) > 10 || Math.abs(ym - startY) > 10) {
            // ---- if pointer moves then cancel the tap/click ----
            moved = true
        }
    }


    // ---- Z axis rotation (mouse wheel) ----
    // scr.addEventListener('DOMMouseScroll', function(e) {
    //     if (!running) return true
    //     cz += e.detail * 12
    //     return false
    // }, false)

    scr.onmousewheel = function(e) {
        if (!running) return true
        cz += e.wheelDelta / 5
        return false
    }

    resize()
    window.addEventListener('resize', resize, false)

    // ---- fps count ----
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

    document.getElementById('destroy').onchange = function() {
        destroy = this.checked
    }

    document.getElementById('stopgo').onclick = function() {
        running = !running
        document.getElementById('stopgo').value = running ? 'STOP' : 'GO!'
        if (running) run()
    }

    document.getElementById('reset').onclick = function() {
        reset()
    }
    // ---- engine start ----
    reset()
    run()
}

////////////////////////////////////////////////////////////////////////////
// ======== main loop ========
let run = function() {
    // ---- screen background ----
    canvas.ctx.fillStyle = bkgColor1
    canvas.ctx.fillRect(0, 0, canvasW, canvasH)

    // ---- easing rotations ----
    angleX += ((cy - angleX) * 0.05)
    angleY += ((cx - angleY) * 0.05)
    angleZ += ((cz - angleZ) * 0.05)
    if (autorotate) cz += 1
    // ---- pre-calculating trigo ----
    cosY = Math.cos(angleY * 0.01)
    sinY = Math.sin(angleY * 0.01)
    cosX = Math.cos(angleX * 0.01)
    sinX = Math.sin(angleX * 0.01)
    cosZ = Math.cos(angleZ * 0.01)
    sinZ = Math.sin(angleZ * 0.01)
    // ---- points projection ----
    minZ = 0
    let i = 0, c
    while (c = cubes[i++]) {
        let j = 0, p
        while (p = c.points[j++]) {
            p.projection()
        }
    }
    // ---- adapt zoom ----
    let d = -minZ + 100 - zoom
    zoom += (d * ((d > 0) ? 0.05 : 0.01))
    // ---- faces light ----
    let j = 0, f
    while (f = faces[j++]) {
        if (f.faceVisible()) {
            f.distanceToCamera()
        }
    }
    // ---- faces depth sorting ----
    faces.sort(function(p0, p1) {
        return p1.distance - p0.distance
    })
    // ---- painting faces ----
    j = 0
    while (f = faces[j++]) {
        if (f.visible) {
            f.draw()
        } else break
    }

    fps++
    if (running) requestAnimationFrame(run)
}

init()