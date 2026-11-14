import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { IntermediateDisc } from "@/discs/intermediate"
import { HomingDisc } from "@/discs/homing"
import { Door } from "@/door"

export class Leader extends Unit {
    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Leader', config.leaderColor, location)

        this.baseSpeed = config.leaderSpeed
        this.throwFrequencyModifier = -2
        this.baseAccuracy = config.leaderAccuracy
        this.useDoorChance = config.leaderUseDoorChance
        this.points = 1000

        if (Math.random() * 100 <= config.homingDiscPercent)
            this.disc = new HomingDisc(this)
        else
            this.disc = new IntermediateDisc(this)
    }

    // Leaders use doors strategically: pick the door whose partner portal gets them
    // closest to the player, but only if it beats walking straight there.
    chooseDoor(doors: Door[]): Door | null {
        const player = this.gameGrid.player
        if (! player) return null

        let bestDoor: Door | null = null
        let bestDistance = this.location.distance(player.location)

        for (const door of doors) {
            const distance = this.location.distance(door.spawnLocation) + door.partnerDoor.spawnLocation.distance(player.location)
            if (distance < bestDistance) {
                bestDoor = door
                bestDistance = distance
            }
        }

        return bestDoor
    }
}
