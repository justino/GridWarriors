import { Sprite } from "../sprite.js"
import { Vector } from "../vector.js"
import { DiscStates } from "../discs/disc.js"

export const UnitFacings = Object.freeze({
    UP:    Symbol("up"),
    DOWN:  Symbol("down"),
    LEFT:  Symbol("left"),
    RIGHT: Symbol("right")
})

export class Unit extends Sprite {
    constructor(gameGrid, name, color, location) {
        super(gameGrid, name, config.unitSize, config.unitSize, color, location)

        this.isPlayer = false
        this.canBlock = false
        this.regenerates = false

        this.baseSpeed = 1
        this.speedModifier = 1
        this.throwFrequencyModifier = 0
        this.recoveryRate = 4
        this.maxHits = 1
        this.hits = 0
        this.baseAccuracy = config.warriorAccuracy
        this.accuracyModifier = 0
        this.regenerateTimer = null
        this.points = 100

        // General direction unit is facing
        this.facing = null

        this.isBlocking = false

        this.isTeleporting = false
        this.teleportDoor = null
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

        // Move Unit towards destination
        this.updateLocation()

        // Are we at our destination
        if (this.touchLocation(this.destination)) {
            // console.log(`Unit: ${this.name} got to destination, setting new destination`)
            this.setDestination()
        }

        // Make sure Unit stays on the grid
        const hitEdge = this.bindToGameGrid()
        if (hitEdge[0] || hitEdge[1]) {
            // Hit an edge, make a new destination
            // console.log(`Unit: ${this.name} hit an edge, setting new destination`)
            this.setDestination()
        }

        // Maintain Disc
        if (this.disc) {
            this.updateDiscStatus()
            this.disc.update()
        }

        this.resolveTeleportation()
    }

    teleportTo(door) {
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
        if (this.disc.status === DiscStates.RETURNING && this.collision(this.disc)) {
            //console.log('Unit: ' + this.name + ' caught disc')
            this.disc.status = DiscStates.HELD
            this.disc.primed = false
            this.disc.returnable = false
        }
    }

    blocking() {

    }

    setDestination() {
        // Try to generate a new location on the grid that is at least ${config.minimumDistance}
        // away from itself. This prevents odd jumpy behavior when the locations are too close.
        // If we try 3 times, stop trying and go with it, don't want to get bogged down.
        let attempts = 0
        do {
            attempts++

            // Random location on game grid
            this.destination = Vector.random2D(this.gameGrid.canvas.width, this.gameGrid.canvas.height)
        } while (this.location.distance(this.destination) < config.minimumDistance || attempts <= 3)

        const destinationForce = Vector.subFactory(this.destination, this.location)
        destinationForce.normalize()
        destinationForce.mul(this.baseSpeed * this.speedModifier)

        this.velocity = new Vector([0, 0])
        this.velocity.add(destinationForce)
        this.velocity.limit(this.baseSpeed * this.speedModifier)

        this.setFacing(this.findFacing(this.velocity))
    }

    findFacing(vector) {
        let facing = UnitFacings.DOWN

        const angle = vector.angle()

        if (angle <= 45 || angle > 315) {
            facing = UnitFacings.RIGHT
        } else if (angle > 45 && angle <= 135) {
            facing = UnitFacings.UP
        } else if (angle > 135 && angle <= 225) {
            facing = UnitFacings.LEFT
        }

        return facing
    }

    setFacing(facing) {
        if (this.facing !== facing) {
            this.facing = facing
            // console.log(`${this.name} - Facing: ${this.facing.toString()}`)
        }
    }

    hit(strength) {
        this.hits += strength || 1
        console.log(`${this.name} hit. ${this.maxHits - this.hits} left`)

        const dead = this.isDead()
        if (! dead) {
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
        if (this.isTeleporting) {
            if (! this.teleportDoor.isCollided(this)) {
                this.isTeleporting = false
                this.teleportDoor = null
            }
        }
    }
}
