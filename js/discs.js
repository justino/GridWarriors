function Disc(name, color, unit) {
    this.strength = 1;
    this.homing = false;
    this.status = 'held'; // deadly, bouncing, returning, blocking
    this.baseSpeed = config.discSpeed;
    this.speedModifier = 0;
    this.velocity = null;
    this.returnable = false;

    this.owner = unit;
    this.primed = false;
    this.collided = null;

    Sprite.call(this, name, config.discSize, config.discSize, color, this.owner.location);
}
Disc.prototype = Object.create(Sprite.prototype);

Disc.prototype.Update = function() {
    switch(this.status) {
        case 'held':
            // Follow owner around
            this.location = Vector.Clone(this.owner.location);
            break;
        case 'returning':
            this.Return();
            break;
        case 'deadly':
        case 'bouncing':
            // Basic Straight Lines
            this.location.Add(this.velocity);
            break;
    }

    var bounced = this.bindToGameGrid();
    if (bounced[0] || bounced[1]) {
        if (bounced[0]) { this.BounceX() }
        if (bounced[1]) { this.BounceY() }

        if (this.status != 'bouncing') {
            this.status = 'bouncing';
            setTimeout(this.Return.bind(this), config.discReturnTime);
        }
    }
}

Disc.prototype.Draw = function() {
    switch(this.status) {
        case 'held':
        case 'bouncing':
        case 'returning':
            // Square
            if (this.height != config.discSize) { this.changeHeight(config.discSize); }
            this.DrawSprite();
            break;
        case 'deadly':
            // Flat
            if (this.height != config.discSize / 2) { this.changeHeight(config.discSize / 2); }
            this.DrawSprite();
            break;
        case 'blocking':
            break;
    }
}

Disc.prototype.checkCollide = function(unit) {
    // We don't care about non-deadly discs
    if (this.status !== 'deadly') return;

    var collision = this.Collision(unit);

    /* If the disc has already collided with the current unit
       ignore, we don't want to hit them again until we've stopped colliding
       with them */
    if (unit === this.collided && collision) {
        return;
    }

    /* If the disc is marked as being collided with this unit
       but it isn't collided any more, unmark it. */
    if (unit === this.collided && ! collision) {
        this.collided = null;
    }

    /* If this disc has collided with this unit
       then mark the disc as being collided with this unit */
    if (collision) {
        this.collided = unit;
    }

    if (collision) {
        dispatchEvent(new CustomEvent('UnitHit', {
            detail: {
                winner: this.owner,
                loser: unit
            }
        }));

        // When a collision occurs, attempt to regenerate the disc owner
        // if they are capable
        this.owner.Regenerate();
    }
}

Disc.prototype.Thrown = function(direction) {
    this.status = 'deadly';
    var velocity = new Vector([0, 0]);

    direction.Mul(this.baseSpeed + this.speedModifier);

    velocity.Add(direction);
    velocity.Limit(this.baseSpeed + this.speedModfier);
    this.velocity = velocity;
}

Disc.prototype.Return = function() {
    this.status = 'returning';
    this.returnable = false;

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

function DarkBlue(unit) {
    Disc.call(this, 'DarkBlue', 'rgba(0, 0, 128, 1)', unit);
}
DarkBlue.prototype = Object.create(Disc.prototype);

function Brown(unit) {
    Disc.call(this, 'Brown', 'rgba(139, 69, 19, 1)', unit);
    this.strength = 2;
}
Brown.prototype = Object.create(Disc.prototype);

function White(unit) {
    Disc.call(this, 'White', 'rgba(255, 255, 255, 1)', unit);
    this.homing = true;
}
White.prototype = Object.create(Disc.prototype);
