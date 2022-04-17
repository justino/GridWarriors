import { Disc } from "../disc.js"

export class White extends Disc {
    constructor(unit) {
        super('White', 'rgba(255, 255, 255, 1)', unit)
        this.homing = true;
    }
}
