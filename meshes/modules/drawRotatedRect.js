export default function(ctx, cx, cy, width, height, degrees) {
    // first save the untranslated/unrotated context
    ctx.save()
    ctx.beginPath()
    // move the rotation point to the center of the rect
    ctx.translate(cx, cy)
    // rotate the rect
    ctx.rotate(degrees * Math.PI / 180)

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    //       so the rect needs to be offset accordingly when drawn
    // ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.rect(-width / 2, -height / 2, width, height)
    // ctx.fillStyle = 'rgb(255,255,255)'
    // ctx.fill();
    // ctx.fillStyle = 'rgb(0,0,0)'
    // restore the context to its untranslated/unrotated state
    ctx.restore()

    //return [[-width / 2, -height / 2], [-width / 2, -height / 2], ]
}