//Please excuse the fact that I do not declare the variables which I would like to have accessible globally
n = NPos3d
s = new n.Scene()

let Norb = function(args) {
    var t = this, type = 'Norb'
    if (t.type !== type) {
        throw type + ' constructor requires the use of the `new` keyword.'
    }
    args = args || {}
    t.offset = args.offset
    n.blessWith3DBase(t, args)
    s.add(t)
}

Norb.prototype = {
    type: 'Norb',
    shape: n.Geom.cube,
    update: function() {
        var t = this, fac
        t.rot[0] += deg
        t.rot[1] += deg
        t.pos[0] = cos((tau / divisor * t.offset) + t.rot[1]) * 250
        t.pos[1] = sin((tau / divisor * t.offset) + t.rot[1]) * 250

        fac = 1 + Math.sin(tau / divisor * (t.offset + (time / 100)))

        t.scale[0] = t.scale[1] = t.scale[2] = fac
    }
}
let time = 0
let date = 0
let timeUpdater = {
    update: function() {
        let date = new Date()
        let time = date.getTime()
    }
}
s.add(timeUpdater)
let myNorbs = []
let divisor = 20
let spacing = 40

for (let i = 0; i < divisor; i += 1) {
    myNorbs.push(new Norb({
        pos: [(spacing * i) - (((divisor - 1) * spacing) / 2), 0, 0],
        color: 'hsl(' + ((360 / divisor) * i) + ',100%,50%)',
        scale: [500, 5, 5],
        offset: i
    }))
}