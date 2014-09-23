// Keyboard State Object
// Manages the state of keyboard key presses
var KeyboardState = {
    pressed: {},
    
    UP: 87,
    DOWN: 83,
    LEFT: 65,
    RIGHT: 68,
    BLOCK: 101,
    DISC_UPLEFT: 103,
    DISC_UP: 104,
    DISC_UPRIGHT: 105,
    DISC_RIGHT: 102,
    DISC_DOWNRIGHT: 99,
    DISC_DOWN: 98,
    DISC_DOWNLEFT: 97,
    DISC_LEFT: 100,
    
    isDown: function(keyCode) { return this.pressed[keyCode]; },
    keyDown: function(code) { this.pressed[code] = true; },
    keyUp: function(code) { delete this.pressed[code]; }
}