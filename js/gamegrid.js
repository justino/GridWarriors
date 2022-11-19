import { Player } from "./units/player.js"
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
    }

    Update() {
        if (!this.player) return

        // Check for hits/deaths by player
        if (this.player.disc.status === this.player.disc.DEADLY) {
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

    AddEnemy(enemy) {
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
