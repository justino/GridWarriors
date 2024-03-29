import { Unit } from "./unit.js"
import { BeginnerDisc } from "../discs/beginner.js"

export class Warrior extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Warrior', config.warriorColor, location)

        this.baseSpeed = config.warriorSpeed

        this.disc = new BeginnerDisc(this)
    }
}
