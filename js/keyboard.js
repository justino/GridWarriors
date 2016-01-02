// Keyboard State Object
// Manages the state of keyboard key presses
var KeyboardState = {
    pressed: {},
    
    movement: {
        UP: [87],
        DOWN: [83],
        LEFT: [65],
        RIGHT: [68]
    },
    
    BLOCK: [101, 53],
    
    disc: {
        UP: [104, 56],
        UPRIGHT: [105, 57],
        RIGHT: [102, 54],
        DOWNRIGHT: [99, 51],
        DOWN: [98, 50],
        DOWNLEFT: [97, 49],
        LEFT: [100, 52],
        UPLEFT: [103, 55]
    },
    
    isDown: function(keyCode) { return this.pressed[keyCode]; },
    keyDown: function(code) { this.pressed[code] = true; },
    keyUp: function(code) { delete this.pressed[code]; },
    
    discKeyPressed: function() {
        for (var direction in this.disc) {
            for (var key of this.disc[direction]) {
                if (this.isDown(key)) {
                    return this.disc[direction];
                }
            }
        }
        
        return false;
    }
}

document.onkeyup = function(e) { KeyboardState.keyUp(e.keyCode); };
document.onkeydown = function(e) { KeyboardState.keyDown(e.keyCode); };