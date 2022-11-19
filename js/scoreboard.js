export class Scoreboard {
    constructor() {
        this.scoreElement = document.getElementById('score')
        this.highScoreElement = document.getElementById('highscore')

        this.currentScore = 0
        this.highScore = this._getHighScore()

        this._updateBoard()
    }

    score(points) {
        const newScore = this.currentScore + points
        if (newScore >= 0)
            this.currentScore = newScore

        this._updateHighScore()
        this._updateBoard()
    }

    _getHighScore() {
        const highScore = localStorage.getItem('highScore') || 0
        try {
            parseInt(highScore)
        }
        catch {
            highScore = 0
        }

        return highScore
    }

    _updateHighScore() {
        if (this.currentScore <= this.highScore) return

        this.highScore = this.currentScore
        localStorage.setItem('highScore', this.highScore)
    }

    _updateBoard() {
        this.scoreElement.innerHTML = this.currentScore
        this.highScoreElement.innerHTML = this.highScore
    }
}
