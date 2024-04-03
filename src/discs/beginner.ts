import { config } from "@/config"
import { Disc } from "@/discs/disc"
import { Unit } from "@/units/unit"

export class BeginnerDisc extends Disc {
    constructor(unit: Unit) {
        super('Beginner', config.beginnerDiscColor, unit)

        this.baseSpeed = config.beginnerDiscSpeed
    }
}
