// Special Type of Unit

function Player(gameGrid, location) { 
    this.isPlayer = true;
    this.canBlock = true;
    this.regenerates = true;
    this.hits = 3;
    
    Unit.call(this, 'Tron', gameGrid, config.unitSize, config.unitSize, config.tronColor, location);
    this.disc = new Yellow(gameGrid, this);
}
Player.prototype = Object.create(Unit.prototype);

Player.prototype.Update = function() {
    this.CatchDisc();
    this.UpdateLocation();
    this.bindToGameGrid();
    
    this.UpdateDiscStatus();
    this.disc.Update();
}

Player.prototype.UpdateLocation = function() {
    // Can't run while blocking
    if (this.disc.status != 'blocking') {
        var velocity = new Vector([0, 0]);
    
        // Move around based on keyboard input
        if (KeyboardState.isDown(KeyboardState.movement.DOWN))  { velocity.points[1] += (this.baseSpeed + this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.UP))    { velocity.points[1] -= (this.baseSpeed + this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.LEFT))  { velocity.points[0] -= (this.baseSpeed + this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) { velocity.points[0] += (this.baseSpeed + this.speedModifier); }
        
        // Only perform movement if there was any
        if (velocity.points[0] != 0 || velocity.points[1] != 0) { this.location.Add(velocity); }
    }
}

Player.prototype.UpdateDiscStatus = function() {
    if (this.disc.status == 'held') {
        // Disc Throwing
        discKey = KeyboardState.discKeyPressed();
        if (discKey) {
            this.disc.Thrown(discKey);
            KeyboardState.keyUp(discKey); // Don't repeatably throw, must press again
        }
        
        //Blocking
        if (KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'blocking'; }
    }
    else if (this.disc.status == 'blocking') {
        if (! KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'held'; }
    }
}

// -------------------------------------------------------------------------- //

function Yellow(gameGrid, unit) {
    Disc.call(this, 'Yellow', gameGrid, 'rgba(255, 255, 0, 1)', unit)
}
Yellow.prototype = Object.create(Disc.prototype);

Yellow.prototype.Thrown = function(direction) {
    this.status = 'deadly';
    var velocity = new Vector([0, 0]);
    
    switch(direction) {
        case KeyboardState.disc.UP:
            velocity.points[1] -= (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.UPLEFT:
            velocity.points[1] -= (this.baseSpeed + this.speedModifier);
            velocity.points[0] -= (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.LEFT:
            velocity.points[0] -= (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.DOWNLEFT:
            velocity.points[1] += (this.baseSpeed + this.speedModifier);
            velocity.points[0] -= (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.DOWN:
            velocity.points[1] += (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.DOWNRIGHT:
            velocity.points[1] += (this.baseSpeed + this.speedModifier);
            velocity.points[0] += (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.RIGHT:
            velocity.points[0] += (this.baseSpeed + this.speedModifier);
            break;
        case KeyboardState.disc.UPRIGHT:
            velocity.points[1] -= (this.baseSpeed + this.speedModifier);
            velocity.points[0] += (this.baseSpeed + this.speedModifier);
            break;
    }
    
    this.velocity = velocity;
}