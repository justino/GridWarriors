import { Disc } from "./disc.js"

export class PlayerDisc extends Disc {
    constructor(unit) {
        super('Player', config.playerDiscColor, unit)

        this.baseSpeed = config.playerDiscSpeed
    }
}
