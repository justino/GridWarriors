import { Disc } from "./disc.js"

export class HomingDisc extends Disc {
    constructor(unit) {
        super('Homing', unit.gameGrid.config.homingDiscColor, unit)
        this.homing = true;
    }
}
