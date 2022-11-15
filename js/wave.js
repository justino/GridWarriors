import { Warrior } from "./units/warrior.js"
import { Bulldog } from "./units/bulldog.js"
import { Leader } from "./units/leader.js"
import { Vector } from "./vector.js"

export class Wave {
    constructor(gameGrid) {
        this.gameGrid = gameGrid
        this.timer
        this.count = 0

        this.trigger(config.gameStartTime)
    }

    next() {
        if (this.gameGrid.enemies.length >= config.enemyCount)
            return
        this.count++

        const unitsToSpawn = config.enemyCount - this.gameGrid.enemies.length
        console.log(`Wave ${this.count}: Spawning ${unitsToSpawn} units`)

        for (let i = 0; i < unitsToSpawn; i++) {
            this.spawnUnit()
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
            dispatchEvent(new CustomEvent('Score', { detail: { score: 250 } }))
            console.log("Wave Cleared")
        }
    }

    spawnUnit() {
        const units = []

        if (this.count > 10)
            units.push(Leader)
        if (this.count > 5)
            units.push(Bulldog)
        units.push(Warrior)

        const unit = units[Math.floor(Math.random() * units.length)]
        const location = new Vector([
            Math.random() * (this.gameGrid.canvas.width - config.unitSize * 2) + config.unitSize,
            Math.random() * (this.gameGrid.canvas.height - config.unitSize * 2) + config.unitSize
        ])

        this.gameGrid.enemies.push(new unit(this.gameGrid, location))
    }

    isCleared() {
        return (this.count > 0 && this.gameGrid.enemies.length === 0)
    }
}
