import { Disc } from "./disc.js"

export class IntermediateDisc extends Disc {
    constructor(unit) {
        super('Intermediate', config.intermediateDiscColor, unit)

        this.baseSpeed = config.intermediateDiscSpeed
        this.strength = 2
    }
}
