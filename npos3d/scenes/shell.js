import Tweakpane from 'tweakpane'
import NPos3d from '../modules/npos3d'
import {paneOptions} from '../modules/paneOptions'
import mouse from '../modules/mouse'

let paramsDefault = {
    rings: 14,
    parallels: 0,
    firstRadius: 300,
    radiusStep: 0,
    points: 60,
    pointScale: 50,
    rotateOffset: 10,
    renderStyle: 'lines',
    // rotateSpeed: 150
    rotateSpeed: 0
    //...gradParams
}
let params = Object.assign({}, paramsDefault)

window.pane = new Tweakpane({
    container: document.querySelector('[data-pane]')
})
let f1 = pane.addFolder({
    title: 'Настройки',
    expanded: false
})

f1.addInput(params, 'rings', {min: 1, max: 100, step: 1})
// f1.addInput(params, 'parallels', {min: 0, max: 100, step: 1})
f1.addInput(params, 'firstRadius', {min: 1, max: 800, step: 1})
f1.addInput(params, 'radiusStep', {min: 0, max: 200, step: 1})
f1.addInput(params, 'points', {min: 1, max: 100, step: 1})
f1.addInput(params, 'pointScale', {min: 0.001, max: 1000, step: 0.001})
f1.addInput(params, 'rotateOffset', {min: 1, max: 100, step: 0.01})
f1.addInput(params, 'rotateSpeed', {min: 1, max: 1000, step: 1})
f1.addInput(params, 'renderStyle', {
    options: paneOptions('points', 'lines', 'both')
})

pane.on('change', e => {
    setup()
    // pane.refresh()
})

let lib = NPos3d
let scene = new lib.Scene({
    canvas: document.querySelector('[data-canvas]'),
    backgroundColor: '#fff'
})
let mphList = []

let MultiPoint = function(args) {
    let that = this
    args = args || {}

    that.radius = args.radius || 100
    that.currentAngle = args.currentAngle || 0
    that.destinationAngle = args.destinationAngle || 0
    that.axies = args.axies || [0, 1]
    that.point = [0, 0, 0]
    that.point[that.axies[0]] = that.radius // because the cos of 0 deg is always 1 this is 1 * radius
    return that
}

MultiPoint.prototype = {
    type: 'MultiPoint',
    drag: 0.1,
    update: function() {
        let that = this

        that.point[that.axies[0]] = cos(that.destinationAngle) * that.radius
        that.point[that.axies[1]] = sin(that.destinationAngle) * that.radius

        return true //complete
    }
}

let MultiPointHolder = function(args) {
    let that = this
    args = args || {}

    lib.blessWith3DBase(that, args)
    that.radius = args.radius || 100
    that.shape = {
        points: [],
        lines: []
    }
    that.pointScale = params.pointScale
    that.multiPoints = []
    that.parallel = args.parallel
    return that
}

MultiPointHolder.prototype = {
    type: 'MultiPointHolder',
    renderAlways: true,
    renderStyle: params.renderStyle,
    pointStyle: 'stroke',
    pointScale: params.pointScale,

    update: function() {
        let that = this
        let count = that.multiPoints.length
        let mPoint
        let complete

        that.lastRotString = false

        if (that.parallel) {
            that.rot[0] += deg / 1000 * params.rotateSpeed + mouse.cx / 100000
            // that.rot[1] += deg / 1000 * params.rotateSpeed ////+ mouse.cy / 100000
        } else {
            that.rot[0] += deg / 1000 * params.rotateSpeed + mouse.cx / 100000
            that.rot[1] += deg / 1000 * params.rotateSpeed + mouse.cy / 100000
        }

        for (let i = 0; i < count; i++) {
            mPoint = that.multiPoints[i]
            complete = mPoint.update()
        }

        if (complete) {
            that.color = '#0f0'
        } else {
            that.color = '#f00'
        }
        that.color = '#0089ef'

        if (that.parallel) that.color = 'red'
    },

    updateAllMultiPointAngles: function() {
        let t = this
        let count = t.multiPoints.length
        let mPoint
        let angle = tau / count

        for (let i = 0; i < count; i++) {
            mPoint = t.multiPoints[i]
            mPoint.destinationAngle = angle * i
        }
    },

    addPoint: function() {
        let that = this
        let count = that.multiPoints.length
        let mPoint = new MultiPoint({
            currentAngle: tau,
            radius: that.radius
        })

        that.multiPoints.push(mPoint)
        that.shape.points.push(mPoint.point)
        that.updateAllMultiPointAngles()

        if (count > 0) {
            that.shape.lines.push([count - 1, count]) //add line to last point
            if (count > 1) {
                that.shape.lines.push([0, count]) //add completing line
                if (count > 2) {
                    that.shape.lines.splice(-3, 1) // take off the last completing line
                }
            }
        }
    },

    subPoint: function() {
        let t = this
        let count = t.multiPoints.length

        if (count > 0) {
            t.multiPoints.pop()
            t.shape.points.pop()
            t.updateAllMultiPointAngles()

            if (count > 1) {
                t.shape.lines.pop()
                if (count > 2) {
                    t.shape.lines.pop() // take off the last completing line
                    if (count > 3) {
                        t.shape.lines.push([0, count - 2])
                    }
                }
            }
        }
    }
}


let subOneToAll = function(item) {
    item.subPoint()
}

let addHandler = function() {
    mphList.forEach(item => item.addPoint())
}

let subHandler = function() {
    mphList.forEach(subOneToAll)
}

function setup() {
    mphList = []
    scene.children.forEach(child => {
        if (child.type !== 'Camera') scene.remove(child)
    })

    for (let i = 1; i <= params.rings; i++) {
        let mph = new MultiPointHolder({
            rot: [
                0,
                i * Math.PI / params.rings,
                0
            ],
            radius: params.firstRadius + (i * params.radiusStep)
        })
        mphList.push(mph)
        scene.add(mph)
    }

    for (let i = 1; i <= params.parallels; i++) {
        let sections = params.parallels + 1
        let progress = -1
        let progressStep = 2 / sections

        let y0 = -params.firstRadius
        let step = 2 * params.firstRadius / (params.parallels + 1)
        // let progressStep = params.firstRadius * 2 / (params.parallels + 1)

        let r = params.firstRadius * Math.cos(progress + progressStep * i)

        let mph = new MultiPointHolder({
            rot: [
                Math.PI / 2,
                0,
                0
            ],
            pos: [
                0,
                y0 + step * i,
                0
            ],
            parallel: true,
            radius: r
        })
        mphList.push(mph)
        scene.add(mph)
    }

    for (let i = 0; i < params.points; i++) { //add 6 to start
        addHandler()
    }
}

// document.body.addEventListener('click', addHandler, false)
// document.getElementById('sub').addEventListener('mouseup', subHandler, false)

setup()

window.scene = scene
