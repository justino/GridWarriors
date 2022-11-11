import { Vector } from "../vector.js";
import { Disc } from "./disc.js"

export class HomingDisc extends Disc {
    constructor(unit) {
        super('Homing', unit.gameGrid.config.homingDiscColor, unit)

        this.baseSpeed = 2;
        this.homing = false;
    }

    Update() {
        switch (this.status) {
            case this.HELD:
                // Follow owner around
                this.location = Vector.Clone(this.owner.location);
                break;
            case this.RETURNING:
                this.Return();
                break;
            case this.DEADLY:
                if (this.homing) {
                    this.homeInOnPlayer();
                    break;
                }
            case this.BOUNCING:
                // Basic Straight Lines
                this.location.Add(this.velocity);
                break;
        }

        this.checkBounce();
    }

    Thrown(direction) {
        // After one second of regular movement, start homing
        setTimeout(this.startHoming.bind(this), 1000);
        super.Thrown(direction);
    }

    Return() {
        this.homing = false;
        super.Return();
    }

    startHoming() {
        this.homing = true;
    }

    homeInOnPlayer() {
        this.velocity = new Vector([0, 0]);

        const playerForce = Vector.SubFactory(this.gameGrid.player.location, this.location);
        playerForce.Normalize();
        playerForce.Mul(this.baseSpeed + this.speedModifier);

        this.velocity.Add(playerForce);
        this.velocity.Limit(this.baseSpeed + this.speedModifier);

        this.location.Add(this.velocity);
    }
}
