import { Player } from "./units/player.js"
import { DiscStates } from "./discs/disc.js"
import { Vector } from "./vector.js"

export class GameGrid {
    constructor() {
        console.log("Grid: Rezzing")

        this.canvas = document.getElementById('gamegrid')
        this.context = this.canvas.getContext('2d')
        this.canvas.width = config.width
        this.canvas.height = config.height

        this.diagonal = Math.sqrt((config.width ^ 2) + (config.height ^ 2))

        this.enemies = []
        this.player = null
    }

    Setup() {
        this.enemies = []
        this.player = new Player(
            this,
            new Vector([this.canvas.width / 2, this.canvas.height / 2])
        )
    }

    Draw() {
        this.DrawBackground()

        if (this.player) this.player.Draw()
        for (const enemy of this.enemies) {
            enemy.Draw()
        }
    }

    DrawBackground() {
        this.context.fillStyle = config.gridColor
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Grid
        this.context.strokeStyle = config.gridLinesColor
        this.context.beginPath()
        // Verticles
        for (let i = 0; i < this.canvas.width; i += (this.canvas.width / 13)) {
            this.context.moveTo(i, 0)
            this.context.lineTo(i, this.canvas.height)
        }
        // Horizontals
        for (let i = 0; i < this.canvas.height; i += (this.canvas.height / 13)) {
            this.context.moveTo(0, i)
            this.context.lineTo(this.canvas.width, i)
        }
        this.context.stroke()
    }

    Update() {
        if (!this.player) return

        // Check for hits/deaths by player
        if (this.player.disc.status === DiscStates.DEADLY) {
            for (const enemy of this.enemies) {
                this.player.disc.checkCollide(enemy)
            }
        }

        // Check for player hits/death
        for (const enemy of this.enemies) {
            enemy.disc.checkCollide(this.player)
        }

        // Movement
        if (this.player) {
            this.player.Update()

            for (const enemy of this.enemies) {
                enemy.Update()
            }
        }
    }

    AddEnemy(enemyUnit) {
        const location = new Vector([
            Math.random() * (this.canvas.width - config.unitSize * 2) + config.unitSize,
            Math.random() * (this.canvas.height - config.unitSize * 2) + config.unitSize
        ])

        const enemy = new enemyUnit(this, location)
        this.enemies.push(enemy)
    }

    RemoveEnemy(enemy) {
        console.log(`${enemy.name} derezzed`)
        this.enemies = this.enemies.filter((unit) => {
            return unit != enemy
        })
    }

    RemovePlayer() {
        this.player = null
    }
}
