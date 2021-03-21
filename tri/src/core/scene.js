export let canvas = document.querySelector('[data-canvas]')

let width = canvas.offsetWidth
let height = canvas.offsetHeight

export let ctx = canvas.getContext('2d')

let resize = () => {
    width = canvas.offsetWidth
    height = canvas.offsetHeight

    if (window.devicePixelRatio > 1) {
        canvas.width = canvas.clientWidth * 2
        canvas.height = canvas.clientHeight * 2
        ctx.scale(2, 2)
    } else {
        canvas.width = width
        canvas.height = height
    }
}

window.addEventListener('resize', resize)
resize()