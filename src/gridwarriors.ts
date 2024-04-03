import { config } from "@/config"

import { GameGrid } from "@/gamegrid"
import { Scoreboard } from "@/scoreboard"
import { Overlay } from "@/overlay"
import { WaveManager } from "@/wave"

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

        this.overlay.show()
    }

    private startGame() {
        this.scoreBoard.reset()

        this.gameGrid.reset()
        this.gameGrid.setup()

        this.waveManager.reset()
        this.waveManager.trigger(window.config.gameStartTime)

        this.playing = true
        this.play()
    }

    private play() {
        if (! this.playing) return

        if (this.paused) {
            this.gameGrid.drawBackground()
        }
        else {
            this.gameGrid.update()
            this.gameGrid.draw()
        }

        requestAnimationFrame(this.play.bind(this))
    }

    private pause(e: KeyboardEvent) {
        // Look for 'P' key'
        if (!['KeyP'].includes(e.code)) return

        e.stopPropagation()
        this.paused = !this.paused
        console.log(this.paused ? 'Paused' : 'Unpaused')
    }

    private unitHit(e: CustomEvent<UnitHit>) {
        const winner = e.detail.winner
        const loser = e.detail.loser
        console.log(`${winner.name} hit ${loser.name}`)

        this.playerhit(winner, loser)
        this.enemyhit(winner, loser)
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
                    points: winner.points
                }
            })
        )
    }
}
