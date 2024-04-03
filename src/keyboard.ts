type KeyboardMovementKeys = "UP"   | "DOWN" | "LEFT" | "RIGHT"

type KeyboardDiscKeys = "UPLEFT"   | "UP"   | "UPRIGHT"
                      | "LEFT"     |          "RIGHT"
                      | "DOWNLEFT" | "DOWN" | "DOWNRIGHT"

type KeyboardState = {
    pressed: { [key: string]: boolean }
    movement: Record<KeyboardMovementKeys, string>
    BLOCK: string
    disc: Record<KeyboardDiscKeys, string>
    isDown: Function
    keyDown: Function
    keyUp: Function
    discKeyPressed: Function
    releaseDiscKey: Function
}

// Keyboard State Object
// Manages the state of keyboard key presses
export const KeyboardState: KeyboardState = {
    pressed: {},

    movement: {
        UP: 'KeyW',
        DOWN: 'KeyS',
        LEFT: 'KeyA',
        RIGHT: 'KeyD'
    },

    BLOCK: 'Numpad5',

    disc: {
        UP: 'Numpad8',
        UPRIGHT: 'Numpad9',
        RIGHT: 'Numpad6',
        DOWNRIGHT: 'Numpad3',
        DOWN: 'Numpad2',
        DOWNLEFT: 'Numpad1',
        LEFT: 'Numpad4',
        UPLEFT: 'Numpad7'
    },

    isDown: function(key: string) {
        return this.pressed[key]
    },
    keyDown: function(code: string) { this.pressed[code] = true },
    keyUp: function(code: string) { delete this.pressed[code] },

    discKeyPressed: function() {
        for (const direction in this.disc) {
            if (this.isDown(this.disc[direction as KeyboardDiscKeys])) {
                return direction
            }
        }

        return null
    },
    releaseDiscKey: function(direction: string) {
        const key = this.disc[direction as KeyboardDiscKeys]
        this.keyUp(key)
    }
}

addEventListener('keyup',   e => { KeyboardState.keyUp(e.code) })
addEventListener('keydown', e => { KeyboardState.keyDown(e.code) })
