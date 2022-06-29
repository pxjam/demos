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
        if (shouldStop || currentIndex >= images.length - 1) {
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

const processArray = (arr) => [...arr, ...arr.slice(1, arr.length - 1).reverse()] 

{
    const baseUrl = 'https://s3.timeweb.com/ch23840-sozdanie-dev/olympic/1/olympic_'
    const imageNames = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg',
        '9.jpg',
        '10.jpg'
    ]

    const images = processArray(imageNames).map((name, i) => imageFromSrc(baseUrl + name, `image #${i}`))

    const root = document.querySelector('[data-image-footage="1"]')
    images.forEach((img) => root.append(img))

    imageFootage(root, images, 1000 / 5)
}

{
    const baseUrl = 'https://s3.timeweb.com/ch23840-sozdanie-dev/olympic/2/olympic_'
    const imageNames = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg',
        '9.jpg'
    ]

    const images = processArray(imageNames).map((name, i) => imageFromSrc(baseUrl + name, `image #${i}`))

    const root = document.querySelector('[data-image-footage="2"]')
    images.forEach((img) => root.append(img))

    imageFootage(root, images, 1000 / 5)
}

{
    const baseUrl = 'https://s3.timeweb.com/ch23840-sozdanie-dev/olympic/3/olympic_'
    const imageNames = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg',
        '9.jpg'
    ]

    const images = processArray(imageNames).map((name, i) => imageFromSrc(baseUrl + name, `image #${i}`))

    const root = document.querySelector('[data-image-footage="3"]')
    images.forEach((img) => root.append(img))

    imageFootage(root, images, 1000 / 5)
}
