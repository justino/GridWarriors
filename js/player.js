// Special Type of Unit

function Player(location) {
    Unit.call(this, 'Tron', config.tronColor, location);

    this.isPlayer = true;
    this.canBlock = true;
    this.regenerates = true;
    this.maxHits = 3;
    this.disc = new Yellow(this);
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
    if (this.disc.status == 'blocking') { return; }

    var velocity = new Vector([0, 0]);

    // Move around based on keyboard input
    if (KeyboardState.isDown(KeyboardState.movement.DOWN))  { velocity.points[1] += (this.baseSpeed * this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.movement.UP))    { velocity.points[1] -= (this.baseSpeed * this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.movement.LEFT))  { velocity.points[0] -= (this.baseSpeed * this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) { velocity.points[0] += (this.baseSpeed * this.speedModifier); }

    // Only perform movement if there was any
    if (velocity.points[0] != 0 || velocity.points[1] != 0) { this.location.Add(velocity); }
}

Player.prototype.UpdateDiscStatus = function() {
    if (this.disc.status == 'held') {
        // Disc Throwing
        var direction = KeyboardState.discKeyPressed();
        if (direction) {
            this.disc.Thrown(direction);
            KeyboardState.keyUp(direction); // Don't repeatably throw, must press again
        }

        //Blocking
        if (KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'blocking'; }
    }
    else if (this.disc.status == 'deadly') {
        if (KeyboardState.discKeyPressed()) {
            if (this.disc.returnable === true) {
                this.disc.Return();
            }
        }
        else if (! this.disc.returnable) {
            this.disc.returnable = true;
        }
    }
    else if (this.disc.status == 'blocking') {
        if (! KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'held'; }
    }
}

// -------------------------------------------------------------------------- //

function Yellow(unit) {
    Disc.call(this, 'Yellow', 'rgba(255, 255, 0, 1)', unit)
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
