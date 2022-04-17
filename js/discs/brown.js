import { Disc } from "../disc.js"

export class Brown extends Disc {
    constructor(unit) {
        super('Brown', 'rgba(139, 69, 19, 1)', unit);
        this.strength = 2;
    }
}
