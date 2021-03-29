let ww = window.innerWidth
let wh = window.innerHeight

let mouse = {
    /*
    x: ww / 2,
    y: wh / 2,
    */
    cx: 0,
    cy: 0,
    /*
    progressX: 0,
    progressY: 0,
    */
    inertia: 0.05
}

window.addEventListener('resize', () => {
    ww = window.innerWidth
    wh = window.innerHeight
})

let clientX = ww / 2
let clientY = wh / 2

let mousemoveTimer
let lastClientX
let lastClientY

let shouldStop = false

let update = (targetX, targetY) => {
    clientX = inertiaTo(clientX, targetX)
    clientY = inertiaTo(clientY, targetY)

    /*
    mouse.x = clientX
    mouse.y = clientY
    */
    mouse.cx = clientX - ww / 2
    mouse.cy = clientY - wh / 2
    /*
    mouse.progressX = (mouse.x - ww / 2) / ww
    mouse.progressY = (mouse.y - wh / 2) / wh
    */

    if (!shouldStop) {
        mousemoveTimer = requestAnimationFrame(() => update(lastClientX, lastClientY))
    }
}

let inertiaTo = (current, target) => {
    let distToGo = target - current
    let newPos = current + (distToGo * mouse.inertia)

    if (Math.abs(distToGo) < 5) {
        cancelAnimationFrame(mousemoveTimer)
        shouldStop = true
        newPos = target
    }

    return newPos
}

window.addEventListener('mousemove', e => {
    cancelAnimationFrame(mousemoveTimer)
    shouldStop = false

    lastClientX = e.clientX
    lastClientY = e.clientY

    update(e.clientX, e.clientY)
})

export default mouse