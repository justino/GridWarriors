import { config } from "@/config"

import { Vector } from "@/vector"
import { Disc, DiscStates } from "@/discs/disc"
import { Unit } from "@/units/unit"

export class HomingDisc extends Disc {
    private homing: boolean
    private homingTimer: ReturnType<typeof setTimeout> | null

    constructor(unit: Unit) {
        super('Homing', config.homingDiscColor, unit)

        this.baseSpeed = config.homingDiscSpeed
        this.homing = false
        this.homingTimer = null
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

    thrown(direction: Vector) {
        // After one second of regular movement, start homing
        this.homingTimer = setTimeout(this.startHoming.bind(this), 1000)
        super.thrown(direction)
    }

    return() {
        // Cancel any pending homing, so it can't carry over to a later throw
        if (this.homingTimer) {
            clearTimeout(this.homingTimer)
            this.homingTimer = null
        }

        this.homing = false
        super.return()
    }

    startHoming() {
        this.homing = true
    }

    homeInOnPlayer() {
        if (! this.gameGrid.player) return

        const playerForce = Vector.subFactory(this.gameGrid.player.location, this.location)
        playerForce.normalize()
        playerForce.mul(this.baseSpeed + this.speedModifier)

        this.velocity = playerForce
        this.location.add(this.velocity)
    }
}
