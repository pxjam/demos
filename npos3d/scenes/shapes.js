import Tweakpane from 'tweakpane'
import NPos3d from '../modules/npos3d'
import {paneOptions} from '../modules/paneOptions'
import presets from '../presets/shapes'
import mouse from '../modules/mouse'

// init tweakpane

let paramsDefault = {
    // fade: true,
    shape: 'Sphere',
    // text: 'en',
    // fontSize: 10,
    scaleX: 30,
    scaleY: 30,
    scaleZ: 30,
    segments: 24,
    rings: 16,
    twist: false,
    twistFactor: Math.round(Math.PI * 200) / 100,
    twistAxis: 0,
    lathe: false,
    latheFrac: Math.round(Math.PI * 200) / 100,
    latheSegments: 12,
    latheAxis: 0,
    rotateStrength: 20,
    moveStrength: 20,
    inertia: .05,

    color1: {r: 186, g: 0, b: 250},
    color2: {r: 0, g: 126, b: 255},
    color3: {r: 0, g: 251, b: 235},
    gradCenter: {x: 0.37, y: 0.37},
    gradRadius: 0.8,
    gradMiddlePoint: 0.5,
}
let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

// f1.addInput(params, 'fade')
f1.addInput(params, 'shape', {
    options: paneOptions('sphere', 'cube', 'circle')
})
// f1.addInput(params, 'text')
// f1.addInput(params, 'fontSize', {min: 10, max: 100, step: 1})
f1.addInput(params, 'scaleX', {min: 1, max: 100, step: 1})
f1.addInput(params, 'scaleY', {min: 1, max: 100, step: 1})
f1.addInput(params, 'scaleZ', {min: 1, max: 100, step: 1})
f1.addInput(params, 'segments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'rings', {min: 1, max: 100, step: 1})
f1.addInput(params, 'twist')
f1.addInput(params, 'twistAxis', {min: 0, max: 2, step: 1})
f1.addInput(params, 'twistFactor', {min: 0, max: Math.round(Math.PI * 400) / 100, step: .01})
f1.addInput(params, 'lathe')
f1.addInput(params, 'latheFrac', {min: 0, max: Math.round(Math.PI * 400) / 100, step: .01})
f1.addInput(params, 'latheSegments', {min: 1, max: 100, step: 1})
f1.addInput(params, 'latheAxis', {min: 0, max: 2, step: 1})
f1.addInput(params, 'rotateStrength', {min: 0, max: 100, step: 1})
f1.addInput(params, 'moveStrength', {min: 0, max: 100, step: 1})
f1.addInput(params, 'inertia', {min: 0, max: 1, step: .01})
f1.addInput(params, 'color1')
f1.addInput(params, 'color2')
f1.addInput(params, 'color3')
f1.addInput(params, 'gradCenter', {
    x: {min: -1, max: 1, step: 0.01},
    y: {min: -1, max: 1, step: 0.01}
})
f1.addInput(params, 'gradRadius', {min: 0, max: 2, step: 0.01})
f1.addInput(params, 'gradMiddlePoint', {min: 0, max: 1, step: 0.01})
f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset ' + (i + 1)] = i
        return acc
    }, {})
})

// close pane with escape
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" || e.key === "Esc") f1.expanded = false
})

if (presets.length) {
    Object.assign(params, paramsDefault, presets[0])
    pane.refresh()
}

let saveBtn = f1.addButton({title: 'Copy preset'})
saveBtn.on('click', () => navigator.clipboard.writeText(JSON.stringify(pane.exportPreset())))

let presetTimer

pane.on('change', (e) => {
    if (e.presetKey === 'preset') {
        Object.assign(params, paramsDefault, presets[e.value])
        pane.refresh()
    } else {
        clearTimeout(presetTimer)
        presetTimer = setTimeout(() => {
            setup()
        }, 50)
    }
})

// init scene

let lib = NPos3d
window.scene = new lib.Scene({
    canvas: document.querySelector('[data-canvas]'),
    backgroundColor: '#fff'
})

let gradient = 'purple'
setup()

// function declarations

function setup() {
    console.log('setup')
    mouse.inertia = params.inertia
    scene.children.forEach(child => {
        if (child.type !== 'Camera') scene.remove(child)
    })

    let mesh = createMesh()
    mesh.update = function () {
        let t = this
        t.rot[0] = -mouse.cy * params.rotateStrength / 100000
        t.rot[1] = mouse.cx * params.rotateStrength / 100000
        t.pos[0] = mouse.cx * params.moveStrength / 100
        t.pos[1] = mouse.cy * params.moveStrength / 100
    }

    scene.add(mesh)
}

function createMesh() {
    let shape
    switch (params.shape) {
        case 'sphere':
            shape = new lib.Geom.Sphere({radius: 10, segments: params.segments, rings: params.rings})
            break
        case 'circle':
            shape = new lib.Geom.Circle({radius: 10, segments: params.segments})
            break
        // case 'axies':
        //     shape = lib.Geom.axies
        //     break
        // case 'font':
        //     shape = new lib.VText({
        //         string: params.text,
        //         fontSize: params.fontSize,
        //     }).shape
        //     break
        default:
            shape = lib.Geom.cube
    }

    if (params.twist) shape = new lib.Geom.Twist({shape, axis: params.twistAxis, factor: params.twistFactor})
    if (params.lathe) shape = new lib.Geom.Lathe({
        shape,
        axis: params.latheAxis,
        frac: params.latheFrac,
        segments: params.latheSegments
    })

    return new lib.Ob3D({
        shape,
        pos: [0, 0, 0],
        rot: [0, 0, 0],
        scale: [params.scaleX, params.scaleY, params.scaleZ],
        color: createGradient()
    })
}

function createGradient() {
    let r1 = Math.max(scene.h, scene.w)
    let gradCX = params.gradCenter.x * scene.w
    let gradCY = params.gradCenter.y * scene.h

    let gradient = scene.c.createRadialGradient(gradCX, gradCY, 0, gradCX, gradCY, params.gradRadius * r1)

    let color1 = `rgb(${params.color1.r}, ${params.color1.g}, ${params.color1.b})`
    let color2 = `rgba(${params.color2.r}, ${params.color2.g}, ${params.color2.b})`
    let color3 = `rgba(${params.color3.r}, ${params.color3.g}, ${params.color3.b})`

    gradient.addColorStop(0, color1)
    gradient.addColorStop(params.gradMiddlePoint, color2)
    gradient.addColorStop(1, color3)

    return gradient
}
