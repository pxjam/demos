export default class Video {
    constructor(container) {
        if (typeof container === 'string') container = document.querySelector(container)
        this.container = container

        this.video = this.container.querySelector('[data-video-video]')
        if (!this.container || !this.video) return

        this.btn = this.container.querySelector('[data-video-btn]')
        this.isAuto = !this.btn

        this.load = this.load.bind(this)
        this.pause = this.pause.bind(this)
        this.play = this.play.bind(this)

        if (this.isAuto) {
            this.container.setAttribute('data-video-auto', '')
        } else {
            this.btn.addEventListener('mouseup', this.load)
            this.video.addEventListener('click', this.pause)
        }

        this.video.addEventListener('play', this.handlePlay.bind(this))
        this.video.addEventListener('pause', this.handlePause.bind(this))
        document.addEventListener('sound-on', this.unmute.bind(this))
        document.addEventListener('sound-off', this.mute.bind(this))

        window.addEventListener('video-play', this.pause.bind(this))

        this.container.Video = this
    }

    handlePlay() {
        this.container.classList.add('--playing')
        this.protectFromPause = true
        window.dispatchEvent(new CustomEvent('video-play'))
    }

    handlePause() {
        this.container.classList.remove('--playing')
    }

    load() {
        if (this.video.dataset.src) {
            this.video.src = this.video.dataset.src
            this.video.removeAttribute('data-src')
        }

        if (this.video.preload === 'none' || this.video.preload === 'metadata') {
            this.video.preload = 'auto'
        }

        this.btn.removeEventListener('mouseup', this.load)
        this.btn.addEventListener('click', this.play)

        if (this.video.readyState === 4) {
            this.play()
        } else {
            this.video.addEventListener('canplaythrough', this.play)
        }
    }

    play() {
        this.video.play()
    }

    pause() {
        if (!this.protectFromPause && !this.isAuto) {
            this.video.pause()
        }
        this.protectFromPause = false
    }

    mute() {
        this.video.muted = true
    }

    unmute() {
        this.video.autoplay = false
        this.video.playsinline = false
        this.video.webkitPlaysinline = false
        this.video.muted = false
    }
}
