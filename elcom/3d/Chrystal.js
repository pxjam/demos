export default function({height = 1, radius = 1, segments = 4} = {}) {
    let waistPoints = []

    for (let i = 1; i <= segments; i++) {
        let angle = 2 * Math.PI * i / segments
        waistPoints.push([
            radius * Math.cos(angle),
            0,
            radius * Math.sin(angle)
        ])
    }
    console.log(waistPoints)

    this.points = [
        [0, height, 0],
        ...waistPoints,
        [0, -height, 0],
    ]

    let topPointEdges = []
    let waistEdges = []
    let bottomPointEdges = []

    for (let i = 1; i <= segments; i++) {
        topPointEdges.push([
            0,
            i
        ])

        waistEdges.push([
            i,
            i === segments ? 1 : i + 1
        ])

        bottomPointEdges.push([
            segments + 1,
            i
        ])
    }

    this.edges = [
        ...topPointEdges,
        ...waistEdges,
        ...bottomPointEdges
    ]
    return this
}
