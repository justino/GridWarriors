function Disc(name, gameGrid, color, unit) {
    this.strength = 1;
    this.homing = false;
    this.status = 'held'; // deadly, bouncing, returning, blocking
    this.baseSpeed = config.discSpeed;
    this.speedModifier = 0;
    this.velocity = null;
    
    this.owner = unit;
    
    Sprite.call(this, name, gameGrid, config.discSize, config.discSize, color, this.owner.location);
}
Disc.prototype = Object.create(Sprite.prototype);

Disc.prototype.Update = function() {
    switch(this.status) {
        case 'held':
            this.location = Vector.Clone(this.owner.location);
            break;
        case 'returning':
            this.Return();
            break;
        case 'deadly':
        case 'bouncing':
            this.location.Add(this.velocity);
            break;
    }
    
    var bounced = this.bindToGameGrid();
    if (bounced[0] || bounced[1]) {
        if (bounced[0]) { this.BounceX() }
        if (bounced[1]) { this.BounceY() }
        
        if (this.status != 'bouncing') {
            this.status = 'bouncing';
            window.setTimeout(this.Return.bind(this), 1000);
        }
    }
}

Disc.prototype.Draw = function() {
    context = this.canvas.getContext('2d');
    context.fillStyle = this.color;
    
    switch(this.status) {
        case 'held':
        case 'bouncing':
        case 'returning':
            // Square
            this.changeHeight(config.discSize);
            this.DrawSprite();
            break;
        case 'deadly':
            // Flat
            this.changeHeight(config.discSize / 2);
            this.DrawSprite();
            break;
        case 'blocking':
            break;
    }
}

Disc.prototype.Thrown = function(direction) {
}

Disc.prototype.Return = function() {
    this.status = 'returning';
    this.velocity = new Vector([0, 0]);
    
    var ownerForce = Vector.SubFactory(this.owner.location, this.location);
    ownerForce.Normalize();
    ownerForce.Mul(this.baseSpeed + this.speedModifier);
    
    this.velocity.Add(ownerForce);
    this.velocity.Limit(this.baseSpeed + this.speedModifier);
    
    this.location.Add(this.velocity);
}

Disc.prototype.BounceX = function() {
    this.velocity.points[0] *= -1;
}

Disc.prototype.BounceY = function() {
    this.velocity.points[1] *= -1;
}

// -------------------------------------------------------------------------- //
// Different Disc Types
// -------------------------------------------------------------------------- //

function DarkBlue(gameGrid, unit) {
    Disc.call(this, 'DarkBlue', gameGrid, 'rgba(0, 0, 128, 1)', unit);
}
DarkBlue.prototype = Object.create(Disc.prototype);

function Brown(gameGrid, unit) {
    Disc.call(this, 'Brown', gameGrid, 'rgba(139, 69, 19, 1)', unit);
    this.strength = 2;
}
Brown.prototype = Object.create(Disc.prototype);

function White(gameGrid, unit) {
    Disc.call(this, 'White', gameGrid, 'rgba(255, 255, 255, 1)', unit);
    this.homing = true;
}
White.prototype = Object.create(Disc.prototype);
