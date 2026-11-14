type KeyboardMovementKeys = "NORTH" | "SOUTH" | "WEST" | "EAST"

type KeyboardDiscKeys = "NORTHWEST" | "NORTH" | "NORTHEAST"
                      | "WEST"      |           "EAST"
                      | "SOUTHWEST" | "SOUTH" | "SOUTHEAST"

type KeyboardState = {
    pressed: { [key: string]: boolean }
    justPressed: { [key: string]: boolean }
    movement: Record<KeyboardMovementKeys, string>
    DEFLECT: string[]
    THROW: string
    disc: Record<KeyboardDiscKeys, string>
    isDown: Function
    wasPressed: Function
    keyDown: Function
    keyUp: Function
    clearPresses: Function
    discKeyWasPressed: Function
    throwKeyWasPressed: Function
    deflectKeyDown: Function
}

// Keyboard State Object
// Manages the state of keyboard key presses
// Keys can be checked two ways:
//  * isDown: the key is held down right now (movement, deflecting)
//  * wasPressed: the key went down since the last game update (throwing, recalling),
//    holding the key down only counts once
export const KeyboardState: KeyboardState = {
    pressed: {},
    justPressed: {},

    movement: {
        NORTH: 'KeyW',
        SOUTH: 'KeyS',
        WEST: 'KeyA',
        EAST: 'KeyD'
    },

    // Number pad, or B for keyboards without one
    DEFLECT: ['Numpad5', 'KeyB'],

    // Throws in the direction the player is facing
    THROW: 'Space',

    disc: {
        NORTH: 'Numpad8',
        NORTHEAST: 'Numpad9',
        EAST: 'Numpad6',
        SOUTHEAST: 'Numpad3',
        SOUTH: 'Numpad2',
        SOUTHWEST: 'Numpad1',
        WEST: 'Numpad4',
        NORTHWEST: 'Numpad7'
    },

    isDown: function(key: string) {
        return this.pressed[key]
    },
    wasPressed: function(key: string) {
        return this.justPressed[key]
    },
    keyDown: function(code: string) {
        // Key repeat keeps sending keydowns while a key is held, only the first is a new press
        if (! this.pressed[code]) this.justPressed[code] = true
        this.pressed[code] = true
    },
    keyUp: function(code: string) { delete this.pressed[code] },

    // Called after every game update, so each press is only seen by one update.
    // A press between updates waits for the next one, so quick taps aren't lost.
    // Also called whenever presses shouldn't carry over (while paused, starting a game).
    clearPresses: function() {
        this.justPressed = {}
    },

    discKeyWasPressed: function() {
        for (const direction in this.disc) {
            if (this.wasPressed(this.disc[direction as KeyboardDiscKeys])) {
                return direction
            }
        }

        return null
    },
    throwKeyWasPressed: function() {
        // Any key that throws (or recalls) a disc
        return this.wasPressed(this.THROW) || this.discKeyWasPressed() !== null
    },
    deflectKeyDown: function() {
        return this.DEFLECT.some((key: string) => this.isDown(key))
    }
}

addEventListener('keyup',   e => { KeyboardState.keyUp(e.code) })
addEventListener('keydown', e => {
    // Stop the spacebar from scrolling the page
    if (e.code === KeyboardState.THROW) e.preventDefault()

    KeyboardState.keyDown(e.code)
})
