export default function(ctx, cx, cy, width, height, degrees, phantom) {
    ctx.beginPath()

    let theta = degrees * Math.PI / 180

    let w2 = width / 2
    let h2 = height / 2

    let sin = Math.sin(theta)
    let cos = Math.cos(theta)

    function rotatePoint(pointX, pointY) {
        return [
            cos * (pointX - cx) - sin * (pointY - cy) + cx,
            sin * (pointX - cx) + cos * (pointY - cy) + cy
        ]
    }

    let points = [
        rotatePoint(cx - w2, cy + h2),
        rotatePoint(cx + w2, cy + h2),
        rotatePoint(cx, cy - h2),
    ]

    if (!phantom) {
        ctx.moveTo(...points[0])
        ctx.lineTo(...points[1])
        ctx.lineTo(...points[2])
        ctx.lineTo(...points[0])
    }
    ctx.closePath()

    return points
}