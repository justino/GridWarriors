import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { IntermediateDisc } from "@/discs/intermediate"
import { HomingDisc } from "@/discs/homing"

export class Leader extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Leader', config.leaderColor, location)

        this.baseSpeed = config.leaderSpeed
        this.throwFrequencyModifier = -2
        this.baseAccuracy = config.leaderAccuracy
        this.points = 1000

        if (Math.random() * 100 <= config.homingDiscPercent)
            this.disc = new HomingDisc(this)
        else
            this.disc = new IntermediateDisc(this)
    }
}
