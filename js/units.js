function Unit(name, gameGrid, width, height, color, location) {
    this.isPlayer = false;
    this.canBlock = false;
    this.baseSpeed = 1;
    this.speedModifier = 1;
    this.regenerates = false;
    this.recoveryRate = 4;
    this.maxHits = 1;
    this.hits = 0;
    this.baseAccuracy = config.warriorAccuracy;
    this.accuracyModifier = 0;
    this.regenerateTimer = null;

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
    if (! this.gameGrid.player) { return; }

    // Aim at player
    var aimFor = Vector.Clone(this.gameGrid.player.location);

    // Apply Accuracy (somewhere around the player)
    aimFor.points[0] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier);
    aimFor.points[1] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier);

    var direction = Vector.SubFactory(aimFor, this.disc.location);
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
    destinationForce.Mul(this.baseSpeed * this.speedModifier);

    this.velocity.Add(destinationForce);
    this.velocity.Limit(this.baseSpeed * this.speedModifier);
}

Unit.prototype.Throw = function(direction) {
    if (this.disc && this.disc.status != 'held') return;

    this.disc.status = 'deadly';

    this.disc.Thrown(direction);
}

Unit.prototype.Hit = function() {
    this.hits += 1;
    this.speedModifier = 1 / (this.hits + 1);
    this.setDestination();

    if (this.hits < this.maxHits && this.regenerates) {
        this.regenerateTimer = window.setTimeout(this.Regenerate.bind(this), config.regenerationTime * 1000);
    }
}

Unit.prototype.Regenerate = function() {
    if (! this.regenerates) { return; }

    if (this.hits > 0) {
        console.log(this.name + ' regenerated 1 HP');
        this.hits -= 1;
        this.speedModifier = (0.5 * this.hits) || 1;
        this.setDestination();
    }
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
    this.baseSpeed = .5;
    this.regenerates = true;
    this.maxHits = 2;
    this.baseAccuracy = config.bulldogAccuracy;
    this.disc = new DarkBlue(gameGrid, this);
}
Bulldog.prototype = Object.create(Unit.prototype);

function Leader(gameGrid, location) {
    Unit.call(this, 'Leader', gameGrid, config.unitSize, config.unitSize, config.leaderColor, location);
    this.baseSpeed = 1.5;
    this.baseAccuracy = config.leaderAccuracy;

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
    this.baseSpeed = 2;
    this.regenerates = true;
    this.maxHits = 4;

    this.disc = null; // Has Stun Pole
}
Guard.prototype = Object.create(Unit.prototype);

Guard.prototype.setDestination = function() {
    // Location of player
}
