import { config } from "@/config"

import { Unit, UnitStates } from "@/units/unit"
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
        // Build a direction from keyboard input, each axis is -1, 0 or 1
        const velocity = new Vector([0, 0])

        if (KeyboardState.isDown(KeyboardState.movement.SOUTH)) velocity.points[1] += 1
        if (KeyboardState.isDown(KeyboardState.movement.NORTH)) velocity.points[1] -= 1
        if (KeyboardState.isDown(KeyboardState.movement.WEST))  velocity.points[0] -= 1
        if (KeyboardState.isDown(KeyboardState.movement.EAST))  velocity.points[0] += 1

        // No movement (no keys, or opposing keys cancel out), keep the current location and facing
        if (velocity.magnitude() === 0) return

        // Movement keys always turn the player, so they can aim their deflection
        this.setFacing(this.findFacing(velocity))

        // Can't move while deflecting
        if (this.isDeflecting) return

        // Normalize so diagonal movement isn't faster, then scale to speed
        velocity.normalize()
        velocity.mul(this.baseSpeed * this.speedModifier)

        this.location.add(velocity)
    }

    updateDiscStatus() {
        this.deflecting()

        // A press either throws or recalls, never both in the same update
        switch (this.disc?.status) {
            case DiscStates.HELD:
                this.throwDisc()
                break
            case DiscStates.DEADLY:
                this.returnDisc()
                break
        }
    }

    // Deflect while the key is held, as long as we have our disc in hand
    deflecting() {
        const deflect = this.disc?.status === DiscStates.HELD && KeyboardState.deflectKeyDown()
        this.changeState(deflect ? UnitStates.DEFLECTING : UnitStates.MOVING)
    }

    throwDisc() {
        if (this.disc?.status !== DiscStates.HELD) return

        const velocity = this.throwDirection()
        if (! velocity) return

        this.disc.thrown(velocity)
    }

    throwDirection() {
        // Number pad aims the throw directly
        const direction = KeyboardState.discKeyWasPressed()
        if (direction) {
            const velocity = new Vector([0, 0])

            if (direction.includes('NORTH')) velocity.points[1] = -1
            if (direction.includes('SOUTH')) velocity.points[1] =  1
            if (direction.includes('WEST'))  velocity.points[0] = -1
            if (direction.includes('EAST'))  velocity.points[0] =  1

            return velocity
        }

        // Throw button uses the direction the player is facing
        if (KeyboardState.wasPressed(KeyboardState.THROW)) return this.facingDirection()

        return null
    }

    returnDisc() {
        if (this.disc?.status !== DiscStates.DEADLY) return

        if (KeyboardState.throwKeyWasPressed()) this.disc.return()
    }

    // The player's facing comes from the keyboard, so nothing to undo when leaving a state
    protected exitState() { }

    setDestination() { } // null operation for player
}
