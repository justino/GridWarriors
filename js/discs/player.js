import { Disc } from "./disc.js"

export class PlayerDisc extends Disc {
    constructor(unit) {
        super('Player', unit.gameGrid.config.playerDiscColor, unit)
    }
}
