import * as dat from 'dat.gui'
import * as presets from './presets.json'

window.gui = new dat.gui.GUI()

function init() {
    let canvas = document.querySelector('[data-canvas]')

    canvas.width = 600
    canvas.height = 400

    let params = {
        text: 'A',
        stroke: false,
        strokeBgColor: true,
        strokeWidth: 15,
        fill: true,
        type: 'circle',
        x: true,
        y: true,
        size: 1,
        sizeStep: 0.01,

        fontSize: 193,
        step: 28,

        //opacity:

        height: 10,
        noiseStrength: 10.2,
        growthSpeed: 0.2,

        randomize: function() {
            alert('Рандом!')
        },

        bgColor: [0, 0, 0],
        color1: [0, 221, 235],
        color2: [250, 56, 250],
        gradDirX: 'right',
        gradDirY: 'top'
    }

    gui.remember(params)

    gui.add(params, 'type', ['circle', 'square', 'text']).onChange(update)
    gui.add(params, 'x').onChange(update)
    gui.add(params, 'y').onChange(update)
    gui.add(params, 'step').min(5).max(200).step(1).onChange(update)
    gui.add(params, 'size').min(1).max(50).step(1).onChange(update)
    gui.add(params, 'sizeStep').min(0.01).max(1).step(0.01).onChange(update)

    gui.add(params, 'strokeWidth').min(0.1).max(20).step(0.2).onChange(update)

    gui.add(params, 'fill').onChange(update)
    gui.add(params, 'stroke').onChange(update)
    gui.add(params, 'strokeBgColor').onChange(update)

    gui.add(params, 'text').onChange(update)
    gui.add(params, 'randomize').onChange(update)

    gui.add(params, 'fontSize').min(10).max(200).step(1).onChange(update)
// gui.add(params, 'height').step(5) // Increment amount
//
    gui.addColor(params, 'bgColor').onChange(update)
    gui.addColor(params, 'color1').onChange(update)
    gui.addColor(params, 'color2').onChange(update)
    gui.add(params, 'gradDirX', ['left', 'center', 'right']).onChange(update)
    gui.add(params, 'gradDirY', ['top', 'center', 'bottom']).onChange(update)

// gui.addColor(params, 'color3')

// let mouseX = 0
// let mouseY = 0

    function getGradCoords(xDir, yDir) {
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

    function draw(cnv, options) {
        if (!cnv) {
            cnv = canvas
        }

        if (!options) {
            options = Object.assign({}, params)
        } else {
            options = Object.assign({}, params, options)
        }

        // console.log('strokeBgColor', options)

        let ctx = cnv.getContext('2d')

        let w = cnv.width
        let h = cnv.height
        let step = options.step
        let x0 = (options.x) ? step / 2 : w / 2
        let y0 = (options.y) ? step : h / 2
        let x = x0
        let y = y0
        let size = options.size

        let colorR = options.color1[0]
        let colorG = options.color1[1]
        let colorB = options.color1[2]
        let colorA = options.color1[3]
        //ctx.clearRect(0, 0, w, h)

        let bgColor = options.bgColor
        bgColor = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`
        ctx.fillStyle = bgColor
        ctx.rect(0, 0, w, h)
        ctx.fill()

        ctx.strokeWidth = options.strokeWidth
        ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`

        let cols = 1 * w / step - 1
        let rows = 1 * h / step - 1

        let gradientCoords = getGradCoords(options.gradDirX, options.gradDirY)
        let grd = ctx.createLinearGradient(...gradientCoords)
        let color1 = `rgba(${options.color1.join(',')})`
        let color2 = `rgba(${options.color2.join(',')})`
        grd.addColorStop(0, color1)
        grd.addColorStop(1, color2)

        ctx.fillStyle = grd

        if (options.strokeBgColor) {
            ctx.strokeStyle = bgColor
        } else {
            ctx.strokeStyle = grd
        }

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (!options.x && i > 0) return
                if (!options.y && j > 0) continue

                // ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB})`
                // ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB})`

                ctx.moveTo(x, y)
                ctx.beginPath()

                if (options.type === 'circle') {
                    ctx.arc(x, y, size, 0, 2 * Math.PI, false)
                }
                if (options.type === 'square') {
                    ctx.rect(x - size / 2, y - size / 2, size, size)
                }
                if (options.type === 'text') {
                    ctx.font = `${options.fontSize}px Rajdhani`
                    options.fill && ctx.fillText(options.text, x, y)
                    options.stroke && ctx.strokeText(options.text, x, y)
                }

                ctx.closePath()

                options.fill && ctx.fill()
                options.stroke && ctx.stroke()

                y += step
                size += options.sizeStep
                // colorA -= 0.004
                //ctx.lineWidth += 0.05
                colorB += 1
            }
            y = y0
            x += step
        }
    }

    function update() {
        draw()
    }

    let presetsBox = document.querySelector('[data-presets]')

    presets.default.forEach(presetParams => {
        let preset = document.createElement('div')
        let presetCanvas = document.createElement('canvas')

        preset.classList.add('preset')
        preset.appendChild(presetCanvas)

        presetCanvas.width = 600
        presetCanvas.height = 400
        presetCanvas.classList.add('preset__img')

        let comboParams = Object.assign({}, params, presetParams)
        draw(presetCanvas, comboParams)

        presetsBox.appendChild(preset)
        presetCanvas.addEventListener('click', () => {
            params = Object.assign(params, presetParams)
            draw(canvas, comboParams)
            gui.updateDisplay()
        })
    })

    draw(canvas)
}


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

window.addEventListener('load', init)
