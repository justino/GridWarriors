import { config } from "@/config"

import { Vector } from "@/vector"
import { Disc, DiscStates } from "@/discs/disc"
import { Unit } from "@/units/unit"
import { msToTicks } from "@/time"

export class HomingDisc extends Disc {
    private homingDelay: number // Updates of straight flight after a throw before homing kicks in
    private blinkInterval: number // Updates between color swaps while deadly

    constructor(unit: Unit) {
        super('Homing', config.homingDiscColor, unit)

        this.baseSpeed = config.homingDiscSpeed
        this.homingDelay = msToTicks(config.homingDiscDelay)
        this.blinkInterval = Math.max(1, msToTicks(config.homingDiscBlinkInterval))
    }

    // Blinks between its color and the blink color while deadly, solid otherwise.
    // Counted in game updates, so it holds still while paused.
    draw() {
        const blinkOn = this.status === DiscStates.DEADLY
            && Math.floor(this.ticksInState / this.blinkInterval) % 2 === 1

        this.color = blinkOn ? config.homingDiscBlinkColor : config.homingDiscColor
        super.draw()
    }

    // DEADLY: straight lines until homing kicks in.
    // Homing only happens while deadly, so a bounce, deflect, hit or recall all end it.
    moveDeadly() {
        if (this.ticksInState < this.homingDelay) {
            super.moveDeadly()
            return
        }

        this.homeInOnPlayer()
        this.checkBounce()
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
