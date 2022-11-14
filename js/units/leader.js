import { Unit } from "./unit.js"
import { IntermediateDisc } from "../discs/intermediate.js"
import { HomingDisc } from "../discs/homing.js"

export class Leader extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Leader', gameGrid.config.leaderColor, location);

        this.baseSpeed = 2;
        this.throwFrequencyModifier = -2;
        this.baseAccuracy = this.gameGrid.config.leaderAccuracy;
        this.points = 1000;

        if (Math.random() * 100 <= this.gameGrid.config.homingDiscPercent) {
            this.disc = new HomingDisc(this);
        }
        else {
            this.disc = new IntermediateDisc(this);
        }
    }
}
