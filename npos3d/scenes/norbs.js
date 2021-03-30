import Tweakpane from 'tweakpane'
import NPos3d from '../modules/npos3d'
import {paneOptions} from '../modules/paneOptions'
import mouse from '../modules/mouse'
import presets from '../presets/shell'

let paramsDefault = {
    size: 10,
    count: 12
}
let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

f1.addInput(params, 'size', {min: 1, max: 100, step: 1})
f1.addInput(params, 'count', {min: 1, max: 100, step: 1})


//Please excuse the fact that I do not declare the variables which I would like to have accessible globally
let lib = NPos3d
let scene = new lib.Scene({
    canvas: document.querySelector('[data-canvas]'),
    backgroundColor: '#fff'
})

let Norb = function(args) {
    let t = this, type = 'Norb'
    if (t.type !== type) {
        throw type + ' constructor requires the use of the `new` keyword.'
    }
    args = args || {}
    t.offset = args.offset
    lib.blessWith3DBase(t, args)
    scene.add(t)
}

Norb.prototype = {
    type: 'Norb',
    shape: lib.Geom.cube,
    update: function() {
        let t = this, fac
        t.rot[0] += deg
        t.rot[1] += deg
        t.pos[0] = cos((tau / params.count * t.offset) + t.rot[1]) * 250
        t.pos[1] = sin((tau / params.count * t.offset) + t.rot[1]) * 250

        fac = params.size + Math.sin(tau / params.count * (t.offset + (time / 100)))

        t.scale[0] = t.scale[1] = t.scale[2] = fac
    }
}
let time = 0
let date = 0
let timeUpdater = {
    update: function() {
        let date = new Date()
        let time = date.getTime()
    }
}
scene.add(timeUpdater)

let myNorbs = []
let spacing = 40

function fixNorbsCount() {
    if (myNorbs.length !== params.count) {
        let diff = params.count - myNorbs.length

        if (diff > 0) {

        } else if (diff < 0) {

        }
    }
}

for (let i = 0; i < params.count; i++) {
    myNorbs.push(new Norb({
        pos: [(spacing * i) - (((params.count - 1) * spacing) / 2), 0, 0],
        color: '#09f',
        scale: [5, 5, 5],
        offset: i
    }))
}