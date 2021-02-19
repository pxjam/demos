let canvas = document.querySelector('[data-canvas]')
let ctx = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0
// let getColor = () => {}

let i = 0

//ctx.strokeColor = 'rgba(100, 200, 0, 1)';

let drawTri = () => {
    let x0 = 300 + 100 * Math.sin(i / 10)
    let y0 = 300 + 100 * Math.cos(i / 10)

    // let colorR = Math.floor(40 - 40 * Math.sin(i / Math.PI / 5))
    // let colorG = Math.floor(40 - 40 * Math.cos(i / Math.E / 5))
    // let colorB = Math.floor(40 - 40 * Math.sin(i / Math.sqrt(5)))
    // ctx.strokeStyle = `rgb(${colorR}, ${colorG}, ${colorB})`

    ctx.beginPath()
    ctx.moveTo(x0 + 125, y0 + 125)
    ctx.lineTo(x0 + 125, y0 + 45)
    ctx.lineTo(x0 + 45, y0 + 125)
    ctx.closePath()
    ctx.stroke()
    i++

    if (i < 1000) {
        requestAnimationFrame(drawTri)
    }
}

//drawTri()

function drawRotatedRect(x, y, width, height, degrees) {
    // first save the untranslated/unrotated context
    ctx.save()

    ctx.beginPath()
    // move the rotation point to the center of the rect
    ctx.translate(x + width / 2, y + height / 2)
    // rotate the rect
    ctx.rotate(degrees * Math.PI / 180)

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    //       so the rect needs to be offset accordingly when drawn
    // ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.rect(-width / 2, -height / 2, width, height)
    // ctx.fillStyle = 'rgb(255,255,255)'
    // ctx.fill();
    // ctx.fillStyle = 'rgb(0,0,0)'
    ctx.stroke()

    // restore the context to its untranslated/unrotated state
    ctx.restore()
}

let drawRect = () => {
    let size = 50
    let step = 65
    let time = performance.now() / 100

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 30; i++) {
        let x0 = 300 + 100 * Math.sin((time + i) / 12)
        let y0 = 300 + 100 * Math.cos((time + i) / 12)

        // let opacity = (15 - Math.abs(15 - i)) / 15
        let opacity = i / 30
        ctx.strokeStyle = `rgba(0,0,0, ${opacity})`
        // console.log(opacity)

        // ctx.strokeRect(x0 + i, y0 + i, i + size, i + size)
        drawRotatedRect(x0 + i, y0 + i, i + size, i + size, time + i)
        // ctx.stroke()
    }

    requestAnimationFrame(drawRect)
}

drawRect()

// let isDrawing = false
//
// ctx.strokeStyle = "black"
// ctx.lineWidth = 1

window.addEventListener('mousemove', e => {
    mouseX = e.clientX - canvas.offsetLeft
    mouseY = e.clientY - canvas.offsetTop

    console.log('mouseX', mouseX)
    console.log('mouseY', mouseY)
})
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
