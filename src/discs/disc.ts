import { config } from "@/config"

import { Sprite } from "@/sprite"
import { Vector } from "@/vector"
import { Unit } from "@/units/unit"

export enum DiscStates {
    HELD,
    DEADLY,
    BOUNCING,
    RETURNING
}

export class Disc extends Sprite {
    private discSize: number
    protected owner: Unit
    protected strength: number
    protected speedModifier: number
    protected baseSpeed: number

    public status: DiscStates
    public returnable: boolean
    public primed: boolean
    private collided: Unit | null
    private returnTimer: ReturnType<typeof setTimeout> | null

    constructor(name: string, color: string, unit: Unit) {
        const discSize = config.unitSize / 4
        super(unit.gameGrid, name, discSize, discSize, color, unit.location)

        this.discSize = discSize
        this.owner = unit
        this.strength = 1
        this.speedModifier = 0

        this.baseSpeed = 0

        // Stateful
        this.status = DiscStates.HELD
        this.returnable = false
        this.primed = false
        this.collided = null
        this.returnTimer = null
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

            if (this.status !== DiscStates.BOUNCING) this.startBouncing(config.discReturnTime)
        }
    }

    startBouncing(returnTime: number) {
        this.status = DiscStates.BOUNCING
        this.returnTimer = setTimeout(this.return.bind(this), returnTime)
    }

    // Hit a deflecting unit's arc, bounce off it like a curved wall centered on the unit
    // Returns false if the disc is already heading away from the unit, so it's left alone
    deflected(unit: Unit) {
        // The arc's surface faces straight out from the unit at the point the disc hits it
        const normal = Vector.subFactory(this.location, unit.location)
        normal.normalize()

        const towardsArc = this.velocity.dot(normal)
        if (towardsArc >= 0) return false

        // Reflect the velocity off the surface
        normal.mul(2 * towardsArc)
        this.velocity.sub(normal)

        this.startBouncing(config.discReturnTime * config.discDeflectedReturnMultiplier)
        return true
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

    checkCollide(unit: Unit) {
        // We don't care about non-deadly discs
        if (this.status !== DiscStates.DEADLY) return

        // A deflecting unit's arc reaches out past the unit, so it gets hit first
        if (unit.inDeflectArc(this.location, this.discSize / 2) && this.deflected(unit)) return

        const collision = this.isCollidedWith(unit)

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

    thrown(direction: Vector) {
        this.status = DiscStates.DEADLY

        // Normalize so diagonal throws aren't faster, then scale to speed
        const velocity = Vector.clone(direction)
        velocity.normalize()
        velocity.mul(this.baseSpeed + this.speedModifier)

        this.velocity = velocity
    }

    return() {
        // Cancel any pending bounce return, so it can't fire on a later throw
        if (this.returnTimer) {
            clearTimeout(this.returnTimer)
            this.returnTimer = null
        }

        this.status = DiscStates.RETURNING
        this.returnable = false

        const ownerForce = Vector.subFactory(this.owner.location, this.location)
        ownerForce.normalize()
        ownerForce.mul(this.baseSpeed + this.speedModifier)

        this.velocity = ownerForce
        this.location.add(this.velocity)
    }

    bounceX() {
        this.velocity.points[0] *= -1
    }

    bounceY() {
        this.velocity.points[1] *= -1
    }
}
