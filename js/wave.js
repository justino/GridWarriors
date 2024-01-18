import { Warrior } from "./units/warrior.js"
import { Bulldog } from "./units/bulldog.js"
import { Leader } from "./units/leader.js"
import { DoorSides } from "./door.js"

export class WaveManager {
    constructor(gameGrid) {
        this.gameGrid = gameGrid
        this.timer
        this.count = 0
    }

    reset() {
        this.end()
        this.count = 0
    }

    next() {
        if (this.gameGrid.enemies.length >= config.enemyCount)
            return
        this.count++

        const unitsToSpawn = config.enemyCount - this.gameGrid.enemies.length
        console.log(`Wave ${this.count}: Spawning ${unitsToSpawn} units`)

        this.spawnUnits(unitsToSpawn)
    }

    end() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    trigger(interval) {
        this.end()

        this.timer = setTimeout(this.next.bind(this), interval * 1000)
        console.log(`Wave triggered - ${interval}s`)

        if (this.isCleared()) {
            // Wave cleared, extra points
            dispatchEvent(new CustomEvent('Score', { detail: { points: 250 } }))
            console.log("Wave Cleared")
        }
    }

    eligibleUnits() {
        const units = []

        if (this.count > 10)
            units.push(Leader)
        if (this.count > 5)
            units.push(Bulldog)
        units.push(Warrior)

        return units
    }

    randomSide() {
        const sideNames = Object.keys(DoorSides)

        return DoorSides[
            sideNames[Math.floor(Math.random() * sideNames.length)]
        ]
    }

    spawnUnits(count = 1) {
        const eligibleUnits = this.eligibleUnits()
        const side = this.randomSide()
        const newUnits = []

        for (let i = 0; i < count; i++) {
            newUnits.push(eligibleUnits[Math.floor(Math.random() * eligibleUnits.length)])
        }

        this.gameGrid.addEnemies(newUnits, side)
    }

    isCleared() {
        return (this.count > 0 && this.gameGrid.enemies.length === 0)
    }
}
