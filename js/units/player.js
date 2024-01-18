import { Unit } from "./unit.js"
import { DiscStates } from "../discs/disc.js"
import { PlayerDisc } from "../discs/player.js"
import { Vector } from "../vector.js"
import { KeyboardState } from "../keyboard.js"

export class Player extends Unit {
    constructor(gameGrid, location) {
        super(gameGrid, 'Adora', config.playerColor, location)

        this.gameGrid = gameGrid

        this.isPlayer = true
        this.canBlock = true
        this.regenerates = true
        this.maxHits = 3
        this.baseSpeed = config.playerSpeed

        this.disc = new PlayerDisc(this)
    }

    update() {
        this.catchDisc()
        this.updateLocation()
        this.bindToGameGrid()

        this.updateDiscStatus()
        this.disc.update()
        this.resolveTeleportation()
    }

    updateLocation() {
        // Can't move while blocking
        if (this.isBlocking) { return }

        const velocity = new Vector([0, 0])

        // Move around based on keyboard input
        if (KeyboardState.isDown(KeyboardState.movement.DOWN))  velocity.points[1] += (this.baseSpeed * this.speedModifier)
        if (KeyboardState.isDown(KeyboardState.movement.UP))    velocity.points[1] -= (this.baseSpeed * this.speedModifier)
        if (KeyboardState.isDown(KeyboardState.movement.LEFT))  velocity.points[0] -= (this.baseSpeed * this.speedModifier)
        if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) velocity.points[0] += (this.baseSpeed * this.speedModifier)

        this.location.add(velocity)
        this.setFacing(this.findFacing(velocity))
    }

    updateDiscStatus() {
        this.blocking()
        this.throwDisc()
        this.returnDisc()
    }

    blocking() {
        this.isBlocking = KeyboardState.isDown(KeyboardState.BLOCK)
    }

    throwDisc() {
        if (this.disc.status !== DiscStates.HELD) return

        const direction = KeyboardState.discKeyPressed()
        if (! direction) return

        const velocity = new Vector([0, 0])

        if (direction.includes('UP'))    velocity.points[1] = -1
        if (direction.includes('DOWN'))  velocity.points[1] =  1
        if (direction.includes('LEFT'))  velocity.points[0] = -1
        if (direction.includes('RIGHT')) velocity.points[0] =  1

        this.disc.thrown(velocity)
    }

    returnDisc() {
        if (this.disc.status !== DiscStates.DEADLY) return

        const direction = KeyboardState.discKeyPressed()
        if (! direction) {
            this.disc.returnable = true
            return
        }

        if (this.disc.returnable) this.disc.return()
    }

    setDestination() { } // null operation for player
}
