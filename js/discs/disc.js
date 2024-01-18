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

    update() {
        switch (this.status) {
            case DiscStates.HELD:
                // Follow owner around
                this.location = Vector.clone(this.owner.location)
                break
            case DiscStates.RETURNING:
                this.return()
                break
            case DiscStates.DEADLY:
            case DiscStates.BOUNCING:
                // Basic Straight Lines
                this.location.add(this.velocity)
                this.checkBounce()
                break
        }
    }

    checkBounce() {
        const bounced = this.bindToGameGrid()
        if (bounced[0] || bounced[1]) {
            if (bounced[0]) this.bounceX()
            if (bounced[1]) this.bounceY()

            if (this.status !== DiscStates.BOUNCING) {
                this.status = DiscStates.BOUNCING
                setTimeout(this.return.bind(this), config.discReturnTime)
            }
        }
    }

    draw() {
        switch (this.status) {
            case DiscStates.HELD:
            case DiscStates.BOUNCING:
            case DiscStates.RETURNING:
                // Square
                if (this.height !== this.discSize) this.changeHeight(this.discSize)
                this.drawSprite()
                break
            case DiscStates.DEADLY:
                // Flat
                if (this.height !== this.discSize / 2) this.changeHeight(this.discSize / 2)
                this.drawSprite()
                break
        }
    }

    checkCollide(unit) {
        // We don't care about non-deadly discs
        if (this.status !== DiscStates.DEADLY) return

        const collision = this.collision(unit)

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
            const isDead = unit.hit(this.strength)
            this.owner.regenerate()
            if (! isDead) this.return()

            dispatchEvent(new CustomEvent('UnitHit', {
                detail: {
                    winner: this.owner,
                    loser: unit
                }
            }))
        }
    }

    thrown(direction) {
        this.status = DiscStates.DEADLY

        const velocity = new Vector([0, 0])

        direction.mul(this.baseSpeed + this.speedModifier)

        velocity.add(direction)
        velocity.limit(this.baseSpeed + this.speedModfier)
        this.velocity = velocity
    }

    return() {
        this.status = DiscStates.RETURNING
        this.returnable = false

        this.velocity = new Vector([0, 0])

        const ownerForce = Vector.subFactory(this.owner.location, this.location)
        ownerForce.normalize()
        ownerForce.mul(this.baseSpeed + this.speedModifier)

        this.velocity.add(ownerForce)
        this.velocity.limit(this.baseSpeed + this.speedModifier)

        this.location.add(this.velocity)
    }

    bounceX() {
        this.velocity.points[0] *= -1
    }

    bounceY() {
        this.velocity.points[1] *= -1
    }
}
