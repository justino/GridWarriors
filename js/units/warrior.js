import { Unit } from "./unit.js"
import { BeginnerDisc } from "../discs/beginner.js"

export class Warrior extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Warrior', gameGrid.config.warriorColor, location)

        this.disc = new BeginnerDisc(this);
    }
}
