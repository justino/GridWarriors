export class Overlay {
    private overlayElement: HTMLElement

    constructor() {
        const overlay = document.getElementById('overlay')
        if (! overlay) throw new Error('Unable to find Overlay element')

        this.overlayElement = overlay
        this.setup()
    }

    private setup() {
        document.querySelector('button.start')
            ?.addEventListener('click', () => {
                this.hide()
                dispatchEvent(new CustomEvent('GameStart'))
            })
    }

    show() {
        this.overlayElement.classList.add('show')
    }

    hide() {
        this.overlayElement.classList.remove('show')
    }
}
