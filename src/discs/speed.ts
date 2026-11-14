import { config } from "@/config"
import { Disc } from "@/discs/disc"
import { Unit } from "@/units/unit"

// Same as the beginner disc, just faster
export class SpeedDisc extends Disc {
    constructor(unit: Unit) {
        super('Speed', config.speedDiscColor, unit)

        this.baseSpeed = config.speedDiscSpeed
    }
}
