import { Disc } from "../disc.js"
import { KeyboardState } from "../keyboard.js"
import { Vector } from "../vector.js";

export class Yellow extends Disc {
    constructor(unit) {
        super('Yellow', 'rgba(255, 255, 0, 1)', unit)
    }

    Thrown(direction) {
        this.status = 'deadly';
        const velocity = new Vector([0, 0]);

        switch (direction) {
            case KeyboardState.disc.UP:
                velocity.points[1] -= (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.UPLEFT:
                velocity.points[1] -= (this.baseSpeed + this.speedModifier);
                velocity.points[0] -= (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.LEFT:
                velocity.points[0] -= (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.DOWNLEFT:
                velocity.points[1] += (this.baseSpeed + this.speedModifier);
                velocity.points[0] -= (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.DOWN:
                velocity.points[1] += (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.DOWNRIGHT:
                velocity.points[1] += (this.baseSpeed + this.speedModifier);
                velocity.points[0] += (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.RIGHT:
                velocity.points[0] += (this.baseSpeed + this.speedModifier);
                break;
            case KeyboardState.disc.UPRIGHT:
                velocity.points[1] -= (this.baseSpeed + this.speedModifier);
                velocity.points[0] += (this.baseSpeed + this.speedModifier);
                break;
        }

        this.velocity = velocity;
    }
}
