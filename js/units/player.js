import { Unit } from "./unit.js"
import { PlayerDisc } from "../discs/player.js"
import { Vector } from "../vector.js"
import { KeyboardState } from "../keyboard.js"

export class Player extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Tran', gameGrid.config.tranColor, location)

        this.gameGrid = gameGrid

        this.canBlock = true
        this.regenerates = true
        this.maxHits = 3

        this.disc = new PlayerDisc(this)
    }

    Update() {
        this.CatchDisc()
        this.UpdateLocation()
        this.bindToGameGrid()

        this.UpdateDiscStatus()
        this.disc.Update()
    }

    UpdateLocation() {
        // Can't move while blocking
        if (this.isBlocking) { return }

        const velocity = new Vector([0, 0]);

        // Move around based on keyboard input
        if (KeyboardState.isDown(KeyboardState.movement.DOWN)) { velocity.points[1] += (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.UP)) { velocity.points[1] -= (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.LEFT)) { velocity.points[0] -= (this.baseSpeed * this.speedModifier); }
        if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) { velocity.points[0] += (this.baseSpeed * this.speedModifier); }

        this.location.Add(velocity);
        this.setDirection(this.findDirection(velocity))
    }

    UpdateDiscStatus() {
        this.Blocking()
        this.ThrowDisc()
        this.ReturnDisc()
    }

    Blocking() {
        this.isBlocking = KeyboardState.isDown(KeyboardState.BLOCK)
    }

    ThrowDisc() {
        if (this.disc.status !== this.disc.HELD) return

        const direction = KeyboardState.discKeyPressed()
        if (! direction) return

        const velocity = new Vector([0, 0])

        if (direction.includes('UP'))    velocity.points[1] = -1
        if (direction.includes('DOWN'))  velocity.points[1] =  1
        if (direction.includes('LEFT'))  velocity.points[0] = -1
        if (direction.includes('RIGHT')) velocity.points[0] =  1

        this.disc.Thrown(velocity)
    }

    ReturnDisc() {
        if (this.disc.status !== this.disc.DEADLY) return

        const direction = KeyboardState.discKeyPressed()
        if (! direction) {
            this.disc.returnable = true
            return
        }

        if (this.disc.returnable) this.disc.Return()
    }
}
