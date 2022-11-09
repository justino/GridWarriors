import { Disc } from "./disc.js"

export class IntermediateDisc extends Disc {
    constructor(unit) {
        super('Intermediate', unit.gameGrid.config.intermediateDiscColor, unit);
        this.strength = 2;
    }
}
