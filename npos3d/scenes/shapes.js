import Tweakpane from 'tweakpane'
import NPos3d from '../modules/npos3d'
import {paneOptions} from '../modules/paneOptions'
// import presets from "../presets/shell"

// init tweakpane

let paramsDefault = {
    shape: 'Sphere',
    text: 'en',
    fontSize: 10,
    scaleX: 15,
    scaleY: 15,
    scaleZ: 15,
    twist: false,
    twistAxis: 0,
    lathe: false,
    latheAxis: 0,
    rotateStrength: 5,
    moveStrength: 5,
}
let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

f1.addInput(params, 'shape', {
    options: paneOptions('sphere', 'cube', 'axies', 'font', 'circle')
})
f1.addInput(params, 'text')
f1.addInput(params, 'fontSize', {min: 10, max: 100, step: 1 })
f1.addInput(params, 'scaleX', {min: 1, max: 100, step: 1})
f1.addInput(params, 'scaleY', {min: 1, max: 100, step: 1})
f1.addInput(params, 'scaleZ', {min: 1, max: 100, step: 1})
f1.addInput(params, 'twist')
f1.addInput(params, 'twistAxis', {min: 0, max: 2, step: 1})
f1.addInput(params, 'lathe')
f1.addInput(params, 'latheAxis', {min: 0, max: 2, step: 1})
f1.addInput(params, 'rotateStrength', {min: 1, max: 100, step: 1})
f1.addInput(params, 'moveStrength', {min: 1, max: 10, step: 1})

let presetTimer

pane.on('change', () => {
    clearTimeout(presetTimer)
    presetTimer = setTimeout(() => {
        setup()
    }, 50)
})

// init scene

let lib = NPos3d
let scene = new lib.Scene({
    canvas: document.querySelector('[data-canvas]'),
    backgroundColor: '#fff'
})

setup()

// function declarations

function setup() {
    console.log('setup')
    scene.children.forEach(child => {
        if (child.type !== 'Camera') scene.remove(child)
    })

    let mesh = createMesh()
    mesh.update = function () {
        let t = this
        t.rot[0] = -scene.mpos.y * params.rotateStrength / 10000
        t.rot[1] = scene.mpos.x * params.rotateStrength / 10000
        t.pos[0] = scene.mpos.x * params.moveStrength / 10
        t.pos[1] = scene.mpos.y * params.moveStrength / 10
    }

    scene.add(mesh)
}

function createMesh() {
    let shape
    switch (params.shape) {
        case 'sphere':
            shape = new lib.Geom.Sphere({radius: 10})
            break
        case 'circle':
            shape = new lib.Geom.Circle({radius: 10})
            break
        case 'axies':
            shape = lib.Geom.axies
            break
        case 'font':
            shape = new lib.VText({
                string: params.text,
                fontSize: params.fontSize,
            }).shape
            break
        default:
            shape = lib.Geom.cube
    }

    if (params.twist) shape = new lib.Geom.Twist({shape, axis: params.twistAxis})
    if (params.lathe) shape = new lib.Geom.Lathe({shape, axis: params.latheAxis})

    return new lib.Ob3D({
        shape,
        pos: [0, 0, 0],
        rot: [0, 0, 0],
        scale: [params.scaleX, params.scaleY, params.scaleZ],
        color: '#0089ef'
    })
}
