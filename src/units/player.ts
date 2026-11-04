import { config } from "@/config"

import { Unit } from "@/units/unit"
import { DiscStates } from "@/discs/disc"
import { PlayerDisc } from "@/discs/player"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { KeyboardState } from "@/keyboard"

export class Player extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
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
        this.disc?.update()
        this.resolveTeleportation()
    }

    updateLocation() {
        // Can't move while blocking
        if (this.isBlocking) { return }

        // Build a direction from keyboard input, each axis is -1, 0 or 1
        const velocity = new Vector([0, 0])

        if (KeyboardState.isDown(KeyboardState.movement.DOWN))  velocity.points[1] += 1
        if (KeyboardState.isDown(KeyboardState.movement.UP))    velocity.points[1] -= 1
        if (KeyboardState.isDown(KeyboardState.movement.LEFT))  velocity.points[0] -= 1
        if (KeyboardState.isDown(KeyboardState.movement.RIGHT)) velocity.points[0] += 1

        // No movement (no keys, or opposing keys cancel out), keep the current location and facing
        if (velocity.magnitude() === 0) return

        // Normalize so diagonal movement isn't faster, then scale to speed
        velocity.normalize()
        velocity.mul(this.baseSpeed * this.speedModifier)

        this.location.add(velocity)
        this.setFacing(this.findFacing(velocity))
    }

    updateDiscStatus() {
        this.blocking()
        this.throwDisc()
        this.returnDisc()
    }

    blocking() {
        this.isBlocking = KeyboardState.blockKeyPressed()
    }

    throwDisc() {
        if (this.disc?.status !== DiscStates.HELD) return

        const velocity = this.throwDirection()
        if (! velocity) return

        this.disc.thrown(velocity)
    }

    throwDirection() {
        // Number pad aims the throw directly
        const direction = KeyboardState.discKeyPressed()
        if (direction) {
            const velocity = new Vector([0, 0])

            if (direction.includes('UP'))    velocity.points[1] = -1
            if (direction.includes('DOWN'))  velocity.points[1] =  1
            if (direction.includes('LEFT'))  velocity.points[0] = -1
            if (direction.includes('RIGHT')) velocity.points[0] =  1

            return velocity
        }

        // Throw button uses the direction the player is facing
        if (KeyboardState.isDown(KeyboardState.THROW)) return this.facingDirection()

        return null
    }

    returnDisc() {
        if (this.disc?.status !== DiscStates.DEADLY) return

        if (! KeyboardState.throwKeyPressed()) {
            this.disc.returnable = true
            return
        }

        if (this.disc.returnable) this.disc.return()
    }

    setDestination() { } // null operation for player
}
