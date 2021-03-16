export default function ellipseLine(xe, ye, rex, rey, x1, y1, x2, y2) {
    x1 -= xe
    x2 -= xe
    y1 -= ye
    y2 -= ye

    let A = (x2 - x1) ** 2 / rex ** 2 + (y2 - y1) ** 2 / rey ** 2
    let B = 2 * x1 * (x2 - x1) / rex ** 2 + 2 * y1 * (y2 - y1) / rey ** 2
    let C = x1 * x1 / rex ** 2 + y1 * y1 / rey ** 2 - 1
    let D = B * B - 4 * A * C

    if (D === 0) {
        let t = -B / 2 / A
        return t >= 0 && t <= 1
    } else if (D > 0) {
        let sqrt = Math.sqrt(D)
        let t1 = (-B + sqrt) / 2 / A
        let t2 = (-B - sqrt) / 2 / A

        //console.log(sqrt, t1, t2)

        // return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
        return [t1, t2]
    } else {
        return false
    }
}