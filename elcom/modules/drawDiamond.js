export let drawDiamond = (ctx, cx, cy, rx, ry) => {
    ctx.beginPath()
    ctx.moveTo(cx, cy - ry)
    ctx.lineTo(cx - rx, cy)
    ctx.lineTo(cx, cy + ry)
    ctx.stroke()
    ctx.closePath()
}