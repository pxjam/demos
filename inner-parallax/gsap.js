import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

gsap.utils.toArray("[data-inner-parallax]").forEach((container, i) => {
    container.bg = container.querySelector("[data-inner-parallax-bg]")

    gsap.fromTo(container.bg, {
        y: () => -container.bg.offsetHeight / 4
    }, {
        y: () => container.bg.offsetHeight / 4,
        ease: "none",
        scrollTrigger: {
            trigger: container,
            start: () => "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true // to make it responsive
        }
    })
})
