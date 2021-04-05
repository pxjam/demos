export default class Point {
    constructor(xyz, parent) {
        if (parent) this.parent = parent

        this.xo = xyz[0]
        this.yo = xyz[1]
        this.zo = xyz[2]
    }
}
