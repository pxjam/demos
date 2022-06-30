function createInterpolator(x1, y1, x2, y2, min, max) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = dy / dx;

    return function(param) {
        var result = d * (param - x1) + y1;
        if (min != null && result < min) result = min;
        if (max != null && result > max) result = max;
        return result;
    }
}

function offset(elem) {
    return elem.getBoundingClientRect().top + window.scrollY
}


function InnerParallax(container) {
    if (this instanceof InnerParallax) {
        this.container = container;
        if (!this.container) return;

        return this.init();
    }
}

InnerParallax.prototype = {
    constructor: InnerParallax,

    init: function() {
        var I = this;
        I.needRedraw = true;
        I.bg = I.container.querySelector('[data-inner-parallax-bg]');

        window.addEventListener('resize', I.resize.bind(I));

        I.resize();
    },

    resize: function() {
        var I = this;

        I.containerHeight = I.container.offsetHeight;
        I.startPoint = offset(I.container) - window.innerHeight;
        I.endPoint = offset(I.container)  + I.containerHeight;

        I.getProgress = createInterpolator(I.startPoint, -0.5, I.endPoint, 0.5);

        I.bgHeight = I.bg.offsetHeight;
        I.parallaxDist = I.bgHeight - I.containerHeight;

        I.progress = I.getProgress(window.scrollY);
    },

    update: function(progress) {
        var I = this;

        I.progress = I.getProgress(window.scrollY);

        var isVisible = I.progress > -.5 && I.progress < .5;
        var progressChanged = I.progress !== I.lastProgress;

        if (isVisible && progressChanged) {
            I.needRedraw = true;
            I.y = I.parallaxDist * I.progress * 2.2;
        } else {
            I.needRedraw = false;
        };

        I.lastProgress = I.progress;
    },

    drawParallax: function() {
        var I = this;

        I.bg.style.transform = `translate3d(0, ${I.y}px, 0`;
    }
}

initInnerParallax = function() {
    var innerParallaxes = [];

    document.querySelectorAll('[data-inner-parallax]').forEach(function(container) {
        innerParallaxes.push(new InnerParallax(container));
    });

    function loop() {
        requestAnimationFrame(loop);
        var y = window.scrollY;

        innerParallaxes.forEach(function(parallax) {
            parallax.update(y);

            if (parallax.needRedraw) {
                requestAnimationFrame(function() {
                    parallax.drawParallax();
                });
            };
        });
    };

    loop();
};

window.addEventListener('load', initInnerParallax);