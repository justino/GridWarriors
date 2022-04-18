import { Disc } from "./disc.js"

export class Yellow extends Disc {
    constructor(unit) {
        super('Yellow', 'rgba(255, 255, 0, 1)', unit)
    }
}
