let ww = window.innerWidth
let wh = window.innerHeight

let mouse = {
    absX: ww / 2,
    absY: wh / 2,
    x: 0,
    y: 0,
}

window.addEventListener('resize', () => {
    ww = window.innerWidth
    wh = window.innerHeight
})

window.addEventListener('mousemove', e => {
    mouse.absX = e.clientX
    mouse.absY = e.clientY
    mouse.x = (mouse.absX - ww / 2) / ww
    mouse.y = (mouse.absY - wh / 2) / wh
})

export default mouse