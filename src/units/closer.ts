import { config } from "@/config"

import { Unit } from "@/units/unit"
import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"
import { BeginnerDisc } from "@/discs/beginner"
import { DiscStates } from "@/discs/disc"
import { Door } from "@/door"
import { msToTicks } from "@/time"

// Turn 'rgba(r, g, b, a)' into [r, g, b]
function rgb(color: string) {
    return (color.match(/\d+/g) ?? []).slice(0, 3).map(Number)
}

export class Closer extends Unit {
    private target: Door | null
    private throbTicks: number
    private throbLength: number

    constructor(gameGrid: GameGrid, location: Vector) {
        super(gameGrid, 'Closer', config.closerColor, location)

        this.baseSpeed = config.closerSpeed
        this.deflectChance = config.closerDeflectChance
        this.points = 2000

        const disc = new BeginnerDisc(this)
        disc.unjams = true
        disc.strength = 0
        this.disc = disc

        this.target = null
        this.throbTicks = 0
        this.throbLength = Math.max(1, msToTicks(config.closerThrobInterval))
    }

    update() {
        this.throbTicks++
        super.update()
    }

    // Never goes through doors, it can brush past one on its way to another along a wall
    teleportTo() {}

    move() {
        if (this.disc?.status !== DiscStates.HELD) return

        // Close enough to step onto the throw spot this update, so line up exactly on it.
        // Stopping here also keeps the base move from ever aiming at the spot we're standing on.
        if (this.target && this.inThrowRange()) {
            this.location = Vector.clone(this.target.welcomeMatLocation)
            return
        }

        super.move()
    }

    updateDiscStatus() {
        if (this.disc?.status !== DiscStates.HELD) return

        if (this.gameGrid.jammedDoors().length === 0) {
            dispatchEvent(new CustomEvent('UnitLeft', { detail: this }))
            return
        }

        if (! this.target?.isJammed) {
            this.setDestination()
            return
        }

        if (this.isDeflecting || ! this.inThrowRange()) return

        this.disc.thrown(Vector.subFactory(this.target.spawnLocation, this.disc.location))
    }

    inThrowRange() {
        if (! this.target) return false

        return this.location.distance(this.target.welcomeMatLocation) <= this.baseSpeed
    }

    doorDestination() {
        if (! this.target?.isJammed) {
            const doors = this.gameGrid.jammedDoors()
            this.target = doors[Math.floor(Math.random() * doors.length)] ?? null
        }

        return this.target ? Vector.clone(this.target.welcomeMatLocation) : null
    }

    draw() {
        // 0 at the start of a throb, 1 halfway through, back to 0 at the end
        const amount = (1 - Math.cos(2 * Math.PI * this.throbTicks / this.throbLength)) / 2

        const from = rgb(config.closerColor)
        const to = rgb(config.closerThrobColor)
        const mixed = from.map((value, i) => Math.round(value + (to[i] - value) * amount))
        this.color = `rgba(${mixed.join(', ')}, 1)`

        super.draw()
    }
}
