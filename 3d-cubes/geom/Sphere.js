import Point from './Point'
import Line from './Line'
///import mouse from '../'
import {canvasH, canvasW, lines, mouseX, mouseY, params} from '../tetra'

let count = 0

export default class Tetra {
    constructor(r, sort) {
        count++
        this.sort = sort
        this.r = r
        this.points = []
        this.rotate(0, 0, 0)

        let SQRT2 = Math.SQRT2

        let p = [
            [r, 0, -r / SQRT2],
            [-r, 0, -r / SQRT2],
            [0, -r, r / SQRT2],
            [0, r, r / SQRT2],
        ]

        for (let i = 0; i < p.length; i++) {
            this.points.push(new Point(p[i]))
        }

        let l = [
            [0, 1],
            [1, 2],
            [2, 0],
            [2, 3],
            [3, 0],
            [3, 1],
        ]

        for (let i = 0; i < l.length; i++) {
            lines.push(
                new Line(this.points[l[i][0]], this.points[l[i][1]])
            )
        }
    }

    rotate = (angleX, angleY, angleZ) => {
        this.angleX = angleX
        this.angleY = angleY
        this.angleZ = angleZ

        // pre-calculating trigo
        this.cosY = Math.cos(angleY)
        this.sinY = Math.sin(angleY)
        this.cosX = Math.cos(angleX)
        this.sinX = Math.sin(angleX)
        this.cosZ = Math.cos(angleZ)
        this.sinZ = Math.sin(angleZ)
    }

    projectPoint = (point) => {
        // 3D rotation
        let x = this.cosY * (this.sinZ * point.yo + this.cosZ * point.xo) - this.sinY * point.zo

        let y = this.sinX * (this.cosY * point.zo + this.sinY * (this.sinZ * point.yo + this.cosZ * point.xo)) +
            this.cosX * (this.cosZ * point.yo - this.sinZ * point.xo)

        let z = this.cosX * (this.cosY * point.zo + this.sinY * (this.sinZ * point.yo + this.cosZ * point.xo)) -
            this.sinX * (this.cosZ * point.yo - this.sinZ * point.xo)

        this.x = x
        this.y = y
        this.z = z

        // point visible
        // if (z < minZ) minZ = z
        // this.visible = (params.zoom + z > 0)

        // 3D to 2D projection
        // let mouseShiftX = mouseX * canvasW * params.mouseMagnetic / 1000 * (count - this.sort)
        // let mouseShiftY = mouseY * canvasH * params.mouseMagnetic / 1000 * (count - this.sort)
        // TODO magnetic
        let mouseShiftX = 0
        let mouseShiftY = 0

        point.X = (canvasW * params.centerX) + x * (params.perspective / (z + params.zoom)) + mouseShiftX
        point.Y = (canvasH * params.centerY) + y * (params.perspective / (z + params.zoom)) + mouseShiftY
    }

    projection = () => this.points.forEach(point => this.projectPoint(point))
}