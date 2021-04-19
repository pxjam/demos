let ww = window.innerWidth
let wh = window.innerHeight
let clientX = ww / 2
let clientY = wh / 2

window.addEventListener('resize', () => {
    ww = window.innerWidth
    wh = window.innerHeight
})

let mouse = {
    x: clientX,
    y: clientY,
    inertia: 0.05
}

let mousemoveTimer
let lastClientX
let lastClientY

let shouldStop = false

let update = (targetX, targetY) => {
    clientX = inertiaTo(clientX, targetX)
    clientY = inertiaTo(clientY, targetY)

    mouse.x = clientX
    mouse.y = clientY


    /*
    mouse.cx = clientX - ww / 2
    mouse.cy = clientY - wh / 2
    */
    /*
    mouse.progressX = (mouse.x - ww / 2) / ww
    mouse.progressY = (mouse.y - wh / 2) / wh
    */

    // window.dispatchEvent(
    //     new CustomEvent('MouseMove', {
    //         detail: mouse
    //     })
    // )

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

function mouseMoveHandler(e) {
    e.preventDefault()

    cancelAnimationFrame(mousemoveTimer)
    shouldStop = false

    lastClientX = e.clientX !== undefined
        ? e.clientX
        : e.touches[0].clientX

    lastClientY = e.clientY !== undefined
        ? e.clientY
        : e.touches[0].clientY

    update(lastClientX, lastClientY)
}

window.addEventListener('mousemove', mouseMoveHandler)
window.addEventListener('touchmove', mouseMoveHandler)

export default mouse