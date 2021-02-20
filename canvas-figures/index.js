import * as dat from 'dat.gui'

let gui = new dat.gui.GUI()
let canvas = document.querySelector('[data-canvas]')

canvas.width = 400
canvas.height = 240

let ctx = canvas.getContext('2d')

ctx.lineWidth = 5

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

    color0: "#ffae23", // CSS string
    color1: [0, 128, 255], // RGB array
    color2: [0, 128, 255, 0.3], // RGB with alpha
    color3: {h: 350, s: 0.9, v: 0.3} // Hue, saturation, value
}

gui.remember(params)

gui.add(params, 'type', ['circle', 'text']).onChange(() => draw())
gui.add(params, 'x').onChange(() => draw())
gui.add(params, 'y').onChange(() => draw())
gui.add(params, 'step').min(5).max(200).step(1).onChange(() => draw())

gui.add(ctx, 'lineWidth').min(0.1).max(20).step(0.2).onChange(() => draw())

gui.add(params, 'fill').onChange(() => draw())
gui.add(params, 'stroke').onChange(() => draw())

gui.add(params, 'text').onChange(() => draw())
gui.add(params, 'randomize')

gui.add(params, 'fontSize').min(10).max(200).step(1).onChange(() => draw())
gui.add(params, 'height').step(5) // Increment amount

gui.addColor(params, 'color0')
gui.addColor(params, 'color1')
gui.addColor(params, 'color2')
gui.addColor(params, 'color3')

// let mouseX = 0
// let mouseY = 0

function draw() {
    let w = canvas.width
    let h = canvas.height
    let step = params.step
    let x0 = (params.x) ? step : w / 2
    let y0 = (params.y) ? step : h / 2
    let x = x0
    let y = y0
    let r = 1

    let colorR = 80
    let colorG = 200
    let colorB = 100
    let colorA = 1

    console.log('draw', ctx.lineWidth)
    //ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#000'
    ctx.rect(0, 0, w, h)
    ctx.fill()

//ctx.strokeStyle = '#CC88FF'
    ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`
    ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`

    let cols = 1 * w / step - 1
    let rows = 1 * h / step - 1

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (!params.x && i > 0) return
            if (!params.y && j > 0) continue

            ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`
            ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`

            ctx.moveTo(x, y)
            ctx.beginPath()

            console.log(params.type)
            if (params.type === 'circle') {
                console.log('gay')
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
