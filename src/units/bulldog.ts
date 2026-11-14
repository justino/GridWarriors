import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { BeginnerDisc } from "@/discs/beginner"
import { SpeedDisc } from "@/discs/speed"

export class Bulldog extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Bulldog', config.bulldogColor, location)

        this.baseSpeed = config.bulldogSpeed
        this.regenerates = true
        this.getsTired = true
        this.maxHits = 2
        this.baseAccuracy = config.bulldogAccuracy
        this.useDoorChance = config.bulldogUseDoorChance
        this.points = 500

        const roll = Math.random() * 100
        if (roll < config.speedDiscPercentBulldog)
            this.disc = new SpeedDisc(this)
        else
            this.disc = new BeginnerDisc(this)
    }
}
