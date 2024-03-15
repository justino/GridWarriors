// Keyboard State Object
// Manages the state of keyboard key presses
export const KeyboardState = {
    pressed: {},

    movement: {
        UP: ['KeyW'],
        DOWN: ['KeyS'],
        LEFT: ['KeyA'],
        RIGHT: ['KeyD']
    },

    BLOCK: ['Numpad5'],

    disc: {
        UP: ['Numpad8'],
        UPRIGHT: ['Numpad9'],
        RIGHT: ['Numpad6'],
        DOWNRIGHT: ['Numpad3'],
        DOWN: ['Numpad2'],
        DOWNLEFT: ['Numpad1'],
        LEFT: ['Numpad4'],
        UPLEFT: ['Numpad7']
    },

    isDown: function(keyList) {
        for (const key of keyList) {
            if (this.pressed[key]) {
                return true
            }
        }
        return false
    },
    keyDown: function(code) { this.pressed[code] = true },
    keyUp: function(code) { delete this.pressed[code] },

    discKeyPressed: function() {
        for (const direction in this.disc) {
            if (this.isDown(KeyboardState.disc[direction])) {
                return direction
            }
        }

        return null
    },
    releaseDiscKey: function(direction) {
        const keys = this.disc[direction]
        for (const key of keys) {
            this.keyUp(key)
        }
    }
}

addEventListener('keyup',   e => { KeyboardState.keyUp(e.code) })
addEventListener('keydown', e => { KeyboardState.keyDown(e.code) })
