export let gradParams = {
    gradCenter: {x: 0.37, y: 0.37},
    gradRadius: 0.8,
    gradMiddlePoint: 0.5,
    gradColor1: {r: 186, g: 0, b: 250},
    gradColor2: {r: 20, g: 110, b: 250},
    gradColor3: {r: 0, g: 251, b: 235},
    gradPreview: false,
}

export function createGradControls(paneFolder, params) {
    paneFolder.addInput(params, 'gradCenter', {
        x: {min: -1, max: 1, step: 0.01},
        y: {min: -1, max: 1, step: 0.01}
    })
    paneFolder.addInput(params, 'gradRadius', {min: 0, max: 2, step: 0.01})
    paneFolder.addInput(params, 'gradMiddlePoint', {min: 0, max: 1, step: 0.01})
    paneFolder.addInput(params, 'gradColor1')
    paneFolder.addInput(params, 'gradColor2')
    paneFolder.addInput(params, 'gradColor3')
    paneFolder.addInput(params, 'gradPreview')
}

let rgbFromObject = (obj) => `rgb(${obj.r}, ${obj.g}, ${obj.b})`

export function getActualGradient(canvas, params) {
    let cw =  canvas.width
    let ch =  canvas.height
    let gradCX = (0.5 + params.gradCenter.x) * cw
    let gradCY = (0.5 + params.gradCenter.y) * ch

    let gradient = canvas.getContext('2d').createRadialGradient(gradCX, gradCY, 0, gradCX, gradCY, params.gradRadius * Math.max(cw, ch))

    let color1 = rgbFromObject(params.gradColor1)
    let color2 = rgbFromObject(params.gradColor2)
    let color3 = rgbFromObject(params.gradColor3)

    gradient.addColorStop(0, color1)
    gradient.addColorStop(params.gradMiddlePoint, color2)
    gradient.addColorStop(1, color3)

    return gradient
}
