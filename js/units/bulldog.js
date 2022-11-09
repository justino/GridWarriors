import { Unit } from "./unit.js"
import { BeginnerDisc } from "../discs/beginner.js"

export class Bulldog extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Bulldog', gameGrid.config.bulldogColor, location);

        this.baseSpeed = .75;
        this.regenerates = true;
        this.maxHits = 2;
        this.baseAccuracy = this.gameGrid.config.bulldogAccuracy;
        this.disc = new BeginnerDisc(this);
        this.points = 500;
    }
}
