import { Warrior } from "./units/warrior.js"
import { Bulldog } from "./units/bulldog.js"
import { Leader } from "./units/leader.js"

export class WaveManager {
    constructor(gameGrid) {
        this.gameGrid = gameGrid
        this.timer
        this.count = 0
    }

    next() {
        if (this.gameGrid.enemies.length >= config.enemyCount)
            return
        this.count++

        const unitsToSpawn = config.enemyCount - this.gameGrid.enemies.length
        console.log(`Wave ${this.count}: Spawning ${unitsToSpawn} units`)

        for (let i = 0; i < unitsToSpawn; i++) {
            this.spawnUnits()
        }
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

    spawnUnits() {
        const units = []

        if (this.count > 10)
            units.push(Leader)
        if (this.count > 5)
            units.push(Bulldog)
        units.push(Warrior)

        const unit = units[Math.floor(Math.random() * units.length)]

        this.gameGrid.AddEnemy(unit)
    }

    isCleared() {
        return (this.count > 0 && this.gameGrid.enemies.length === 0)
    }
}
