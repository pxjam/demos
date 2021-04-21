import Point from './Point'
import Line from './Line'
import {mouse, mouseShift} from '../modules/mouse'
import {canvasH, canvasW, lines, params} from '../tetra'

let count = 0

export default class Tetra {
    constructor(r, sort) {
        count++
        this.sort = sort
        this.r = r
        this.points = []
        this.rotate(0, 0, 0)

        this.forceX = 0
        this.forceY = 0

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
        let x = this.cosY * (this.sinZ * point.yo + this.cosZ * point.xo) - this.sinY * point.zo

        let y = this.sinX * (this.cosY * point.zo + this.sinY * (this.sinZ * point.yo + this.cosZ * point.xo)) +
            this.cosX * (this.cosZ * point.yo - this.sinZ * point.xo)

        let z = this.cosX * (this.cosY * point.zo + this.sinY * (this.sinZ * point.yo + this.cosZ * point.xo)) -
            this.sinX * (this.cosZ * point.yo - this.sinZ * point.xo)

        this.x = x
        this.y = y
        this.z = z

        let X = (canvasW * params.centerX) + x * (params.perspective / (z + params.zoom))
        let Y = (canvasH * params.centerY) + y * (params.perspective / (z + params.zoom))

        let magnet = !true

        if (!magnet) {
            let projectedPoint = mouseShift(X, Y)
            point.X = projectedPoint[0]
            point.Y = projectedPoint[1]
        } else {
            // todo rewrite from new pen
            this.X0 = (canvasW * params.centerX) + x * (params.perspective / (z + params.zoom))
            this.Y0 = (canvasH * params.centerY) + y * (params.perspective / (z + params.zoom))

            let distanceX = x - mouse.x
            let distanceY = y - mouse.y
            let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

            let powerX = x - (distanceX / distance) * magnet / distance
            let powerY = y - (distanceY / distance) * magnet / distance

            this.forceX = (this.forceX + (this.X0 - X) / 2) / 2.1
            this.forceY = (this.forceY + (this.Y0 - Y) / 2) / 2.1

            this.X = powerX + this.forceX
            this.Y = powerY + this.forceY
        }
    }

    projection = () => this.points.forEach(point => this.projectPoint(point))
}