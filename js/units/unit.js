import { Sprite } from "../sprite.js"
import { Vector } from "../vector.js"
import { DiscStates } from "../discs/disc.js"

export class Unit extends Sprite {
    UP = Symbol("up")
    DOWN = Symbol("down")
    LEFT = Symbol("left")
    RIGHT = Symbol("right")

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

        this.direction = null

        this.isBlocking = false
    }

    Draw() {
        this.DrawSprite()

        // Draw units disc too
        if (this.disc) {
            this.disc.Draw()
        }
    }

    Update() {
        // Did we catch our own disc
        if (this.disc) this.CatchDisc()

        // If we don't have a velocity set, do it now
        if (!this.velocity) this.setDestination()

        // Move Unit towards destination
        this.UpdateLocation()

        // Are we at our destination
        if (this.TouchLocation(this.destination)) {
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
            this.UpdateDiscStatus()
            this.disc.Update()
        }
    }

    UpdateLocation() {
        this.location.Add(this.velocity)
    }

    UpdateDiscStatus() {
        if (this.disc.status === DiscStates.HELD && !this.disc.primed) {
            this.disc.primed = true

            const distance = this.location.Distance(this.gameGrid.player.location)
            const modifier = distance / this.gameGrid.diagonal
            const time = Math.ceil(Math.floor(Math.random() * 6 + 1) + modifier) + this.throwFrequencyModifier

            window.setTimeout(this.ThrowDisc.bind(this), time * 1000)
        }
    }

    ThrowDisc() {
        if (! this.gameGrid.player) return

        // Aim at player
        const aimFor = Vector.Clone(this.gameGrid.player.location)

        // Apply Accuracy (somewhere around the player)
        aimFor.points[0] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier)
        aimFor.points[1] += Math.floor(Math.random() * (100 - this.baseAccuracy + this.accuracyModifier) * 2) - (100 - this.baseAccuracy + this.accuracyModifier)

        const direction = Vector.SubFactory(aimFor, this.disc.location)
        direction.Normalize()

        this.disc.Thrown(direction)
    }

    CatchDisc() {
        if (this.disc.status === DiscStates.RETURNING && this.Collision(this.disc)) {
            //console.log('Unit: ' + this.name + ' caught disc')
            this.disc.status = DiscStates.HELD
            this.disc.primed = false
            this.disc.returnable = false
        }
    }

    Blocking() {

    }

    setDestination() {
        // Try to generate a new location on the grid that is at least ${config.minimumDistance}
        // away from itself. This prevents odd jumpy behavior when the locations are too close.
        // If we try 3 times, stop trying and go with it, don't want to get bogged down.
        let attempts = 0
        do {
            attempts++

            // Random location on game grid
            this.destination = Vector.Random2D(this.gameGrid.canvas.width, this.gameGrid.canvas.height)
        } while (this.location.Distance(this.destination) < config.minimumDistance || attempts <= 3)

        const destinationForce = Vector.SubFactory(this.destination, this.location)
        destinationForce.Normalize()
        destinationForce.Mul(this.baseSpeed * this.speedModifier)

        this.velocity = new Vector([0, 0])
        this.velocity.Add(destinationForce)
        this.velocity.Limit(this.baseSpeed * this.speedModifier)

        this.setDirection(this.findDirection(this.velocity))
    }

    findDirection(vector) {
        let direction = this.DOWN

        const angle = vector.Angle()

        if (angle <= 45 || angle > 315) {
            direction = this.RIGHT
        } else if (angle > 45 && angle <= 135) {
            direction = this.UP
        } else if (angle > 135 && angle <= 225) {
            direction = this.LEFT
        }

        return direction
    }

    setDirection(direction) {
        if (this.direction !== direction) {
            this.direction = direction
            // console.log(`${this.name} - ${this.direction.toString()}`)
        }
    }

    Hit(strength) {
        this.hits += strength || 1
        console.log(`${this.name} hit. ${this.maxHits - this.hits} left`)

        const dead = this.isDead()
        if (! dead) {
            this.speedModifier = 1 / (this.hits + 1)
            this.setDestination()
        }

        return dead
    }

    Regenerate() {
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
}
