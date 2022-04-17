import { Unit } from "./unit.js"
import { Yellow } from "./discs/yellow.js"
import { Vector } from "./vector.js"
import { KeyboardState } from "./keyboard.js"

export class Player extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Tran', gameGrid.config.tranColor, location);

        this.gameGrid = gameGrid;
        this.isPlayer = true;
        this.canBlock = true;
        this.regenerates = true;
        this.maxHits = 3;
        this.disc = new Yellow(this);
    }

    Update() {
        this.CatchDisc();
        this.UpdateLocation();
        this.bindToGameGrid();

        this.UpdateDiscStatus();
        this.disc.Update();
    }

    UpdateLocation() {
        // Can't run while blocking
        if (this.disc.status === 'blocking') { return; }

        const velocity = new Vector([0, 0]);

        // Move around based on keyboard input
        if (KeyboardState.isDown(KeyboardState.movement.DOWN)) { velocity.points[1] += (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.UP)) { velocity.points[1] -= (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.LEFT)) { velocity.points[0] -= (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) { velocity.points[0] += (this.baseSpeed * this.speedModifier); }

        // Only perform movement if there was any
        if (velocity.points[0] !== 0 || velocity.points[1] !== 0) { this.location.Add(velocity); }
    }

    UpdateDiscStatus() {
        if (this.disc.status === 'held') {
            // Disc Throwing
            const direction = KeyboardState.discKeyPressed();
            if (direction) {
                this.disc.Thrown(direction);
                KeyboardState.keyUp(direction); // Don't repeatably throw, must press again
            }

            //Blocking
            if (KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'blocking'; }
        }
        else if (this.disc.status === 'deadly') {
            if (KeyboardState.discKeyPressed()) {
                if (this.disc.returnable === true) {
                    this.disc.Return();
                }
            }
            else if (!this.disc.returnable) {
                this.disc.returnable = true;
            }
        }
        else if (this.disc.status === 'blocking') {
            if (!KeyboardState.isDown(KeyboardState.BLOCK)) { this.disc.status = 'held'; }
        }
    }
}
