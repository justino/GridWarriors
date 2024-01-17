import { GameGrid } from "./gamegrid.js"
import { Scoreboard } from "./scoreboard.js"
import { Overlay } from "./overlay.js"
import { WaveManager } from "./wave.js"

export class GridWarriors {
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
        addEventListener('UnitHit', this.unitHit.bind(this))
        addEventListener('Score', this.score.bind(this))

        this.overlay.show()
    }

    startGame() {
        this.scoreBoard.reset()

        this.gameGrid.Reset()
        this.gameGrid.Setup()

        this.waveManager.trigger(config.gameStartTime)

        this.playing = true
        this.play()
    }

    play() {
        if (! this.playing) return

        if (this.paused) {
            this.gameGrid.DrawBackground()
        }
        else {
            this.gameGrid.Update()
            this.gameGrid.Draw()
        }

        requestAnimationFrame(this.play.bind(this))
    }

    pause(e) {
        // Look for 'p' or 'P' keys
        if (![80, 112].includes(e.keyCode)) return

        e.stopPropagation()
        this.paused = !this.paused
        console.log(this.paused ? 'Paused' : 'Unpaused')
    }

    unitHit(e) {
        const winner = e.detail.winner
        const loser = e.detail.loser
        console.log(`${winner.name} hit ${loser.name}`)

        this._playerHit(winner, loser)
        this._enemyHit(winner, loser)
    }

    score(e) {
        this.scoreBoard.score(e.detail.points)
    }

    gameOver() {
        console.log('Game Over')
        this.playing = false
        this.overlay.show()
    }

    // -----------------------------------

    _playerHit(winner, loser) {
        if (! loser.isPlayer) return

        // Lose points when the player is hit
        dispatchEvent(
            new CustomEvent('Score', {
                detail: {
                    points: -winner.points
                }
            })
        )

        if (loser.isDead()) {
            this.gameGrid.RemovePlayer()
            dispatchEvent(
                new CustomEvent('GameOver')
            )
        }
    }

    _enemyHit(winner, loser) {
        if (loser.isPlayer) return
        if (! loser.isDead()) return

        this.gameGrid.RemoveEnemy(loser)
        this.waveManager.trigger(config.respawnInterval)
        dispatchEvent(
            new CustomEvent('Score', {
                detail: {
                    points: winner.points
                }
            })
        )
    }
}
