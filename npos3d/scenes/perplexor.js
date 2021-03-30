

var n = NPos3d;
var scene = new n.Scene({
    globalCompositeOperation: 'lighter'
});

var settings = {
    "pointScale": 32,
    "motionRadius": 32,
    "minScale": 2,
    "mulScale": 4,
    "speedMultiplier": 5,
    "renderStyle": "both" // || lines, points, both
};

var Perplexor = function(args) {
    var t = this, type = 'Perplexor';
    if(t.type !== type){throw 'You must use the `new` keyword when invoking the ' + type + ' constructor.';}
    args = args || {};
    n.blessWith3DBase(t, args);
    t.index = args.index || 0;
    t.count = args.count || 1;
    t.spacing = tau / t.count;
    t.offset = t.spacing * t.index;
    t.color = 'hsl('+((360/t.count) * t.index)+',100%,50%)';
    scene.add(t);
    return t;
};

Perplexor.prototype = {
    type: 'Perplexor',
    shape: n.Geom.cube,
    pointStyle: 'stroke',
    update: function() {
        var t = this,
            angle = t.offset + t.rot[1],
            fac = (Math.sin(angle + t.rot[1] * settings.speedMultiplier) + settings.minScale) * settings.mulScale;
        t.pointScale = settings.pointScale;
        t.renderStyle = settings.renderStyle;
        t.rot[0] -= deg;
        t.rot[1] += deg;
        t.pos[0] = cos(angle) * settings.motionRadius;
        t.pos[1] = sin(-angle) * settings.motionRadius;
        t.scale[0] = t.scale[1] = t.scale[2] = fac;
    }
};

var i,
    count = 36;
for(i = 0; i < count; i += 1){
    new Perplexor({
        index: i,
        count: count
    });
}