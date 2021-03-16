const PI = Math.PI

function display(r) {
    this.point = [];
    this.color = "blue)"
    this.r = (typeof(r) == "undefined") ? 20.0 : r;
    this.r = (typeof(r) != "number") ? 20.0 : r;
    this.vertexes = 0;

    for (let alpha = 0; alpha <= 2 * PI; alpha += 0.17) {
        let p = this.point[this.vertexes] = new Point3D();
        p.x = Math.cos(alpha) * this.r;
        p.y = 0;
        p.z = Math.sin(alpha) * this.r;
        this.vertexes++;
    }
}

// let canvas = document.querySelector("[data-canvas]")
// let width = canvas.width
// let height = canvas.height
// let ctx = canvas.getContext('2d')
//
// let sphere = new Sphere3D()
// let rotation = new Point3D()
// let distance = 1000
// let lastX = -1
// let lastY = -1
//
// rotation.x = Math.PI / 10
//
// function Point3D() {
//     this.x = 0
//     this.y = 0
//     this.z = 0
// }
//
// function Sphere3D(radius) {
//     this.vertices = new Array()
//     this.radius = (typeof (radius) == "undefined" || typeof (radius) != "number") ? 20.0 : radius
//     this.rings = 16
//     this.slices = 32
//     this.numberOfVertices = 0
//
//     let M_PI_2 = Math.PI / 2
//     let dTheta = (Math.PI * 2) / this.slices
//     let dPhi = Math.PI / this.rings
//
//     // Iterate over latitudes (rings)
//     for (let lat = 0; lat < this.rings + 1; ++lat) {
//         let phi = M_PI_2 - lat * dPhi
//         let cosPhi = Math.cos(phi)
//         let sinPhi = Math.sin(phi)
//
//         // Iterate over longitudes (slices)
//         for (let lon = 0; lon < this.slices + 1; ++lon) {
//             let theta = lon * dTheta
//             let cosTheta = Math.cos(theta)
//             let sinTheta = Math.sin(theta)
//             p = this.vertices[this.numberOfVertices] = new Point3D()
//
//             p.x = this.radius * cosTheta * cosPhi
//             p.y = this.radius * sinPhi
//             p.z = this.radius * sinTheta * cosPhi
//             this.numberOfVertices++
//         }
//     }
// }
//
// function rotateX(point, radians) {
//     let y = point.y
//     point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0)
//     point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians))
// }
//
// function rotateY(point, radians) {
//     let x = point.x
//     point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0)
//     point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians))
// }
//
// function rotateZ(point, radians) {
//     let x = point.x
//     point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0)
//     point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians))
// }
//
// function projection(xy, z, xyOffset, zOffset, distance) {
//     return ((distance * xy) / (z - zOffset)) + xyOffset
// }
//
// function strokeSegment(index, ctx, width, height) {
//     let x, y
//     let p = sphere.vertices[index]
//
//     rotateX(p, rotation.x)
//     rotateY(p, rotation.y)
//     rotateZ(p, rotation.z)
//
//     x = projection(p.x, p.z, width / 2.0, 100.0, distance)
//     y = projection(p.y, p.z, height / 2.0, 100.0, distance)
//
//     if (lastX == -1 && lastY == -1) {
//         lastX = x
//         lastY = y
//         return
//     }
//
//     if (x >= 0 && x < width && y >= 0 && y < height) {
//         if (p.z < 0) {
//             ctx.strokeStyle = "gray"
//         } else {
//             ctx.strokeStyle = "black"
//         }
//         ctx.beginPath()
//         ctx.moveTo(lastX, lastY)
//         ctx.lineTo(x, y)
//         ctx.stroke()
//         ctx.closePath()
//         lastX = x
//         lastY = y
//     }
// }
//
// function render() {
//     let p = new Point3D()
//     ctx.fillStyle = "transparent"
//
//     ctx.clearRect(0, 0, width, height)
//     ctx.fillRect(0, 0, width, height)
//
//     // draw each vertex to get the first sphere skeleton
//     for (i = 0; i < sphere.numberOfVertices; i++) {
//         strokeSegment(i, ctx, width, height)
//     }
//
//     // now walk through rings to draw the slices
//     for (i = 0; i < sphere.slices + 1; i++) {
//         for (let j = 0; j < sphere.rings + 1; j++) {
//             strokeSegment(i + (j * (sphere.slices + 1)), ctx, width, height)
//         }
//     }
//
//     rotation.x += Math.PI / 180.0
//     rotation.y += Math.PI / 90.0
//     rotation.z += Math.PI / 90.0
//
//     // set distance to 0 and enable this to get a zoom in animation
//     /*if(distance < 1000) {
//         distance += 10;
//       } */
// }
//
// render()


