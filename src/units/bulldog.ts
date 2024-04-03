import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { BeginnerDisc } from "@/discs/beginner"

export class Bulldog extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Bulldog', config.bulldogColor, location)

        this.baseSpeed = config.bulldogSpeed
        this.regenerates = true
        this.maxHits = 2
        this.baseAccuracy = config.bulldogAccuracy
        this.disc = new BeginnerDisc(this)
        this.points = 500
    }
}
