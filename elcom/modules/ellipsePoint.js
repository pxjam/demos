export default function ellipsePoint(xe, ye, rex, rey, x1, y1) {
    let x = (x1 - xe) ** 2 / rex ** 2
    let y = (y1 - ye) ** 2 / rey ** 2
    return x + y <= 1
}