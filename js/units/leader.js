import { Unit } from "./unit.js"
import { Brown } from "../discs/brown.js"
import { White } from "../discs/white.js"

export class Leader extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Leader', gameGrid.config.leaderColor, location);

        this.baseSpeed = 2;
        this.baseAccuracy = this.gameGrid.config.leaderAccuracy;
        this.points = 1000;

        if (Math.random() * 100 <= this.gameGrid.config.whiteDiscPercent) {
            this.disc = new White(this);
        }
        else {
            this.disc = new Brown(this);
        }
    }
}
