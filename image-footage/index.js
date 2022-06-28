const { magneticConstantDependencies } = require("mathjs/lib/cjs/entry/dependenciesAny.generated")

function imageFromSrc(src, alt = '') {
    const image = new Image()
    image.src = src
    image.alt = alt
    return image
}

/**
 * @param {HTMLElement} trigger 
 * @param {HTMLImageElement[]} images
 * @param {number} delay
 */
function imageFootage(trigger, images, delay) {
    let currentIndex = 0
    let timerId = null
    let shouldStop = false

    const getNextIndex = () => (currentIndex + 1) % images.length
    const hide = (index) => images[index].style.opacity = '0'
    const show = (index) => images[index].style.opacity = '1'

    images.forEach((_, i) => hide(i))
    show(currentIndex)

    const reset = () => {
        hide(currentIndex)
        show(0)
        currentIndex = 0
        shouldStop = false
        timerId = null
    }

    const loop = () => {
        if (shouldStop) {
            reset()
            return
        }

        timerId = setTimeout(loop, delay)

        const nextIndex = getNextIndex()

        hide(currentIndex)
        show(nextIndex)

        currentIndex = nextIndex
    }

    const start = () => {
        if (timerId) return
        loop()
    }

    const stop = () => {
        if (!timerId) return
        shouldStop = true
    }

    trigger.addEventListener('mouseenter', start)
    trigger.addEventListener('mouseleave', stop)
}

const baseUrl = 'https://s3.timeweb.com/ch23840-sozdanie-dev/olympic/Vovk_'
const imageNames = [
    '7613.jpg',
    '7611.jpg',
    '7596.jpg',
    '7588.jpg',
    '7578.jpg',
    '7554.jpg',
    '7544.jpg',
    '7526.jpg',
    '7506.jpg',
    '7501.jpg',
    '7488.jpg',
    '7465.jpg',
    '7411.jpg',
    '7406.jpg',
    '7388.jpg',
    '7383.jpg'
]
const images = imageNames.map((name, i) => imageFromSrc(baseUrl + name, `image #${i}`))

const root = document.querySelector('[data-image-footage]')
images.forEach((img) => root.append(img))

imageFootage(root, images, 1000 / 5)
