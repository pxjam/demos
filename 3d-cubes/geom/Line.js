let drawnLines = []

export default class Line {
    constructor(point0, point1) {
        this.point0 = point0
        this.point1 = point1

        this.sum = point0.X + point0.Y + point1.X + point1.Y
    }

    static eraseAll() {
        drawnLines = []
    }

    draw = (ctx) => {
        this.sum = this.point0.X + this.point0.Y + this.point1.X + this.point1.Y

        if (drawnLines.indexOf(this.sum) === -1) {
            drawnLines.push(this.sum)
            ctx.globalAlpha = 1
        } else {
            ctx.globalAlpha = 0
        }

        ctx.beginPath()

        ctx.moveTo(this.point0.X, this.point0.Y)
        ctx.lineTo(this.point1.X, this.point1.Y)
        ctx.closePath()

        ctx.stroke()
    }
}
