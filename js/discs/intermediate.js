import { Disc } from "./disc.js"

export class IntermediateDisc extends Disc {
    constructor(unit) {
        super('Intermediate', config.intermediateDiscColor, unit)

        this.baseSpeed = 4
        this.strength = 2
    }
}
