import * as dat from 'dat.gui'

let gui = new dat.gui.GUI()
let canvas = document.querySelector('[data-canvas]')

canvas.width = 400
canvas.height = 240

let ctx = canvas.getContext('2d')

let params = {
    message: 'Hello World',
    displayOutline: false,

    maxSize: 6.0,
    speed: 5,

    height: 10,
    noiseStrength: 10.2,
    growthSpeed: 0.2,

    type: 'three',

    explode: function() {
        alert('Bang!')
    },

    color0: "#ffae23", // CSS string
    color1: [0, 128, 255], // RGB array
    color2: [0, 128, 255, 0.3], // RGB with alpha
    color3: {h: 350, s: 0.9, v: 0.3} // Hue, saturation, value
}

gui.remember(params)

gui.add(params, 'message')
gui.add(params, 'displayOutline')
gui.add(params, 'explode')

gui.add(params, 'maxSize').min(-10).max(10).step(0.25)
gui.add(params, 'height').step(5) // Increment amount

// Choose from accepted values
gui.add(params, 'type', ['one', 'two', 'three'])

// Choose from named values
gui.add(params, 'speed', {Stopped: 0, Slow: 0.1, Fast: 5})

var f1 = gui.addFolder('Colors')
f1.addColor(params, 'color0')
f1.addColor(params, 'color1')
f1.addColor(params, 'color2')
f1.addColor(params, 'color3')

var f2 = gui.addFolder('Another Folder')
f2.add(params, 'noiseStrength')

var f3 = f2.addFolder('Nested Folder')
f3.add(params, 'growthSpeed')


// let mouseX = 0
// let mouseY = 0
let step = 3
let x0 = step
let y0 = step
let x = x0
let y = y0
let r = step / 5
let w = canvas.width
let h = canvas.height

let colorR = 200
let colorG = 50
let colorB = 180

let draw = () => {
    ctx.rect(0, 0, w, h)
    ctx.fill()

    ctx.lineWidth = 1
//ctx.strokeStyle = '#CC88FF'
    ctx.strokeStyle = `rgb(${colorR}, ${colorG}, ${colorB})`

    let cols = 1 * w / step - 1
    let rows = 1 * h / step - 1

    for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
            // ctx.strokeStyle = `rgb(${colorR + (i + j) * 3}, ${colorG}, ${colorB})`

            ctx.moveTo(x, y)
            ctx.beginPath()

            ctx.arc(x, y, r, 0, 2 * Math.PI, false)

            console.log(x, y)

            ctx.closePath()
            ctx.stroke()
            y += step
            r += 0.6
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
