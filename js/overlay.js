export class Overlay {
    constructor() {
        this.element = document.getElementById('overlay')
        this._setup()
    }

    _setup() {
        document.querySelector('button.start')
            .addEventListener('click', () => {
                this.hide()
                dispatchEvent(new CustomEvent('GameStart'))
            })
    }

    show() {
        this.element.classList.add('show')
    }

    hide() {
        this.element.classList.remove('show')
    }
}
