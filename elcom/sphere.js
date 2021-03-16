let canvas,
    ctx,
    sphere = new Sphere3D(40),
    distance = 400,
    mouse = {
        down: false,
        button: 1,
        x: 0,
        y: 0,
        px: 0,
        py: 0
    },
    modify = 1

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max)
}

function Point3D() {
    this.x = 0
    this.y = 0
    this.z = 0
}

function Sphere3D(radius) {
    this.point = new Array()
    this.color = "rgb(100,255,0)"
    this.radius = (typeof (radius) == "undefined") ? 20.0 : radius
    this.radius = (typeof (radius) != "number") ? 20.0 : radius

    this.numberOfVertexes = 0

    for (alpha = 0; alpha <= 6.28; alpha += 0.17) {
        p = this.point[this.numberOfVertexes] = new Point3D()

        p.x = Math.cos(alpha) * this.radius
        p.y = 0
        p.z = Math.sin(alpha) * this.radius
        this.numberOfVertexes++
    }

    for (let direction = 1; direction >= -1; direction -= 2) {
        for (let beta = 0.19; beta < 1.445; beta += 0.17) {
            let radius = Math.cos(beta) * this.radius
            let fixedY = Math.sin(beta) * this.radius * direction

            for (let alpha = 0; alpha < 6.28; alpha += 0.17) {
                p = this.point[this.numberOfVertexes] = new Point3D()

                p.x = Math.cos(alpha) * radius
                p.y = fixedY
                p.z = Math.sin(alpha) * radius

                this.numberOfVertexes++
            }
        }
    }
}

function rotateX(point, radians) {
    let y = point.y
    point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0)
    point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians))
}

function rotateY(point, radians) {
    let x = point.x
    point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0)
    point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians))
}

function rotateZ(point, radians) {
    let x = point.x
    point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0)
    point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians))
}

function drawPoint(ctx, x, y, size, color) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, size, 0, 2 * Math.PI, true)
    ctx.fill()
    ctx.restore()
}

function drawPointWithGradient(ctx, x, y, size, gradient) {
    let reflection

    reflection = size / 4
    // 0 - 5
    let middle = canvas.width / 2
    let a = mouse.y - middle

    ctx.save()
    ctx.translate(x, y)
    /*let reflectionX = Math.max(Math.min((mouse.px - (canvas.width / 2)) / (canvas.width / 2) * 5, 4), -4);
    let reflectionY = Math.max(Math.min((mouse.py - (canvas.height / 2)) / (canvas.height / 2) * 5, 4), -4);
    let radgrad = ctx.createRadialGradient(reflectionX, reflectionY, 0.5, 0, 0, size);*/
    let radgrad = ctx.createRadialGradient(-reflection, -reflection, reflection, 0, 0, size)

    let r = 1,
        g = 1,
        b = 200

    let color = "rgb(" + r + "," + g + "," + b + ")"
    radgrad.addColorStop(0, '#FFFFFF')
    radgrad.addColorStop(gradient, color)
    radgrad.addColorStop(1, 'rgba(1,159,98,0)')

    ctx.fillStyle = radgrad
    ctx.fillRect(-size, -size, size * 2, size * 2)
    ctx.restore()
}

function projection(xy, z, xyOffset, zOffset, distance) {
    return ((distance * xy) / (z - zOffset)) + xyOffset
}

function update() {
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (i = 0; i < sphere.numberOfVertexes; i++) {

        p.x = sphere.point[i].x
        p.y = sphere.point[i].y
        p.z = sphere.point[i].z

        rotateX(p, Math.sin(new Date / 3600))
        rotateY(p, Math.cos(new Date / 3600))

        //if (mouse.down) {
        modify = Math.min(Math.abs(mouse.px - (canvas.width / 2)) / (canvas.width / 2) * 1.25, 1.25)
        //}
        //else if(modify > 1) {
        //  modify -= .0001;
        //}

        x = projection(p.x, p.z * modify, canvas.width / 2.0, 100.0, distance)
        y = projection(p.y, p.z * modify, canvas.height / 2.0, 100.0, distance)

        if ((x >= 0) && (x < canvas.width)) {
            if ((y >= 0) && (y < canvas.height)) {

                ctx.lineTo(x, y)
                ctx.stroke()
                if (p.z < 0) {
                    drawPoint(ctx, x, y, 1, "rgba(200,200,200,0.6)")
                } else {
                    drawPointWithGradient(ctx, x, y, 1, 0.8)
                }
                ctx.moveTo(x,y)
            }
        }
    }
    ctx.restore()

    requestAnimationFrame(update)
}

function start() {
    canvas.onmousemove = function(e) {
        mouse.px = mouse.x
        mouse.py = mouse.y
        let rect = canvas.getBoundingClientRect()

        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top

        e.preventDefault()
    }

    canvas.onmouseup = function(e) {
        mouse.down = false
        e.preventDefault()
    }

    canvas.onmousedown = function(e) {
        mouse.down = true
        e.preventDefault()
    }

    update()
}

window.onload = function() {
    canvas = document.querySelector('[data-canvas]')
    ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    start()
}