function Unit(name, gameGrid) {
    this.color = '';
    this.isPlayer = false;
    this.canBlock = false;
    this.baseSpeed = 3;
    this.speedModifier = 0;
    this.regenerates = false;
    this.recoveryRate = 4;
    this.maxHits = 1;
    this.hits = 0;
    this.baseAccuracy = 5;
    this.accuracyModifier = 0;
    this.movementVector = [];
    
    this.gameGrid = gameGrid;
    this.name = name;
    this.canvas = this.gameGrid.canvas;
    
    console.log('Unit: ' + this.name + ' Created');
}

Unit.prototype.Draw = function() {
    context = this.canvas.getContext('2d');
    context.fillStyle = this.color;
    context.fillRect(
        this.location.points[0] - 15, this.location.points[1] - 15, 
        15, 15
    );
}

Unit.prototype.Update = function() {
}

Unit.prototype.setDestination = function() {
    // Random location on game grid
}

// -------------------------------------------------------------------------- //

function Warrior(gameGrid) { 
    Unit.call(this, 'Warrior', gameGrid);
    
    this.color = 'rgba(0, 255, 255, 1)';
    
    this.disc = new DarkBlue();
}
Warrior.prototype = Object.create(Unit.prototype);

function Bulldog(gameGrid) { 
    Unit.call(this, 'Bulldog', gameGrid);
    
    this.prototype.Color = 'rgba(255, 0, 255, 1)';
    this.speed = 2;
    this.regenerates = true;
    this.maxHits = 2;
    this.baseAccuracy = 3;
    
    this.disc = new DarkBlue();
}
Bulldog.prototype = Object.create(Unit.prototype);

function Leader(gameGrid) { 
    Unit.call(this, 'Leader', gameGrid);
    
    this.color = 'rgba(0, 127, 255, 1)';
    this.speed = 4;
    this.baseAccuracy = 7;
    
    if (Math.random() * 100 < settings.whiteDiscPercent) {
        this.disc = new White();
    }
    else {
        this.disc = new Brown();
    }
}
Leader.prototype = Object.create(Unit.prototype);

function Guard(gameGrid) { 
    Unit.call(this, 'Guard', gameGrid);
    
    this.color = 'rgba(255, 255, 127, 1)';
    this.speed = 5;
    this.regenerates = true;
    this.maxHits = 4;
    
    this.disc = null; // Has Stun Pole
}
Guard.prototype = Object.create(Unit.prototype);

Guard.prototype.setDestination = function() {
    // Location of player
}
