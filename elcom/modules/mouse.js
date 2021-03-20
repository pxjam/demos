let ww = window.innerWidth
let wh = window.innerHeight

let mouse = {
    absX: ww / 2,
    absY: wh / 2,
    absCX: ww / 2,
    absCY: wh / 2,
    x: 0,
    y: 0,
    inertia: 0.035
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

    mouse.absX = clientX
    mouse.absY = clientY
    mouse.absCX = clientX - ww / 2
    mouse.absCY = clientY - wh / 2
    mouse.x = (mouse.absX - ww / 2) / ww
    mouse.y = (mouse.absY - wh / 2) / wh

    if (!shouldStop) {
        mousemoveTimer = requestAnimationFrame(() => update(lastClientX, lastClientY))
    }
}

let inertiaTo = (current, target) => {
    let distToGo = target - current
    let newCoord = current + (distToGo * mouse.inertia)

    if (Math.abs(distToGo) < 5) {
        cancelAnimationFrame(mousemoveTimer)
        shouldStop = true
        newCoord = target
    }

    return newCoord
}

window.addEventListener('mousemove', e => {
    cancelAnimationFrame(mousemoveTimer)
    shouldStop = false

    lastClientX = e.clientX
    lastClientY = e.clientY

    update(e.clientX, e.clientY)
})

export default mouse