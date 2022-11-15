import { GameGrid } from "./gamegrid.js"
import { Scoreboard } from "./scoreboard.js"
import { Overlay } from "./overlay.js"

export class Tran {
    constructor() {
        this.scoreBoard = new Scoreboard()
        this.overlay = new Overlay()
        this.gameGrid = new GameGrid()

        this.playing = false
        this.paused = false

        addEventListener('GameOver', this.gameOver.bind(this))
        addEventListener('GameStart', this.gameStart.bind(this))
        addEventListener('keypress', this.pause.bind(this))

        this.overlay.show()
    }

    gameStart() {
        this.gameGrid.reset()
        this.score = 0
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

    gameOver() {
        console.log('Game Over')
        this.playing = false
        this.overlay.show()
    }
}
