import { config } from "@/config"

import { GameGrid } from "@/gamegrid"
import { Warrior, Bulldog, Leader, Closer } from "@/units/index"
import { DoorSides, DoorSideNames } from "@/door"
import { msToTicks } from "@/time"

export class WaveManager {
    private gameGrid: GameGrid
    private spawnTicks: number | null // Updates until the next spawn, null when none is scheduled
    private count: number

    constructor(gameGrid: GameGrid) {
        this.gameGrid = gameGrid
        this.spawnTicks = null
        this.count = 0
    }

    reset() {
        this.cancel()
        this.count = 0
    }

    // Called every game update by the game loop, counts down to the next spawn
    update() {
        if (this.spawnTicks === null) return

        this.spawnTicks--
        if (this.spawnTicks > 0) return

        this.spawnTicks = null
        this.next()
    }

    next() {
        if (this.gameGrid.enemies.length >= config.enemyCount)
            return
        this.count++

        const unitsToSpawn = config.enemyCount - this.gameGrid.enemies.length
        console.log(`Wave ${this.count}: Spawning ${unitsToSpawn} units`)

        this.spawnUnits(unitsToSpawn)
    }

    // Cancel any pending spawn
    cancel() {
        this.spawnTicks = null
    }

    // Spawn the next wave after interval milliseconds, replacing any pending spawn
    trigger(interval: number) {
        this.schedule(interval)

        if (this.isCleared()) {
            // Wave cleared, extra points
            dispatchEvent(new CustomEvent('Score', { detail: { points: 250 } }))
            console.log("Wave Cleared")
        }
    }

    // Spawn the next wave after interval milliseconds, without checking for a cleared wave
    schedule(interval: number) {
        this.spawnTicks = msToTicks(interval)
        console.log(`Wave triggered - ${interval}ms`)
    }

    eligibleUnits() {
        const units = []

        if (this.count > 10)
            units.push(Leader)
        if (this.count > 5)
            units.push(Bulldog)
        if (this.closerEligible())
            units.push(Closer)
        units.push(Warrior)

        return units
    }

    randomSide() {
        const sideNames = Object.keys(DoorSides)

        return DoorSides[sideNames[Math.floor(Math.random() * sideNames.length)] as DoorSideNames ]
    }

    spawnUnits(count = 1) {
        let eligibleUnits = this.eligibleUnits()
        const side = this.randomSide()
        const newUnits = []

        for (let i = 0; i < count; i++) {
            const unit = eligibleUnits[Math.floor(Math.random() * eligibleUnits.length)]
            newUnits.push(unit)

            // Only ever one Closer at a time
            if (unit === Closer) eligibleUnits = eligibleUnits.filter(eligible => eligible !== Closer)
        }

        // The player has to teleport again before the next Closer can show up
        if (newUnits.includes(Closer)) this.gameGrid.playerTeleported = false

        this.gameGrid.addEnemies(newUnits, side)
    }

    // Only once the player has teleported since the last Closer, and then only on a roll
    closerEligible() {
        if (! this.gameGrid.playerTeleported) return false
        if (this.gameGrid.enemies.some(enemy => enemy instanceof Closer)) return false

        const roll = Math.random() * 100
        return roll < config.closerChance
    }

    isCleared() {
        return (this.count > 0 && this.gameGrid.enemies.length === 0)
    }
}
