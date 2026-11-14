import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { BeginnerDisc } from "@/discs/beginner"

export class Warrior extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Warrior', config.warriorColor, location)

        this.baseSpeed = config.warriorSpeed
        this.getsTired = true
        this.useDoorChance = config.warriorUseDoorChance
        this.deflectChance = config.warriorDeflectChance

        this.disc = new BeginnerDisc(this)
    }
}
