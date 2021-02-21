import * as dat from 'dat.gui'

let gui = new dat.gui.GUI()
let canvas = document.querySelector('[data-canvas]')

canvas.width = 400
canvas.height = 240

let ctx = canvas.getContext('2d')

ctx.lineWidth = 5

let gradDirs = {
    'top right': [0, 0, 'h', 'w'],
    'right': [0, 0, 'h', 'w'],
    'bottom right': [0, 0, 'h', 'w'],
    'bottom': [0, 0, 'h', 'w'],
    'bottom left': [0, 0, 'h', 'w'],
    'left': [0, 0, 'h', 'w'],
    'top left': [0, 0, 'h', 'w'],
    'top': [0, 0, 'h', 'w']
}

let params = {
    text: 'A',
    stroke: false,
    fill: true,
    type: 'circle',
    x: true,
    y: true,

    fontSize: 193,
    step: 28,

    //opacity:

    height: 10,
    noiseStrength: 10.2,
    growthSpeed: 0.2,

    randomize: function() {
        alert('Рандом!')
    },

    color1: [0, 128, 255],
    color2: [255, 128, 0],
    gradDirX: 'right',
    gradDirY: 'top'
}

gui.remember(params)

gui.add(params, 'type', ['circle', 'text']).onChange(draw)
gui.add(params, 'x').onChange(draw)
gui.add(params, 'y').onChange(draw)
gui.add(params, 'step').min(5).max(200).step(1).onChange(draw)

gui.add(ctx, 'lineWidth').min(0.1).max(20).step(0.2).onChange(draw)

gui.add(params, 'fill').onChange(draw)
gui.add(params, 'stroke').onChange(draw)

gui.add(params, 'text').onChange(draw)
gui.add(params, 'randomize').onChange(draw)

gui.add(params, 'fontSize').min(10).max(200).step(1).onChange(draw)
// gui.add(params, 'height').step(5) // Increment amount
//
gui.addColor(params, 'color1').onChange(draw)
gui.addColor(params, 'color2').onChange(draw)
gui.add(params, 'gradDirX', ['left', 'center', 'right']).onChange(draw)
gui.add(params, 'gradDirY', ['top', 'center', 'bottom']).onChange(draw)

// gui.addColor(params, 'color3')

// let mouseX = 0
// let mouseY = 0

function getGradCoords(xDir, yDir) {
    console.log(xDir, yDir)
    let x0, x1, y0, y1

    switch (xDir) {
        case 'left':
            x0 = canvas.width
            x1 = 0
            break
        case 'center':
            x0 = 0
            x1 = 0
            break
        case 'right':
            x0 = 0
            x1 = canvas.width
    }
    switch (yDir) {
        case 'top':
            y0 = 0
            y1 = canvas.height
            break
        case 'center':
            y0 = 0
            y1 = 0
            break
        case 'bottom':
            y0 = canvas.height
            y1 = 0
    }

    return [x0, y0, x1, y1]
}

function draw() {
    let w = canvas.width
    let h = canvas.height
    let step = params.step
    let x0 = (params.x) ? step : w / 2
    let y0 = (params.y) ? step : h / 2
    let x = x0
    let y = y0
    let r = 1

    let colorR = params.color1[0]
    let colorG = params.color1[1]
    let colorB = params.color1[2]
    let colorA = params.color1[3]

    //ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#000'
    ctx.rect(0, 0, w, h)
    ctx.fill()

//ctx.strokeStyle = '#CC88FF'
    ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`
    ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`

    let cols = 1 * w / step - 1
    let rows = 1 * h / step - 1
    
    let gradientCoords = getGradCoords(params.gradDirX, params.gradDirY)
    console.log('gradientCoords', gradientCoords)

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (!params.x && i > 0) return
            if (!params.y && j > 0) continue

            ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`
            ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`

            let grd = ctx.createLinearGradient(...gradientCoords)

            let color1 = `rgba(${params.color1.join(',')})`
            let color2 = `rgba(${params.color2.join(',')})`
            grd.addColorStop(0, color1)
            grd.addColorStop(1, color2)
            ctx.fillStyle = grd

            ctx.moveTo(x, y)
            ctx.beginPath()

            if (params.type === 'circle') {
                ctx.arc(x, y, r, 0, 2 * Math.PI, false)
            }
            if (params.type === 'text') {
                ctx.font = `${params.fontSize}px Rajdhani`
                params.fill && ctx.fillText(params.text, x, y)
                params.stroke && ctx.strokeText(params.text, x, y)
            }

            ctx.closePath()

            params.stroke && ctx.stroke()
            params.fill && ctx.fill()

            y += step
            r += 0.08
            // colorA -= 0.004
            //ctx.lineWidth += 0.05
            colorB += 1
        }
        y = y0
        x += step
    }
}

draw()

// window.addEventListener('mousemove', e => {
//     mouseX = e.clientX - canvas.offsetLeft
//     mouseY = e.clientY - canvas.offsetTop
//
//     console.log('mouseX', mouseX)
//     console.log('mouseY', mouseY)
// })
//
// window.addEventListener('mousedown', () => {
//     isDrawing = true
//     ctx.beginPath()
// })
//
// window.addEventListener('mouseup', () => {
//     isDrawing = false
//     ctx.closePath()
// })
