export let drawEllipseBezierByCenter = (ctx, cx, cy, rx, ry, style) => {
    drawEllipseBezier(ctx, cx - rx, cy - ry, rx * 2 , ry * 2, style)
}

export let drawHalfEllipseBezierByCenter = (ctx, cx, cy, rx, ry, style) => {
    drawHalfEllipseBezier(ctx, cx - rx, cy - ry, rx * 2 , ry * 2, style)
}

export let drawEllipseBezier = (ctx, x, y, w, h) => {
    const KAPPA = .5522848
    let ox = (w / 2) * KAPPA // control point offset horizontal
    let oy = (h / 2) * KAPPA // control point offset vertical
    let xe = x + w           // x-end
    let ye = y + h           // y-end
    let xm = x + w / 2       // x-middle
    let ym = y + h / 2       // y-middle

    // ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, ym)
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)
    ctx.stroke()
    ctx.closePath()
    // ctx.restore()
}

export let drawHalfEllipseBezier = (ctx, x, y, w, h) => {
    const KAPPA = .5522848
    let ox = (w / 2) * KAPPA // control point offset horizontal
    let oy = (h / 2) * KAPPA // control point offset vertical
    let ye = y + h           // y-end
    let xm = x + w / 2       // x-middle
    let ym = y + h / 2       // y-middle

    ctx.beginPath()
    ctx.moveTo(xm, y)
    ctx.bezierCurveTo(xm - ox, y, x, ym - oy, x, ym)
    ctx.bezierCurveTo(x, ym + oy, xm - ox, ye, xm, ye)
    ctx.stroke()
    ctx.closePath()
}