//Your scene setup code would go here, or this script tag could be given
//a `src` attribute which points to an external javascript file as well
var triangleShape = {
    points: [
        [ 100, 0,  0, '#fff'],
        [-100,-100, 0],
        [-100, 100, 0],
    ],
    lines: [
        [0, 1],
        [1, 2],
        [2, 0],
    ]
}

var n = NPos3d;
var scene = new n.Scene();
var triangle = new n.Ob3D({
    renderStyle: 'lines',
    shape: triangleShape, //The shape is designed to be pointing to the right
    rot: [0, 0, 0], //but I rotate it along the Z axis so that it is pointing upward.
    pos: [-400, 0, 0],
    color: '#90f'
});

var myOb = new n.Ob3D({
    pos: [100, 100, 200],
    // rot: [45 * deg, 60 * deg, 0],
    scale: [5, 5, 5],
    color: '#f00'
});
var myOb2 = new n.Ob3D({
    pos: [100, 100, 0],
    // rot: [45 * deg, 60 * deg, 0],
    scale: [10, 20, 10],
    color: '#f00'
});
myOb.update = function() {
    var t = this;
    t.pos[0] = scene.mpos.x / 5;
    t.pos[1] = scene.mpos.y / 5;
    t.rot[0] = -deg * scene.mpos.y / 10;
    t.rot[1] = -deg * scene.mpos.x / 10;
    t.color = 'hsl(' + Math.round(t.rot[1] / deg) + ', 100%, 50%)';
};
myOb2.update = function() {
    var t = this;
    t.pos[0] = scene.mpos.x / 5;
    t.pos[1] = scene.mpos.y / 5;
    t.rot[0] = -deg * scene.mpos.y / 10;
    t.rot[1] = deg * scene.mpos.x / 10;
    t.color = 'hsl(' + Math.round(t.rot[1] / deg) + ', 100%, 50%)';
};
scene.add(myOb);
scene.add(myOb2);
scene.add(triangle);