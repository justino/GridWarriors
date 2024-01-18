import { Vector } from "../vector.js"
import { Disc, DiscStates } from "./disc.js"

export class HomingDisc extends Disc {
    constructor(unit) {
        super('Homing', config.homingDiscColor, unit)

        this.baseSpeed = config.homingDiscSpeed
        this.homing = false
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
                if (this.homing) {
                    this.homeInOnPlayer()
                    this.checkBounce()
                    break
                }
            case DiscStates.BOUNCING:
                // Basic Straight Lines
                this.location.add(this.velocity)
                this.checkBounce()
                break
        }
    }

    thrown(direction) {
        // After one second of regular movement, start homing
        setTimeout(this.startHoming.bind(this), 1000)
        super.thrown(direction)
    }

    return() {
        this.homing = false
        super.return()
    }

    startHoming() {
        this.homing = true
    }

    homeInOnPlayer() {
        this.velocity = new Vector([0, 0])

        const playerForce = Vector.subFactory(this.gameGrid.player.location, this.location)
        playerForce.normalize()
        playerForce.mul(this.baseSpeed + this.speedModifier)

        this.velocity.add(playerForce)
        this.velocity.limit(this.baseSpeed + this.speedModifier)

        this.location.add(this.velocity)
    }
}
