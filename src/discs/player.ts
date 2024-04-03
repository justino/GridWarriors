import { config } from "@/config"

import { Disc } from "@/discs/disc"
import { Unit } from "@/units/unit"

export class PlayerDisc extends Disc {
    constructor(unit: Unit) {
        super('Player', config.playerDiscColor, unit)

        this.baseSpeed = config.playerDiscSpeed
    }
}
