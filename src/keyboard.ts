type KeyboardMovementKeys = "UP"   | "DOWN" | "LEFT" | "RIGHT"

type KeyboardDiscKeys = "UPLEFT"   | "UP"   | "UPRIGHT"
                      | "LEFT"     |          "RIGHT"
                      | "DOWNLEFT" | "DOWN" | "DOWNRIGHT"

type KeyboardState = {
    pressed: { [key: string]: boolean }
    movement: Record<KeyboardMovementKeys, string>
    BLOCK: string[]
    THROW: string
    disc: Record<KeyboardDiscKeys, string>
    isDown: Function
    keyDown: Function
    keyUp: Function
    discKeyPressed: Function
    throwKeyPressed: Function
    blockKeyPressed: Function
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

    // Number pad, or B for keyboards without one
    BLOCK: ['Numpad5', 'KeyB'],

    // Throws in the direction the player is facing
    THROW: 'Space',

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
    throwKeyPressed: function() {
        // Any key that throws (or returns) a disc
        return this.isDown(this.THROW) || this.discKeyPressed() !== null
    },
    blockKeyPressed: function() {
        return this.BLOCK.some((key: string) => this.isDown(key))
    },
    releaseDiscKey: function(direction: string) {
        const key = this.disc[direction as KeyboardDiscKeys]
        this.keyUp(key)
    }
}

addEventListener('keyup',   e => { KeyboardState.keyUp(e.code) })
addEventListener('keydown', e => {
    // Stop the spacebar from scrolling the page
    if (e.code === KeyboardState.THROW) e.preventDefault()

    KeyboardState.keyDown(e.code)
})
