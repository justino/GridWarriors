import { config } from "@/config"

import { Sprite } from "@/sprite"
import { Vector } from "@/vector"
import { DiscStates } from "@/discs/disc"
import { GameGrid } from "@/gamegrid"
import { Disc } from "@/discs/disc"
import { Door } from "@/door"

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
    protected canDeflect: boolean
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

    private regenerateTimer: number | null
    private hits: number
    private restTicks: number
    public isDeflecting: boolean
    private willDeflect: boolean
    private deflectRolled: boolean
    public isTeleporting: boolean
    private teleportDoor: Door | null
    private facing: UnitFacings
    public disc: Disc | null
    private destination: Vector | null

    constructor(gameGrid: GameGrid, name: string, color: string, location: Vector) {
        super(gameGrid, name, config.unitSize, config.unitSize, color, location)

        this.isPlayer = false
        this.canDeflect = false
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
        this.regenerateTimer = null
        this.hits = 0
        this.restTicks = 0
        this.isDeflecting = false
        this.willDeflect = false
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

        if (this.isDeflecting) {
            // Stand still while deflecting, deflecting() keeps us facing the disc
        }
        else if (this.restTicks > 0) {
            // Tired, stand still for a while
            this.restTicks--
        }
        else {
            // Move Unit towards destination
            this.updateLocation()

            // Are we at our destination
            if (this.destination && this.touchLocation(this.destination)) {
                // console.log(`Unit: ${this.name} got to destination, setting new destination`)
                this.setDestination()
                this.maybeRest()
            }

            // Make sure Unit stays on the grid
            const hitEdge = this.bindToGameGrid()
            if (hitEdge[0] || hitEdge[1]) {
                // Hit an edge, make a new destination
                // console.log(`Unit: ${this.name} hit an edge, setting new destination`)
                this.setDestination()
                this.maybeRest()
            }
        }

        // Maintain Disc
        if (this.disc) {
            this.updateDiscStatus()
            this.disc.update()
        }

        this.resolveTeleportation()
    }

    maybeRest() {
        if (! this.getsTired) return
        if (this.isDeflecting) return // Too busy to rest
        if (Math.random() * 100 >= config.tiredChance) return

        // Rest for a random time, counted in game updates so it stops while paused
        const seconds = config.tiredMinTime + Math.random() * (config.tiredMaxTime - config.tiredMinTime)
        this.restTicks = Math.round(seconds * config.targetFps)
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

        if (this.disc.status === DiscStates.HELD && !this.disc.primed) {
            this.disc.primed = true

            const distance = this.location.distance(this.gameGrid.player.location)
            const modifier = distance / this.gameGrid.diagonal
            const time = Math.ceil(Math.floor(Math.random() * 6 + 1) + modifier) + this.throwFrequencyModifier

            window.setTimeout(this.throwDisc.bind(this), time * 1000)
        }
    }

    throwDisc() {
        if (! this.gameGrid.player) return
        if (! this.disc) return

        // Can't throw while deflecting, unprime so a new throw gets scheduled
        if (this.isDeflecting) {
            this.disc.primed = false
            return
        }

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
            this.disc.status = DiscStates.HELD
            this.disc.primed = false
            this.disc.returnable = false
        }
    }

    // When a deadly player disc enters the zone around this unit, roll once to see if it deflects.
    // If it does, it stands still facing the disc until the disc leaves the zone.
    deflecting() {
        const wasDeflecting = this.isDeflecting
        const playerDisc = this.gameGrid.player?.disc
        const zoneRadius = config.deflectArcRadius * config.deflectZoneMultiplier
        const inZone = playerDisc ? this.location.distance(playerDisc.location) <= zoneRadius : false

        // Can't deflect while resting or without a disc in hand
        const ableToDeflect = this.restTicks === 0 && this.disc?.status === DiscStates.HELD

        if (! inZone) {
            // Disc left (or isn't in) the zone, reset for the next time it comes in
            this.deflectRolled = false
            this.willDeflect = false
        }
        // Only roll once we're able to deflect, that way catching our disc or waking up
        // while the player's disc is in the zone still gets its chance
        else if (! this.deflectRolled && playerDisc?.status === DiscStates.DEADLY && ableToDeflect) {
            this.deflectRolled = true
            this.willDeflect = Math.random() * 100 < this.deflectChance
        }

        // Throwing our own disc mid-deflect ends it
        this.isDeflecting = this.willDeflect && ableToDeflect

        if (this.isDeflecting && playerDisc) {
            this.setFacing(this.findFacing(Vector.subFactory(playerDisc.location, this.location)))
        }
        else if (wasDeflecting) {
            // Done deflecting, face where we're heading again
            this.setFacing(this.findFacing(this.velocity))
        }
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
            this.restTicks = 0
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
