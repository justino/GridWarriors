// Keyboard State Object
// Manages the state of keyboard key presses
var KeyboardState = {
    pressed: {},
    
    movement: {
        UP: 87,
        DOWN: 83,
        LEFT: 65,
        RIGHT: 68
    },
    
    BLOCK: 101,
    
    disc: {
        UP: 104,
        UPRIGHT: 105,
        RIGHT: 102,
        DOWNRIGHT: 99,
        DOWN: 98,
        DOWNLEFT: 97,
        LEFT: 100,
        UPLEFT: 103
    },
    
    isDown: function(keyCode) { return this.pressed[keyCode]; },
    keyDown: function(code) { this.pressed[code] = true; },
    keyUp: function(code) { delete this.pressed[code]; },
    
    discKeyPressed: function() {
        for (direction in this.disc) {
            if (this.isDown(this.disc[direction])) {
                return this.disc[direction];
            }
        }
        
        return false;
    }
}

document.onkeyup = function(e) { KeyboardState.keyUp(e.keyCode); };
document.onkeydown = function(e) { KeyboardState.keyDown(e.keyCode); };