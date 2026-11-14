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

// Which states a disc can change to from each state. Anything not listed isn't allowed,
// e.g. a disc can only be thrown while held, and only caught while returning
const DiscTransitions: Record<DiscStates, DiscStates[]> = {
    [DiscStates.HELD]:      [DiscStates.DEADLY],
    [DiscStates.DEADLY]:    [DiscStates.BOUNCING, DiscStates.RETURNING],
    [DiscStates.BOUNCING]:  [DiscStates.RETURNING],
    [DiscStates.RETURNING]: [DiscStates.HELD]
}

export class Disc extends Sprite {
    private discSize: number
    protected owner: Unit
    protected strength: number
    protected speedModifier: number
    protected baseSpeed: number
    protected piercing: boolean // Piercing discs pass straight through a deflect arc

    private state: DiscStates
    public primed: boolean // Only used while HELD, the owner has scheduled a throw
    public returnable: boolean // Only used while DEADLY, the player can recall the disc
    private collided: Unit | null // Only used while DEADLY
    private returnTimer: ReturnType<typeof setTimeout> | null // Only used while BOUNCING

    constructor(name: string, color: string, unit: Unit) {
        const discSize = config.unitSize / 4
        super(unit.gameGrid, name, discSize, discSize, color, unit.location)

        this.discSize = discSize
        this.owner = unit
        this.strength = 1
        this.speedModifier = 0

        this.baseSpeed = 0
        this.piercing = false

        // Stateful
        this.state = DiscStates.HELD
        this.primed = false
        this.returnable = false
        this.collided = null
        this.returnTimer = null
    }

    get status() {
        return this.state
    }

    // The only way to change state. Returns whether the state changed,
    // it won't if the change isn't allowed from the current state.
    protected changeState(state: DiscStates) {
        if (! DiscTransitions[this.state].includes(state)) return false

        this.exitState(this.state)
        this.state = state
        this.enterState(state)

        return true
    }

    protected enterState(state: DiscStates) {
        switch (state) {
            case DiscStates.HELD:
                this.primed = false
                break
            case DiscStates.DEADLY:
                this.returnable = false
                this.collided = null
                break
            case DiscStates.RETURNING:
                this.moveToOwner()
                break
        }
    }

    protected exitState(state: DiscStates) {
        switch (state) {
            case DiscStates.BOUNCING:
                // Cancel the pending return, so it can't fire on a later throw
                if (this.returnTimer) {
                    clearTimeout(this.returnTimer)
                    this.returnTimer = null
                }
                break
        }
    }

    // HELD -> DEADLY
    thrown(direction: Vector) {
        if (! this.changeState(DiscStates.DEADLY)) return

        // Normalize so diagonal throws aren't faster, then scale to speed
        const velocity = Vector.clone(direction)
        velocity.normalize()
        velocity.mul(this.baseSpeed + this.speedModifier)

        this.velocity = velocity
    }

    // DEADLY -> BOUNCING, heads back to its owner after returnTime
    startBouncing(returnTime: number) {
        if (! this.changeState(DiscStates.BOUNCING)) return

        this.returnTimer = setTimeout(this.return.bind(this), returnTime)
    }

    // DEADLY or BOUNCING -> RETURNING
    return() {
        this.changeState(DiscStates.RETURNING)
    }

    // RETURNING -> HELD
    caught() {
        this.changeState(DiscStates.HELD)
    }

    update() {
        switch (this.state) {
            case DiscStates.HELD:
                this.followOwner()
                break
            case DiscStates.DEADLY:
                this.moveDeadly()
                break
            case DiscStates.BOUNCING:
                this.moveStraight()
                break
            case DiscStates.RETURNING:
                this.moveToOwner()
                break
        }
    }

    // HELD: follow owner around
    followOwner() {
        this.location = Vector.clone(this.owner.location)
    }

    // DEADLY: straight lines, discs with special movement override this
    moveDeadly() {
        this.moveStraight()
    }

    // Basic straight lines, bouncing off the walls
    moveStraight() {
        this.location.add(this.velocity)
        this.checkBounce()
    }

    // RETURNING: head back to the owner
    moveToOwner() {
        const ownerForce = Vector.subFactory(this.owner.location, this.location)
        ownerForce.normalize()
        ownerForce.mul(this.baseSpeed + this.speedModifier)

        this.velocity = ownerForce
        this.location.add(this.velocity)
    }

    checkBounce() {
        const walls = this.bindToGameGrid()
        if (walls.length === 0) return

        // A corner is two walls, bounce off each
        for (const wall of walls) this.bounceOff(wall)

        // The first wall hit starts the trip home, does nothing if already bouncing
        this.startBouncing(config.discReturnTime)
    }

    // Bounce off a surface that faces in the direction of normal (normal must be normalized)
    // Returns false if the disc is already heading away from it, so it's left alone
    bounceOff(normal: Vector) {
        if (this.velocity.dot(normal) >= 0) return false

        this.velocity.reflect(normal)
        return true
    }

    // Hit a deflecting unit's arc, bounce off it like a curved wall centered on the unit
    // Returns false if the disc is already heading away from the unit, so it's left alone
    deflected(unit: Unit) {
        // The arc's surface faces straight out from the unit at the point the disc hits it
        const normal = Vector.subFactory(this.location, unit.location)
        normal.normalize()

        if (! this.bounceOff(normal)) return false

        this.startBouncing(config.discReturnTime * config.discDeflectedReturnMultiplier)
        return true
    }

    draw() {
        switch (this.state) {
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
        if (this.state !== DiscStates.DEADLY) return

        // A deflecting unit's arc reaches out past the unit, so it gets hit first
        if (! this.piercing && unit.inDeflectArc(this.location, this.discSize / 2) && this.deflected(unit)) return

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
}
