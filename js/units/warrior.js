import { Unit } from "../unit.js"
import { DarkBlue } from "../discs/darkblue.js"

export class Warrior extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Warrior', gameGrid.config.warriorColor, location)

        this.disc = new DarkBlue(this);
    }
}
