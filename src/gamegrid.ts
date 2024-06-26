import { config } from "@/config"

import { Player, Enemy, EnemyTypes, Unit } from "@/units/index"
import { DiscStates } from "@/discs/disc"
import { Door, DoorPositionNames, DoorPositions, DoorStates, DoorSideInfo } from "@/door"
import { Vector } from "@/vector"

export class GameGrid {
    public canvas: HTMLCanvasElement
    public context: CanvasRenderingContext2D
    public diagonal: number
    private doors: Door[]
    public enemies: Enemy[]
    public player: Player | null

    constructor() {
        console.log("Grid: Rezzing")

        const canvas = document.getElementById('gamegrid')
        if (! canvas) throw new Error('Unable to find GameGrid element')

        this.canvas = canvas as HTMLCanvasElement
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
        this.canvas.width = config.width
        this.canvas.height = config.height

        this.diagonal = Math.sqrt((config.width ^ 2) + (config.height ^ 2))

        this.doors = []
        this.enemies = []
        this.player = null
    }

    reset() {
        this.enemies = []
        this.player = null
        this.doors = []
    }

    setup() {
        this.enemies = []
        this.player = new Player(
            this,
            new Vector([this.canvas.width / 2, this.canvas.height / 2])
        )
        for (const position in DoorPositions) {
            const info = DoorPositions[position as DoorPositionNames]
            this.doors.push(new Door(this, info))
        }
    }

    draw() {
        this.drawBackground()

        if (this.player) this.player.draw()
        for (const enemy of this.enemies) {
            enemy.draw()
        }
        for (const door of this.doors) {
            door.draw()
        }
    }

    drawBackground() {
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

    update() {
        if (!this.player) return

        // Check for hits/deaths by player
        if (this.player?.disc?.status === DiscStates.DEADLY) {
            for (const enemy of this.enemies) {
                this.player.disc.checkCollide(enemy)
            }
        }

        // Check for player hits/death
        for (const enemy of this.enemies) {
            enemy?.disc?.checkCollide(this.player)
        }

        // Player might not exist after collisions
        if (! this.player) return

        // Door Jamming
        for (const unit of [...this.enemies, this.player]) {
            for (const door of this.doors) {
                // Did units disc hit a door
                if (door.state === DoorStates.OPEN && unit?.disc?.status === DiscStates.DEADLY && door.isCollided(unit.disc)) {
                    unit?.isPlayer ? door.jam() : door.close()
                }
            }
        }

        // Movement
        this.player.update()
        for (const enemy of this.enemies) {
            enemy.update()
        }

        // Teleportation
        for (const unit of [...this.enemies, this.player]) {
            for (const door of this.doors) {
                if (door.state === DoorStates.JAMMED && door.isCollided(unit) && ! unit?.isTeleporting) {
                    const teleportsTo = DoorPositions[door.position.teleportsTo]
                    const teleportDoor = this.doors.find(door => door.position === teleportsTo)
                    if (teleportDoor?.state !== DoorStates.JAMMED) break

                    unit.teleportTo(teleportDoor)
                }
            }
        }
    }

    addEnemies(enemyUnits: EnemyTypes[], doorSide: DoorSideInfo) {
        this.closeDoors()
        const doors = this.doors.filter(door => door.position.side === doorSide )

        for (const unit of enemyUnits) {
            const door = doors.splice(Math.floor(Math.random() * doors.length), 1)[0]
            door.open()

            const enemy = new unit(this, door.spawnLocation)
            enemy.teleportTo(door)
            this.enemies.push(enemy)
        }
    }

    removeEnemy(enemy: Unit) {
        console.log(`${enemy.name} derezzed`)
        this.enemies = this.enemies.filter((unit) => {
            return unit != enemy
        })
    }

    removePlayer() {
        this.player = null
    }

    closeDoors() {
        for (const door of this.doors) {
            door.close()
        }
    }
}
