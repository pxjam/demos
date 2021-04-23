import Tweakpane from 'tweakpane'
import {createGradControls, getActualGradient, gradParams} from './modules/gradient'
import presets from './presets/tetra'
import getPreset from '../common/utils/getPreset'
import Line from './geom/Line'
import Tetra from './geom/Tetra'
import {mouse} from './modules/mouse'
import getSymmetricObject from './utils/getSymmetricObject'

let paramsDefault = {
    firstObjectSize: 100,
    objectsCount: 12,
    // firstCubeSize: 5,
    // objectsCount: 10,
    bgLight: true,
    duplicateMethod: 'sum',
    duplicateFactor: 0.4,
    framesOverlay: 0,
    perspective: 1500,
    autorotate: true,
    autorotateSpeed: 25,
    // stepRotate: 1.1,
    innerRotateSpeed: 15,
    revertInnerRotate: false,
    mouseRotatePower: 25,
    mouseRotateInertia: 200,
    mousePower: 30,
    mouseCoverage: 160,
    mouseMode: 'repel',
    zoom: 1,
    size: 1.2,
    centerX: 0.5,
    centerY: 0.5,
    ...gradParams,
}
export let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

f1.addInput(params, 'firstObjectSize', {min: 1, max: 200, step: 1})
f1.addInput(params, 'objectsCount', {min: 1, max: 50, step: 1})
f1.addInput(params, 'duplicateFactor', {min: 0.01, max: 3, step: 0.001})
f1.addInput(params, 'duplicateMethod', {
    options: getSymmetricObject(['sum', 'multiply'])
})
f1.addInput(params, 'autorotate')
f1.addInput(params, 'autorotateSpeed', {min: 0, max: 100, step: 1})
f1.addInput(params, 'revertInnerRotate')
f1.addInput(params, 'innerRotateSpeed', {min: 0, max: 100, step: 1})
f1.addInput(params, 'mouseRotatePower', {min: 1, max: 100, step: 1})
f1.addInput(params, 'mouseRotateInertia', {min: 1, max: 1000, step: 1})
f1.addInput(params, 'mousePower', {min: 1, max: 200, step: 1})
f1.addInput(params, 'mouseCoverage', {min: 1, max: 800, step: 1})
f1.addInput(params, 'mouseMode', {
    options: getSymmetricObject(['repel', 'bloat', 'attract'])
})
f1.addInput(params, 'centerX', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'centerY', {min: 0, max: 1, step: 0.01})
f1.addInput(params, 'perspective', {min: 0, max: 3000, step: 1})
// f1.addInput(params, 'zoom', {min: 0, max: 1000, step: 1})
f1.addInput(params, 'size', {min: 0.1, max: 4, step: 0.1})
f1.addInput(params, 'framesOverlay', {min: 0, max: 1, step: 0.01})
f1.addSeparator()
createGradControls(f1, params)

f1.addInput({preset: 0}, 'preset', {
    options: presets.reduce((acc, val, i) => {
        acc['preset ' + (i + 1)] = i
        return acc
    }, {})
})

if (presets.length) {
    Object.assign(params, paramsDefault, presets[0])
    pane.refresh()
}

let saveBtn = f1.addButton({title: 'Copy preset'})
saveBtn.on('click', () => navigator.clipboard.writeText(getPreset(pane.exportPreset())))

document.querySelector('.box').addEventListener('click', () => f1.expanded = false)

let box
let canvas
let ctx
let objects
export let lines
export let canvasW
export let canvasH
let cx = 50
let cy = 50
let cz = 0
let minZ
let angleY = 0
let angleX = 0
let angleZ = 0
let gradient

let resize = function() {
    canvasW = box.offsetWidth
    canvasH = box.offsetHeight

    canvas.width = canvasW
    canvas.height = canvasH
}

function reset() {
    objects = []
    lines = []

    let size = params.firstObjectSize

    for (let i = 0; i < params.objectsCount; i++) {
        objects.push(new Tetra(size, i))

        if (params.duplicateMethod === 'sum') {
            size += params.duplicateFactor * params.firstObjectSize
        } else if (params.duplicateMethod === 'multiply') {
            size *= params.duplicateFactor
        }
    }
}

let init = function() {
    box = document.querySelector('.box')
    canvas = document.querySelector('[data-canvas]')
    ctx = canvas.getContext('2d')

    window.addEventListener('mousewheel', e => {
        cz += e.wheelDelta
    })

    resize()
    window.addEventListener('resize', resize, false)

    reset()
    updateGradient()
    render()
    updatePerspective()
}

function render() {
    Line.eraseAll()

    ctx.save()

    if (params.gradPreview) {
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - params.framesOverlay})`
        ctx.fillRect(0, 0, canvasW, canvasH)

        cx = mouse.x * params.mouseRotatePower / 100
        cy = -mouse.y * params.mouseRotatePower / 100

        // ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = gradient

        // points projection
        minZ = 0
        let i = 0
        let obj

        while (obj = objects[i++]) {
            // easing rotations
            angleX += ((cy - angleX) / params.mouseRotateInertia)
            angleY += ((cx - angleY) / params.mouseRotateInertia)
            angleZ += ((cz - angleZ) / params.mouseRotateInertia)

            let rotateFactor = (params.revertInnerRotate)
                ? (params.objectsCount - i + 1)
                : i + 1
            rotateFactor *= params.innerRotateSpeed / 100000

            obj.rotate(angleX * rotateFactor, angleY * rotateFactor, angleZ * rotateFactor)
            obj.projection()
        }

        if (params.autorotate) cz += params.autorotateSpeed / 10

        let j = 0
        let line
        while (line = lines[j++]) {
            line.draw(ctx)
        }
    }

    ctx.restore()

    requestAnimationFrame(render)
}

let updateGradient = () => gradient = getActualGradient(canvas, params)

let updatePerspective = () => params.zoom = params.perspective * params.size

window.pane.on('change', (e) => {
    if (e.presetKey == 'mouseMode') {
        mouse.mode = e.value
    }
    if (e.presetKey == 'mousePower') {
        mouse.power = e.value
    }
    if (e.presetKey == 'mouseCoverage') {
        mouse.coverage = e.value
    }
    updatePerspective()
    reset()
    updateGradient()
})

init()

window.params = params