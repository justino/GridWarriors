import { config } from "@/config"

import { Sprite } from "@/sprite"
import { Vector } from "@/vector"
import { Unit } from "@/units/unit"
import { msToTicks } from "@/time"

export enum DiscStates {
    HELD,
    DEADLY,
    BOUNCING,
    RETURNING
}

// Which states a disc can change to from each state. Anything not listed isn't allowed,
// e.g. a disc can only be thrown while held, and only caught while returning.
// BOUNCING -> BOUNCING restarts the bounce (being deflected again resets its trip home)
const DiscTransitions: Record<DiscStates, DiscStates[]> = {
    [DiscStates.HELD]:      [DiscStates.DEADLY],
    [DiscStates.DEADLY]:    [DiscStates.BOUNCING, DiscStates.RETURNING],
    [DiscStates.BOUNCING]:  [DiscStates.BOUNCING, DiscStates.RETURNING],
    [DiscStates.RETURNING]: [DiscStates.BOUNCING, DiscStates.HELD]
}

export class Disc extends Sprite {
    private discSize: number
    protected owner: Unit
    public strength: number
    protected speedModifier: number
    protected baseSpeed: number
    protected piercing: boolean // Piercing discs pass straight through a deflect arc
    public unjams: boolean

    private state: DiscStates
    protected ticksInState: number // Game updates since we entered the current state
    private collided: Unit | null
    private bounceLength: number // How many game updates until returns

    constructor(name: string, color: string, unit: Unit) {
        const discSize = config.unitSize / 4
        super(unit.gameGrid, name, discSize, discSize, color, unit.location)

        this.discSize = discSize
        this.owner = unit
        this.strength = 1
        this.speedModifier = 0

        this.baseSpeed = 0
        this.piercing = false
        this.unjams = false

        // Stateful
        this.state = DiscStates.HELD
        this.ticksInState = 0
        this.collided = null
        this.bounceLength = 0
    }

    get status() {
        return this.state
    }

    // The only way to change state. Returns whether the state changed,
    // it won't if the change isn't allowed from the current state.
    protected changeState(state: DiscStates) {
        if (! DiscTransitions[this.state].includes(state)) return false

        this.state = state
        this.ticksInState = 0
        this.enterState(state)

        return true
    }

    protected enterState(state: DiscStates) {
        switch (state) {
            case DiscStates.DEADLY:
                this.collided = null
                break
            case DiscStates.RETURNING:
                this.moveToOwner()
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

    // DEADLY, BOUNCING or RETURNING -> BOUNCING, heads back to its owner after returnTime milliseconds
    startBouncing(returnTime: number) {
        if (! this.changeState(DiscStates.BOUNCING)) return

        this.bounceLength = msToTicks(returnTime)
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
        this.ticksInState++
        switch (this.state) {
            case DiscStates.HELD:
                this.followOwner()
                break
            case DiscStates.DEADLY:
                this.moveDeadly()
                break
            case DiscStates.BOUNCING:
                this.bounce()
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

    // BOUNCING: straight lines until it's time to head home
    bounce() {
        if (this.ticksInState >= this.bounceLength) {
            this.return()
            return
        }

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

        for (const wall of walls) this.bounceOff(wall)

        if (this.state === DiscStates.DEADLY) this.startBouncing(config.discReturnTime)
    }

    // Bounce off a surface that faces in the direction of normal (normal must be normalized)
    // Returns false if the disc is already heading away from it
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

    // Bounce off a unit's deflect arc, any disc in flight can be deflected.
    // Returns whether the disc was deflected.
    checkDeflect(unit: Unit) {
        if (this.state === DiscStates.HELD) return false
        if (this.piercing) return false
        if (unit === this.owner) return false
        if (! unit.inDeflectArc(this.location, this.discSize / 2)) return false

        return this.deflected(unit)
    }

    // Deflect off the unit, or hit it if we're deadly
    checkCollide(unit: Unit) {
        // A deflecting unit's arc reaches out past the unit, so it gets hit first
        if (this.checkDeflect(unit)) return

        // Only deadly discs hit units, and a disc with no strength can't hurt anyone
        if (this.state !== DiscStates.DEADLY) return
        if (this.strength === 0) return

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
