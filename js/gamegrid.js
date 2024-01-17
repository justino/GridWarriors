import { Player } from "./units/player.js"
import { DiscStates } from "./discs/disc.js"
import { Door, DoorPositions, DoorStates } from "./door.js"
import { Vector } from "./vector.js"

export class GameGrid {
    constructor() {
        console.log("Grid: Rezzing")

        this.canvas = document.getElementById('gamegrid')
        this.context = this.canvas.getContext('2d')
        this.canvas.width = config.width
        this.canvas.height = config.height

        this.diagonal = Math.sqrt((config.width ^ 2) + (config.height ^ 2))

        this.doors = []
        this.enemies = []
        this.player = null
    }

    Reset() {
        this.enemies = []
        this.player = null
        this.doors = []
    }

    Setup() {
        this.enemies = []
        this.player = new Player(
            this,
            new Vector([this.canvas.width / 2, this.canvas.height / 2])
        )
        for (const position in DoorPositions) {
            this.doors.push(new Door(this, DoorPositions[position]))
        }
    }

    Draw() {
        this.DrawBackground()

        if (this.player) this.player.Draw()
        for (const enemy of this.enemies) {
            enemy.Draw()
        }
        for (const door of this.doors) {
            door.Draw()
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

        // Player might not exist after collisions
        if (! this.player) return

        // Door Jamming
        for (const unit of [...this.enemies, this.player]) {
            for (const door of this.doors) {
                // Did units disc hit a door
                if (door.state === DoorStates.OPEN && unit.disc.status === DiscStates.DEADLY && door.isCollided(unit.disc)) {
                    unit.isPlayer ? door.Jam() : door.Close()
                }
            }
        }

        // Movement
        this.player.Update()
        for (const enemy of this.enemies) {
            enemy.Update()
        }

        // Teleportation
        for (const unit of [...this.enemies, this.player]) {
            for (const door of this.doors) {
                if (door.state === DoorStates.JAMMED && door.isCollided(unit) && ! unit.isTeleporting) {
                    const teleportsTo = DoorPositions[door.position.teleportsTo]
                    const teleportDoor = this.doors.find(door => door.position === teleportsTo)
                    if (teleportDoor.state !== DoorStates.JAMMED) break

                    unit.TeleportTo(teleportDoor)
                }
            }
        }
    }

    AddEnemies(enemyUnits, doorSide) {
        this.closeDoors()
        const doors = this.doors.filter(door => door.position.side === doorSide )

        for (const unit of enemyUnits) {
            const door = doors.splice(Math.floor(Math.random() * doors.length), 1)[0]
            door.Open()

            const enemy = new unit(this, door.spawnLocation)
            enemy.TeleportTo(door)
            this.enemies.push(enemy)
        }
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

    closeDoors() {
        for (const door of this.doors) {
            door.Close()
        }
    }
}
