function Unit(name, gameGrid, width, height, color, location) {   
    this.isPlayer = false;
    this.canBlock = false;
    this.baseSpeed = 1;
    this.speedModifier = 0;
    this.regenerates = false;
    this.recoveryRate = 4;
    this.maxHits = 1;
    this.hits = 0;
    this.baseAccuracy = 5;
    this.accuracyModifier = 0;
    this.movementVector = [];
    
    Sprite.call(this, name, gameGrid, width, height, color, location);
}
Unit.prototype = Object.create(Sprite.prototype);

Unit.prototype.Draw = function() {
    this.DrawSprite();
    
    // Draw units disc too
    if (this.disc) {
        this.disc.Draw();
    }
}

Unit.prototype.Update = function() {
    // Did we catch our own disc
    this.CatchDisc();
    
    // AI here
}

Unit.prototype.CatchDisc = function() {
    if (this.disc.status == 'returning' && this.Collision(this.disc)) {
        console.log('Disc: ' + this.name + ' caught disc');
        this.disc.status = 'held';
    }
}

Unit.prototype.setDestination = function() {
    // Random location on game grid
}

Unit.prototype.Throw = function(direction) {
    if (this.disc && this.disc.status != 'held') return;
    
    this.disc.status = 'deadly';
    
    this.disc.Thrown(direction);
}

// -------------------------------------------------------------------------- //
// Different Unit Types
// -------------------------------------------------------------------------- //

function Warrior(gameGrid, location) { 
    Unit.call(this, 'Warrior', gameGrid, 'rgba(0, 255, 255, 1)', location);
    this.disc = new DarkBlue(gameGrid, this);
}
Warrior.prototype = Object.create(Unit.prototype);

function Bulldog(gameGrid, location) {
    Unit.call(this, 'Bulldog', gameGrid, 'rgba(255, 0, 255, 1)', location);
    this.speed = .5;
    this.regenerates = true;
    this.maxHits = 2;
    this.baseAccuracy = 3;
    this.disc = new DarkBlue(gameGrid, this);
}
Bulldog.prototype = Object.create(Unit.prototype);

function Leader(gameGrid, location) {
    Unit.call(this, 'Leader', gameGrid, 'rgba(0, 127, 255, 1)', location);
    this.speed = 1.5;
    this.baseAccuracy = 7;
    
    if (Math.random() * 100 <= settings.whiteDiscPercent) {
        this.disc = new White(gameGrid, this);
    }
    else {
        this.disc = new Brown(gameGrid, this);
    }
}
Leader.prototype = Object.create(Unit.prototype);

function Guard(gameGrid, location) {
    Unit.call(this, 'Guard', gameGrid, 'rgba(255, 255, 127, 1)', location);
    this.speed = 2;
    this.regenerates = true;
    this.maxHits = 4;
    
    this.disc = null; // Has Stun Pole
}
Guard.prototype = Object.create(Unit.prototype);

Guard.prototype.setDestination = function() {
    // Location of player
}
