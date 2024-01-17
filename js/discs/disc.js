import { Sprite } from "../sprite.js"
import { Vector } from "../vector.js"

export const DiscStates = Object.freeze({
    HELD:      Symbol("held"),
    DEADLY:    Symbol("deadly"),
    BOUNCING:  Symbol("bouncing"),
    RETURNING: Symbol("returning")
})

export class Disc extends Sprite {
    constructor(name, color, unit) {
        const discSize = config.unitSize / 4
        super(unit.gameGrid, name, discSize, discSize, color, unit.location)

        this.discSize = discSize

        this.owner = unit

        this.strength = 1
        this.status = DiscStates.HELD
        this.speedModifier = 0
        this.velocity = null

        this.returnable = false
        this.primed = false
        this.collided = null
    }

    Update() {
        switch (this.status) {
            case DiscStates.HELD:
                // Follow owner around
                this.location = Vector.Clone(this.owner.location)
                break
            case DiscStates.RETURNING:
                this.Return()
                break
            case DiscStates.DEADLY:
            case DiscStates.BOUNCING:
                // Basic Straight Lines
                this.location.Add(this.velocity)
                this.checkBounce()
                break
        }
    }

    checkBounce() {
        const bounced = this.bindToGameGrid()
        if (bounced[0] || bounced[1]) {
            if (bounced[0]) this.BounceX()
            if (bounced[1]) this.BounceY()

            if (this.status !== DiscStates.BOUNCING) {
                this.status = DiscStates.BOUNCING
                setTimeout(this.Return.bind(this), config.discReturnTime)
            }
        }
    }

    Draw() {
        switch (this.status) {
            case DiscStates.HELD:
            case DiscStates.BOUNCING:
            case DiscStates.RETURNING:
                // Square
                if (this.height !== this.discSize) this.changeHeight(this.discSize)
                this.DrawSprite()
                break
            case DiscStates.DEADLY:
                // Flat
                if (this.height !== this.discSize / 2) this.changeHeight(this.discSize / 2)
                this.DrawSprite()
                break
        }
    }

    checkCollide(unit) {
        // We don't care about non-deadly discs
        if (this.status !== DiscStates.DEADLY) return

        const collision = this.Collision(unit)

        /* If the disc has already collided with the current unit
           ignore, we don't want to hit them again until we've stopped colliding
           with them */
        if (unit === this.collided && collision) return

        /* If the disc is marked as being collided with this unit
           but it isn't collided any more, unmark it. */
        if (unit === this.collided && !collision) this.collided = null

        /* If this disc has collided with this unit
           then mark the disc as being collided with this unit */
        if (collision) this.collided = unit

        if (collision) {
            const isDead = unit.Hit(this.strength)
            this.owner.Regenerate()
            if (! isDead) this.Return()

            dispatchEvent(new CustomEvent('UnitHit', {
                detail: {
                    winner: this.owner,
                    loser: unit
                }
            }))
        }
    }

    Thrown(direction) {
        this.status = DiscStates.DEADLY

        const velocity = new Vector([0, 0])

        direction.Mul(this.baseSpeed + this.speedModifier)

        velocity.Add(direction)
        velocity.Limit(this.baseSpeed + this.speedModfier)
        this.velocity = velocity
    }

    Return() {
        this.status = DiscStates.RETURNING
        this.returnable = false

        this.velocity = new Vector([0, 0])

        const ownerForce = Vector.SubFactory(this.owner.location, this.location)
        ownerForce.Normalize()
        ownerForce.Mul(this.baseSpeed + this.speedModifier)

        this.velocity.Add(ownerForce)
        this.velocity.Limit(this.baseSpeed + this.speedModifier)

        this.location.Add(this.velocity)
    }

    BounceX() {
        this.velocity.points[0] *= -1
    }

    BounceY() {
        this.velocity.points[1] *= -1
    }
}
