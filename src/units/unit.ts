import { config } from "@/config"

import { Sprite } from "@/sprite"
import { Vector } from "@/vector"
import { DiscStates } from "@/discs/disc"
import { GameGrid } from "@/gamegrid"
import { Disc } from "@/discs/disc"
import { Door } from "@/door"
import { msToTicks } from "@/time"

export enum UnitFacings {
    NORTH,
    SOUTH,
    WEST,
    EAST,
    NORTHWEST,
    NORTHEAST,
    SOUTHWEST,
    SOUTHEAST
}

// What a unit is doing, a unit is only ever in one of these
export enum UnitStates {
    MOVING,
    RESTING,
    DEFLECTING
}

// Which states a unit can change to from each state. Anything not listed isn't allowed,
// e.g. a resting unit can't start deflecting, and a deflecting unit can't start resting
const UnitTransitions: Record<UnitStates, UnitStates[]> = {
    [UnitStates.MOVING]:     [UnitStates.RESTING, UnitStates.DEFLECTING],
    [UnitStates.RESTING]:    [UnitStates.MOVING],
    [UnitStates.DEFLECTING]: [UnitStates.MOVING]
}

// Direction for each facing, each axis is -1, 0 or 1 (normalize before use)
const FacingDirections: Record<UnitFacings, [number, number]> = {
    [UnitFacings.NORTH]:     [ 0, -1],
    [UnitFacings.SOUTH]:     [ 0,  1],
    [UnitFacings.WEST]:      [-1,  0],
    [UnitFacings.EAST]:      [ 1,  0],
    [UnitFacings.NORTHWEST]: [-1, -1],
    [UnitFacings.NORTHEAST]: [ 1, -1],
    [UnitFacings.SOUTHWEST]: [-1,  1],
    [UnitFacings.SOUTHEAST]: [ 1,  1]
}

// The deflect arc extends this far either side of the unit's facing
const DeflectArcHalfAngle = config.deflectArcAngle / 2

// Facings in 45 degree steps, counter-clockwise starting from 0 degrees (east)
const FacingOrder: UnitFacings[] = [
    UnitFacings.EAST,
    UnitFacings.NORTHEAST,
    UnitFacings.NORTH,
    UnitFacings.NORTHWEST,
    UnitFacings.WEST,
    UnitFacings.SOUTHWEST,
    UnitFacings.SOUTH,
    UnitFacings.SOUTHEAST
]

export class Unit extends Sprite {
    public isPlayer: boolean
    protected regenerates: boolean
    protected getsTired: boolean
    protected baseSpeed: number
    protected speedModifier: number
    protected throwFrequencyModifier: number
    protected recoveryRate: number
    protected maxHits: number
    protected baseAccuracy: number
    protected accuracyModifier: number
    protected useDoorChance: number
    protected deflectChance: number
    public points: number

    private hits: number
    private state: UnitStates
    private ticksInState: number // Game updates since we entered the current state
    private restLength: number // Only used while RESTING, how many updates to rest for
    private throwTicks: number | null // Updates until our next throw, null when none is scheduled
    private deflectRolled: boolean // Already rolled to deflect the disc that's in our zone
    public isTeleporting: boolean
    private teleportDoor: Door | null
    private facing: UnitFacings
    public disc: Disc | null
    private destination: Vector | null

    constructor(gameGrid: GameGrid, name: string, color: string, location: Vector) {
        super(gameGrid, name, config.unitSize, config.unitSize, color, location)

        this.isPlayer = false
        this.regenerates = false
        this.getsTired = false
        this.baseSpeed = 1
        this.speedModifier = 1
        this.throwFrequencyModifier = 0
        this.recoveryRate = 4
        this.maxHits = 1
        this.baseAccuracy = config.warriorAccuracy
        this.accuracyModifier = 0
        this.useDoorChance = 0
        this.deflectChance = 0
        this.points = 100

        // Stateful
        this.hits = 0
        this.state = UnitStates.MOVING
        this.ticksInState = 0
        this.restLength = 0
        this.throwTicks = null
        this.deflectRolled = false
        this.isTeleporting = false
        this.teleportDoor = null
        this.facing = UnitFacings.SOUTH
        this.disc = null
        this.destination = null
    }

    draw() {
        if (this.isDeflecting) this.drawDeflectArc()

        this.drawSprite()

        // Draw units disc too
        if (this.disc) {
            this.disc.draw()
        }
    }

    update() {
        // Did we catch our own disc
        if (this.disc) this.catchDisc()

        // If we don't have a velocity set, do it now
        if (!this.velocity) this.setDestination()

        this.deflecting()

        this.ticksInState++
        switch (this.state) {
            case UnitStates.MOVING:
                this.move()
                break
            case UnitStates.RESTING:
                this.rest()
                break
            case UnitStates.DEFLECTING:
                this.faceDisc()
                break
        }

        // Maintain Disc
        if (this.disc) {
            this.updateDiscStatus()
            this.disc.update()
        }

        this.resolveTeleportation()
    }

    get isDeflecting() {
        return this.state === UnitStates.DEFLECTING
    }

    // The only way to change state. Returns whether the state changed,
    // it won't if the change isn't allowed from the current state.
    changeState(state: UnitStates) {
        if (! UnitTransitions[this.state].includes(state)) return false

        this.exitState(this.state)
        this.state = state
        this.ticksInState = 0
        this.enterState(state)

        return true
    }

    protected enterState(state: UnitStates) {
        switch (state) {
            case UnitStates.RESTING:
                this.restLength = this.restDuration()
                break
        }
    }

    protected exitState(state: UnitStates) {
        switch (state) {
            case UnitStates.DEFLECTING:
                // Face where we're heading again
                this.setFacing(this.findFacing(this.velocity))
                break
        }
    }

    // MOVING: head towards our destination
    move() {
        this.updateLocation()

        // Are we at our destination
        if (this.destination && this.touchLocation(this.destination)) {
            // console.log(`Unit: ${this.name} got to destination, setting new destination`)
            this.setDestination()
            this.maybeRest()
        }

        // Make sure Unit stays on the grid
        const walls = this.bindToGameGrid()
        if (walls.length > 0) {
            // Hit an edge, make a new destination
            // console.log(`Unit: ${this.name} hit an edge, setting new destination`)
            this.setDestination()
            this.maybeRest()
        }
    }

    // RESTING: stand still until rested
    rest() {
        if (this.ticksInState >= this.restLength) this.changeState(UnitStates.MOVING)
    }

    // DEFLECTING: stand still, keeping the deflect arc pointed at the player's disc
    faceDisc() {
        const playerDisc = this.gameGrid.player?.disc
        if (playerDisc) this.setFacing(this.findFacing(Vector.subFactory(playerDisc.location, this.location)))
    }

    maybeRest() {
        if (! this.getsTired) return
        if (Math.random() * 100 >= config.tiredChance) return

        this.changeState(UnitStates.RESTING)
    }

    // A random time to rest, in game updates
    restDuration() {
        return msToTicks(config.tiredMinTime + Math.random() * (config.tiredMaxTime - config.tiredMinTime))
    }

    teleportTo(door: Door) {
        if (this.isTeleporting) return

        this.isTeleporting = true
        this.teleportDoor = door
        this.location = Vector.clone(door.spawnLocation)
        this.setDestination()
    }

    updateLocation() {
        this.location.add(this.velocity)
    }

    updateDiscStatus() {
        if (! this.disc) return
        if (! this.gameGrid.player) return

        // Disc is out, schedule the next throw once we have it back
        if (this.disc.status !== DiscStates.HELD) {
            this.throwTicks = null
            return
        }

        if (this.throwTicks === null) {
            this.throwTicks = this.throwDelay()
            return
        }

        this.throwTicks--
        if (this.throwTicks > 0) return

        // Can't throw while deflecting, wait a new delay instead
        if (this.isDeflecting) {
            this.throwTicks = this.throwDelay()
            return
        }

        this.throwDisc()
    }

    // A random time until our next throw, in game updates. Further from the player waits a little longer.
    throwDelay() {
        if (! this.gameGrid.player) return 0

        const distance = this.location.distance(this.gameGrid.player.location)
        const modifier = distance / this.gameGrid.diagonal
        const seconds = Math.ceil(Math.floor(Math.random() * 6 + 1) + modifier) + this.throwFrequencyModifier

        return msToTicks(seconds * 1000)
    }

    throwDisc() {
        if (! this.gameGrid.player) return
        if (! this.disc) return

        // Aim at player
        const aimFor = Vector.clone(this.gameGrid.player.location)

        // Apply Accuracy
        aimFor.points[0] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier)
        aimFor.points[1] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier)

        const direction = Vector.subFactory(aimFor, this.disc.location)
        direction.normalize()

        this.disc.thrown(direction)
    }

    catchDisc() {
        if (! this.disc) return

        if (this.disc.status === DiscStates.RETURNING && this.isCollidedWith(this.disc)) {
            //console.log('Unit: ' + this.name + ' caught disc')
            this.disc.caught()
        }
    }

    // When a deadly player disc enters the zone around this unit, roll once to see if it deflects.
    // If it does, it stands still facing the disc until the disc leaves the zone.
    deflecting() {
        const playerDisc = this.gameGrid.player?.disc
        const zoneRadius = config.deflectArcRadius * config.deflectZoneMultiplier
        const inZone = playerDisc ? this.location.distance(playerDisc.location) <= zoneRadius : false

        if (! inZone) {
            // Disc left (or isn't in) the zone, stop deflecting and reset for the next time it comes in
            this.deflectRolled = false
            if (this.state === UnitStates.DEFLECTING) this.changeState(UnitStates.MOVING)
            return
        }

        if (this.deflectRolled) return
        if (playerDisc?.status !== DiscStates.DEADLY) return

        // Can't deflect without a disc in hand, and only MOVING units can start deflecting,
        // so don't roll until then, that way catching our disc or waking up
        // while the player's disc is in the zone still gets its chance
        if (this.disc?.status !== DiscStates.HELD) return
        if (this.state !== UnitStates.MOVING) return

        this.deflectRolled = true
        if (Math.random() * 100 < this.deflectChance) this.changeState(UnitStates.DEFLECTING)
    }

    setDestination() {
        this.destination = this.doorDestination() ?? this.randomDestination()

        const destinationForce = Vector.subFactory(this.destination, this.location)
        destinationForce.normalize()
        destinationForce.mul(this.baseSpeed * this.speedModifier)

        this.velocity = destinationForce

        this.setFacing(this.findFacing(this.velocity))
    }

    randomDestination() {
        // Pick a random location on the grid that is at least ${config.minimumDistance} away.
        // This prevents odd jumpy behavior when the locations are too close.
        // Most of the grid is far enough away, so this rarely takes more than a couple of tries.
        let destination: Vector
        do {
            destination = Vector.random2D(this.gameGrid.canvas.width, this.gameGrid.canvas.height)
        } while (this.location.distance(destination) < config.minimumDistance)

        return destination
    }

    doorDestination() {
        if (Math.random() * 100 >= this.useDoorChance) return null

        const doors = this.gameGrid.teleportDoors()
        if (doors.length === 0) return null

        return this.chooseDoor(doors)?.spawnLocation ?? null
    }

    chooseDoor(doors: Door[]): Door | null {
        return doors[Math.floor(Math.random() * doors.length)]
    }

    facingDirection() {
        return new Vector([...FacingDirections[this.facing]])
    }

    findFacing(vector: Vector) {
        // Each facing covers 22.5 degrees either side of its direction
        return FacingOrder[Math.round(vector.angle() / 45) % FacingOrder.length]
    }

    facingAngle() {
        return FacingOrder.indexOf(this.facing) * 45
    }

    // Is a location (padded by the size of whatever is there) inside this unit's deflect arc
    inDeflectArc(location: Vector, padding: number) {
        if (! this.isDeflecting) return false

        const offset = Vector.subFactory(location, this.location)
        if (offset.magnitude() > config.deflectArcRadius + padding) return false

        // Difference between the two angles, wrapped to -180..180
        const angleFromFacing = ((offset.angle() - this.facingAngle()) + 540) % 360 - 180
        return Math.abs(angleFromFacing) <= DeflectArcHalfAngle
    }

    drawDeflectArc() {
        // Canvas angles run clockwise, ours run counter-clockwise, so flip the sign
        const start = -(this.facingAngle() + DeflectArcHalfAngle) * Math.PI / 180
        const end = -(this.facingAngle() - DeflectArcHalfAngle) * Math.PI / 180

        const context = this.gameGrid.context
        context.fillStyle = config.deflectArcColor
        context.beginPath()
        context.moveTo(...this.location.points)
        context.arc(...this.location.points, config.deflectArcRadius, start, end)
        context.closePath()
        context.fill()
    }

    setFacing(facing: UnitFacings) {
        if (this.facing !== facing) {
            this.facing = facing
            // console.log(`${this.name} - Facing: ${this.facing.toString()}`)
        }
    }

    hit(strength: number) {
        this.hits += strength || 1
        console.log(`${this.name} hit. ${this.maxHits - this.hits} left`)

        const dead = this.isDead()
        if (! dead) {
            // Getting hit wakes a tired unit up
            if (this.state === UnitStates.RESTING) this.changeState(UnitStates.MOVING)
            this.speedModifier = 1 / (this.hits + 1)
            this.setDestination()
        }

        return dead
    }

    regenerate() {
        if (!this.regenerates) return

        if (this.hits > 0) {
            this.hits -= 1
            this.speedModifier = (0.5 * this.hits) || 1
            this.setDestination()

            console.log(`${this.name} regenerated 1 HP`)
        }
    }

    isDead() {
        return this.hits >= this.maxHits
    }

    resolveTeleportation() {
        if (this.isTeleporting && this.teleportDoor) {
            if (! this.teleportDoor.isCollided(this)) {
                this.isTeleporting = false
                this.teleportDoor = null
            }
        }
    }
}
