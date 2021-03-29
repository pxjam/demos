import {Point} from '../index'
import {Face} from '../index'

export function Globe(w) {
    this.w = w
    this.points = []
    this.faces = []

    let p = [
        [0, -w, 0],
        [-w, 0, -w],
        [-w, 0, w],
        [w, 0, w],
        [w, 0, -w],
        [0, w, 0],
    ]
    for (let i = 0; i < p.length; i++) {
        this.points.push(
            new Point(this, p[i], true)
        )
    }

    // faces coordinates
    let f = [
        [0, 1, 4],
        [0, 2, 1],
        [0, 2, 3],
        [0, 4, 3],
        [1, 5, 4],
        [1, 2, 5],
        [2, 3, 5],
        [4, 5, 3],
    ]

    // faces normals
    let nv = [
        [0, -1, -1],
        [-1, -1, 0],
        [0, -1, 1],
        [1, -1, 0],
        [0, 1, -1],
        [-1, 1, 0],
        [0, 1, 1],
        [1, 1, 0],
    ]

    // push faces
    for (let i = 0; i < f.length; i++) {
        this.faces.push(
            new Face(this, f[i], nv[i])
        )
    }
}