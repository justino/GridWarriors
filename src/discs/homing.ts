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

    protected enterState(state: DiscStates) {
        super.enterState(state)

        // After one second of regular movement, start homing
        if (state === DiscStates.DEADLY) this.homingTimer = setTimeout(this.startHoming.bind(this), 1000)
    }

    protected exitState(state: DiscStates) {
        super.exitState(state)

        // Homing only happens while deadly, so a bounce, deflect, hit or recall all stop it
        if (state === DiscStates.DEADLY) this.stopHoming()
    }

    // DEADLY: straight lines until homing kicks in
    moveDeadly() {
        if (! this.homing) {
            super.moveDeadly()
            return
        }

        this.homeInOnPlayer()
        this.checkBounce()
    }

    startHoming() {
        this.homing = true
    }

    stopHoming() {
        // Cancel any pending homing, so it can't carry over to a later throw
        if (this.homingTimer) {
            clearTimeout(this.homingTimer)
            this.homingTimer = null
        }

        this.homing = false
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
