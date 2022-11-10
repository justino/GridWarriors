import { Sprite } from "../sprite.js"
import { Vector } from "../vector.js"

export class Disc extends Sprite {
    HELD = Symbol("held")
    DEADLY = Symbol("deadly")
    BOUNCING = Symbol("bouncing")
    RETURNING = Symbol("returning")

    constructor(name, color, unit) {
        super(unit.gameGrid, name, unit.gameGrid.config.discSize, unit.gameGrid.config.discSize, color, unit.location)

        this.owner = unit;

        this.strength = 1;
        this.status = this.HELD; // deadly, bouncing, returning
        this.baseSpeed = this.owner.gameGrid.config.discSpeed;
        this.speedModifier = 0;
        this.velocity = null;

        this.returnable = false;
        this.primed = false;
        this.collided = null;
    }

    Update() {
        switch (this.status) {
            case this.HELD:
                // Follow owner around
                this.location = Vector.Clone(this.owner.location);
                break;
            case this.RETURNING:
                this.Return();
                break;
            case this.DEADLY:
            case this.BOUNCING:
                // Basic Straight Lines
                this.location.Add(this.velocity);
                break;
        }

        this.checkBounce();
    }

    checkBounce() {
        const bounced = this.bindToGameGrid();
        if (bounced[0] || bounced[1]) {
            if (bounced[0]) { this.BounceX(); }
            if (bounced[1]) { this.BounceY(); }

            if (this.status !== this.BOUNCING) {
                this.status = this.BOUNCING;
                setTimeout(this.Return.bind(this), this.owner.gameGrid.config.discReturnTime);
            }
        }
    }

    Draw() {
        switch (this.status) {
            case this.HELD:
            case this.BOUNCING:
            case this.RETURNING:
                // Square
                if (this.height !== this.owner.gameGrid.config.discSize) { this.changeHeight(this.owner.gameGrid.config.discSize); }
                this.DrawSprite();
                break;
            case this.DEADLY:
                // Flat
                if (this.height !== this.owner.gameGrid.config.discSize / 2) { this.changeHeight(this.owner.gameGrid.config.discSize / 2); }
                this.DrawSprite();
                break;
        }
    }

    checkCollide(unit) {
        // We don't care about non-deadly discs
        if (this.status !== this.DEADLY)
            return;

        const collision = this.Collision(unit);

        /* If the disc has already collided with the current unit
           ignore, we don't want to hit them again until we've stopped colliding
           with them */
        if (unit === this.collided && collision) {
            return;
        }

        /* If the disc is marked as being collided with this unit
           but it isn't collided any more, unmark it. */
        if (unit === this.collided && !collision) {
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
            // Bounce off unit if they are alive, otherwise pass through corpse
            if (! unit.isDead()) this.Return();
        }
    }

    Thrown(direction) {
        this.status = this.DEADLY;

        const velocity = new Vector([0, 0]);

        direction.Mul(this.baseSpeed + this.speedModifier);

        velocity.Add(direction);
        velocity.Limit(this.baseSpeed + this.speedModfier);
        this.velocity = velocity;
    }

    Return() {
        this.status = this.RETURNING;
        this.returnable = false;

        this.velocity = new Vector([0, 0]);

        const ownerForce = Vector.SubFactory(this.owner.location, this.location);
        ownerForce.Normalize();
        ownerForce.Mul(this.baseSpeed + this.speedModifier);

        this.velocity.Add(ownerForce);
        this.velocity.Limit(this.baseSpeed + this.speedModifier);

        this.location.Add(this.velocity);
    }

    BounceX() {
        this.velocity.points[0] *= -1;
    }

    BounceY() {
        this.velocity.points[1] *= -1;
    }
}
