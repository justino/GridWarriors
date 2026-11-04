import { config } from "@/config"

import { Sprite } from "@/sprite"
import { Vector } from "@/vector"
import { DiscStates } from "@/discs/disc"
import { GameGrid } from "@/gamegrid"
import { Disc } from "@/discs/disc"
import { Door } from "@/door"

export enum UnitFacings {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UPLEFT,
    UPRIGHT,
    DOWNLEFT,
    DOWNRIGHT
}

// Direction for each facing, each axis is -1, 0 or 1 (normalize before use)
const FacingDirections: Record<UnitFacings, [number, number]> = {
    [UnitFacings.UP]:        [ 0, -1],
    [UnitFacings.DOWN]:      [ 0,  1],
    [UnitFacings.LEFT]:      [-1,  0],
    [UnitFacings.RIGHT]:     [ 1,  0],
    [UnitFacings.UPLEFT]:    [-1, -1],
    [UnitFacings.UPRIGHT]:   [ 1, -1],
    [UnitFacings.DOWNLEFT]:  [-1,  1],
    [UnitFacings.DOWNRIGHT]: [ 1,  1]
}

export class Unit extends Sprite {
    public isPlayer: boolean
    protected canBlock: boolean
    protected regenerates: boolean
    protected getsTired: boolean
    protected baseSpeed: number
    protected speedModifier: number
    protected throwFrequencyModifier: number
    protected recoveryRate: number
    protected maxHits: number
    protected baseAccuracy: number
    protected accuracyModifier: number
    public points: number

    private regenerateTimer: number | null
    private hits: number
    private restTicks: number
    public isBlocking: boolean
    public isTeleporting: boolean
    private teleportDoor: Door | null
    private facing: UnitFacings
    public disc: Disc | null
    private destination: Vector | null

    constructor(gameGrid: GameGrid, name: string, color: string, location: Vector) {
        super(gameGrid, name, config.unitSize, config.unitSize, color, location)

        this.isPlayer = false
        this.canBlock = false
        this.regenerates = false
        this.getsTired = false
        this.baseSpeed = 1
        this.speedModifier = 1
        this.throwFrequencyModifier = 0
        this.recoveryRate = 4
        this.maxHits = 1
        this.baseAccuracy = config.warriorAccuracy
        this.accuracyModifier = 0
        this.points = 100

        // Stateful
        this.regenerateTimer = null
        this.hits = 0
        this.restTicks = 0
        this.isBlocking = false
        this.isTeleporting = false
        this.teleportDoor = null
        this.facing = UnitFacings.DOWN
        this.disc = null
        this.destination = null
    }

    draw() {
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

        if (this.restTicks > 0) {
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

    blocking() {

    }

    setDestination() {
        // Pick a random location on the grid that is at least ${config.minimumDistance} away.
        // This prevents odd jumpy behavior when the locations are too close.
        // Most of the grid is far enough away, so this rarely takes more than a couple of tries.
        do {
            this.destination = Vector.random2D(this.gameGrid.canvas.width, this.gameGrid.canvas.height)
        } while (this.location.distance(this.destination) < config.minimumDistance)

        const destinationForce = Vector.subFactory(this.destination, this.location)
        destinationForce.normalize()
        destinationForce.mul(this.baseSpeed * this.speedModifier)

        this.velocity = destinationForce

        this.setFacing(this.findFacing(this.velocity))
    }

    facingDirection() {
        return new Vector([...FacingDirections[this.facing]])
    }

    findFacing(vector: Vector) {
        // Facings in 45 degree steps, counter-clockwise starting from 0 degrees (right)
        const facings = [
            UnitFacings.RIGHT,
            UnitFacings.UPRIGHT,
            UnitFacings.UP,
            UnitFacings.UPLEFT,
            UnitFacings.LEFT,
            UnitFacings.DOWNLEFT,
            UnitFacings.DOWN,
            UnitFacings.DOWNRIGHT
        ]

        // Each facing covers 22.5 degrees either side of its direction
        return facings[Math.round(vector.angle() / 45) % facings.length]
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
