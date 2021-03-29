import {Point} from '../index'
import {Face} from '../index'

export let Cube = function(x, y, z, w) {
    this.w = w
    this.points = []
    this.faces = []

    let p = [
        [x - w, y - w, z - w],
        [x + w, y - w, z - w],
        [x + w, y + w, z - w],
        [x - w, y + w, z - w],
        [x - w, y - w, z + w],
        [x + w, y - w, z + w],
        [x + w, y + w, z + w],
        [x - w, y + w, z + w]
    ]
    for (let i in p) this.points.push(
        new Point(this, p[i], true)
    )

    // faces coordinates
    let f = [
        [0, 1, 2, 3],
        [0, 4, 5, 1],
        [3, 2, 6, 7],
        [0, 3, 7, 4],
        [1, 5, 6, 2],
        [5, 4, 7, 6]
    ]

    // faces normals
    let nv = [
        [0, 0, 1],
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, -1]
    ]

    // cube transparency
    this.alpha = alpha ? 0.5 : 1
    // push faces
    for (let i in f) {
        this.faces.push(
            new Face(this, f[i], nv[i])
        )
    }
}