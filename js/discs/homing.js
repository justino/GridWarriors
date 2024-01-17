import { Vector } from "../vector.js"
import { Disc, DiscStates } from "./disc.js"

export class HomingDisc extends Disc {
    constructor(unit) {
        super('Homing', config.homingDiscColor, unit)

        this.baseSpeed = config.homingDiscSpeed
        this.homing = false
    }

    Update() {
        switch (this.status) {
            case DiscStates.HELD:
                // Follow owner around
                this.location = Vector.Clone(this.owner.location)
                break
            case DiscStates.RETURNING:
                this.Return()
                break
            case DiscStates.DEADLY:
                if (this.homing) {
                    this.homeInOnPlayer()
                    break
                }
            case DiscStates.BOUNCING:
                // Basic Straight Lines
                this.location.Add(this.velocity)
                break
        }

        this.checkBounce()
    }

    Thrown(direction) {
        // After one second of regular movement, start homing
        setTimeout(this.startHoming.bind(this), 1000)
        super.Thrown(direction)
    }

    Return() {
        this.homing = false
        super.Return()
    }

    startHoming() {
        this.homing = true
    }

    homeInOnPlayer() {
        this.velocity = new Vector([0, 0])

        const playerForce = Vector.SubFactory(this.gameGrid.player.location, this.location)
        playerForce.Normalize()
        playerForce.Mul(this.baseSpeed + this.speedModifier)

        this.velocity.Add(playerForce)
        this.velocity.Limit(this.baseSpeed + this.speedModifier)

        this.location.Add(this.velocity)
    }
}
