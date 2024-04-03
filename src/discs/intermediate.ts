import { config } from "@/config"

import { Disc } from "@/discs//disc"
import { Unit } from "@/units/unit"

export class IntermediateDisc extends Disc {
    constructor(unit: Unit) {
        super('Intermediate', config.intermediateDiscColor, unit)

        this.baseSpeed = config.intermediateDiscSpeed
        this.strength = 2
    }
}
