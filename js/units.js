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
    
    Sprite.call(this, name, gameGrid, width, height, color, location);
    
    this.velocity = new Vector([0, 0]);
    this.setDestination();
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
    if (this.disc) {
        this.CatchDisc();
    }

    // Move Unit towards destination
    this.UpdateLocation();
    
    // Are we at our destination
    if (this.TouchLocation(this.destination)) {
        this.setDestination();
    }
    
    // Make sure Unit statys on the grid
    var hitEdge = this.bindToGameGrid();
    if (hitEdge[0] || hitEdge[1]) {
        // Hit an edge, make a new destination
        //console.log('Unit: ' + this.name + ' hit an edge, setting new destination')
        this.setDestination();
    }

    // Maintain Disc
    if (this.disc) { 
        this.UpdateDiscStatus();
        this.disc.Update();
    }
}

Unit.prototype.UpdateLocation = function() {
    this.location.Add(this.velocity);
}

Unit.prototype.UpdateDiscStatus = function() {
    if (this.disc.status == 'held' && ! this.disc.primed) {
        this.disc.primed = true;
        window.setTimeout(this.ThrowDisc.bind(this), 2000 + Math.round(Math.random() * 10000));
    }
}

Unit.prototype.ThrowDisc = function() {
    // console.log('Unit: ' + this.name + ' throwing disc');

    // Aim at player
    var direction = Vector.SubFactory(this.gameGrid.player.location, this.disc.location);
    direction.Normalize();
    
    this.disc.Thrown(direction)
}

Unit.prototype.CatchDisc = function() {
    if (this.disc.status == 'returning' && this.Collision(this.disc)) {
        //console.log('Unit: ' + this.name + ' caught disc');
        this.disc.status = 'held';
        this.disc.primed = false;
    }
}

Unit.prototype.setDestination = function() {
    this.velocity = new Vector([0, 0]);
    
    // Random location on game grid
    this.destination = new Vector([ 
        Math.round(Math.random() * (this.canvas.width - config.unitSize)), 
        Math.round(Math.random() * (this.canvas.height - config.unitSize))
    ]);
    
    var destinationForce = Vector.SubFactory(this.destination, this.location);
    destinationForce.Normalize();
    destinationForce.Mul(this.baseSpeed + this.speedModifier);
    
    this.velocity.Add(destinationForce);
    this.velocity.Limit(this.baseSpeed + this.speedModifier);
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
    Unit.call(this, 'Warrior', gameGrid, config.unitSize, config.unitSize, config.warriorColor, location);
    this.disc = new DarkBlue(gameGrid, this);
}
Warrior.prototype = Object.create(Unit.prototype);

function Bulldog(gameGrid, location) {
    Unit.call(this, 'Bulldog', gameGrid, config.unitSize, config.unitSize, config.bulldogColor, location);
    this.speed = .5;
    this.regenerates = true;
    this.maxHits = 2;
    this.baseAccuracy = 3;
    this.disc = new DarkBlue(gameGrid, this);
}
Bulldog.prototype = Object.create(Unit.prototype);

function Leader(gameGrid, location) {
    Unit.call(this, 'Leader', gameGrid, config.unitSize, config.unitSize, config.leaderColor, location);
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
    Unit.call(this, 'Guard', gameGrid, config.unitSize, config.unitSize, config.guardColor, location);
    this.speed = 2;
    this.regenerates = true;
    this.maxHits = 4;
    
    this.disc = null; // Has Stun Pole
}
Guard.prototype = Object.create(Unit.prototype);

Guard.prototype.setDestination = function() {
    // Location of player
}
