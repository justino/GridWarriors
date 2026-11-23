import { config } from "@/config"

import { GameGrid } from "@/gamegrid"
import { Scoreboard } from "@/scoreboard"
import { Overlay } from "@/overlay"
import { WaveManager } from "@/wave"
import { KeyboardState } from "@/keyboard"

import { Unit } from "@/units/unit"

type UnitHit = {
    winner: Unit,
    loser: Unit
}

type Score = {
    points: number
}

export class GridWarriors {
    private scoreBoard: Scoreboard
    private overlay: Overlay
    private gameGrid: GameGrid
    private waveManager: WaveManager

    private playing: boolean
    private paused: boolean

    constructor() {
        this.scoreBoard = new Scoreboard()
        this.overlay = new Overlay()
        this.gameGrid = new GameGrid()
        this.waveManager = new WaveManager(this.gameGrid)

        this.playing = false
        this.paused = false

        addEventListener('keypress', this.pause.bind(this))
        addEventListener('GameStart', this.startGame.bind(this))
        addEventListener('GameOver', this.gameOver.bind(this))
        addEventListener('UnitHit', this.unitHit.bind(this) as EventListener)
        addEventListener('Score', this.score.bind(this) as EventListener)
        addEventListener('UnitLeft', this.unitLeft.bind(this) as EventListener)

        this.overlay.show()
    }

    private startGame() {
        this.scoreBoard.reset()

        this.gameGrid.reset()
        this.gameGrid.setup()

        this.waveManager.reset()
        this.waveManager.trigger(config.gameStartTime)

        // Don't act on keys pressed before the game started
        KeyboardState.clearPresses()

        this.playing = true
        this.play()
    }

    private play() {
        const step = 1000 / config.targetFps
        let last = performance.now()
        let accumulator = 0

        const frame = (now: number) => {
            if (! this.playing) return

            // Clamp elapsed time so a long stall (e.g. a background tab) doesn't trigger a huge catch-up
            accumulator += Math.min(now - last, config.maxFrameTime)
            last = now

            if (this.paused) {
                accumulator = 0
                // Drop presses made while paused, so they don't act the moment we unpause
                KeyboardState.clearPresses()
                this.gameGrid.drawBackground()
            }
            else {
                // Simulation runs at a fixed rate, independent of the display refresh rate
                while (accumulator >= step) {
                    this.waveManager.update()
                    this.gameGrid.update()
                    KeyboardState.clearPresses()
                    accumulator -= step
                }
                this.gameGrid.draw()
            }

            requestAnimationFrame(frame)
        }

        requestAnimationFrame(frame)
    }

    private pause(e: KeyboardEvent) {
        // Look for 'P' key'
        if (!['KeyP'].includes(e.code)) return

        e.stopPropagation()
        this.paused = !this.paused
    }

    private unitHit(e: CustomEvent<UnitHit>) {
        const winner = e.detail.winner
        const loser = e.detail.loser
        console.log(`${winner.name} hit ${loser.name}`)

        this.playerhit(winner, loser)
        this.enemyhit(winner, loser)
    }

    // An enemy left the board on its own, no points and no wave cleared bonus
    private unitLeft(e: CustomEvent<Unit>) {
        this.gameGrid.removeEnemy(e.detail)
        this.waveManager.schedule(config.respawnInterval)
    }

    private score(e: CustomEvent<Score>) {
        this.scoreBoard.score(e.detail.points)
    }

    private gameOver() {
        console.log('Game Over')
        this.playing = false
        this.overlay.show()
    }

    private playerhit(winner: Unit, loser: Unit) {
        if (! loser.isPlayer) return

        // Lose points when the player is hit
        dispatchEvent(
            new CustomEvent<Score>('Score', {
                detail: {
                    points: -winner.points
                }
            })
        )

        if (loser.isDead()) {
            this.gameGrid.removePlayer()
            dispatchEvent(
                new CustomEvent('GameOver')
            )
        }
    }

    private enemyhit(winner: Unit, loser: Unit) {
        if (loser.isPlayer) return
        if (! loser.isDead()) return

        this.gameGrid.removeEnemy(loser)
        this.waveManager.trigger(config.respawnInterval)
        dispatchEvent(
            new CustomEvent<Score>('Score', {
                detail: {
                    points: loser.points
                }
            })
        )
    }
}
