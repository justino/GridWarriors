import { Disc } from "./disc.js"

export class BeginnerDisc extends Disc {
    constructor(unit) {
        super('Beginner', config.beginnerDiscColor, unit)

        this.baseSpeed = 4
    }
}
