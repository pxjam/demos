export default function(xDir, yDir, w, h) {
    let x0, x1, y0, y1

    switch (xDir) {
        case 'left':
            x0 = w
            x1 = 0
            break
        case 'center':
            x0 = 0
            x1 = 0
            break
        case 'right':
            x0 = 0
            x1 = w
    }
    switch (yDir) {
        case 'top':
            y0 = 0
            y1 = h
            break
        case 'center':
            y0 = 0
            y1 = 0
            break
        case 'bottom':
            y0 = h
            y1 = 0
    }

    return [x0, y0, x1, y1]
}