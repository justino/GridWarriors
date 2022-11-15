export class Scoreboard {
    constructor() {
        this.scoreElement = document.getElementById('score')
        this.highScoreElement = document.getElementById('highscore')

        this.score = 0
        this.highScore = localStorage.getItem('highScore') || 0

        addEventListener('Score', this.updateScores.bind(this))

        this.updateBoard()
    }

    updateScores(e) {
        const newScore = this.score + e.detail.score
        if (newScore >= 0)
            this.score = newScore

        if (this.score > this.highScore) {
            this.highScore = this.score
            localStorage.setItem('highScore', this.score)
        }

        this.updateBoard()
    }

    updateBoard() {
        this.scoreElement.innerHTML = this.score
        this.highScoreElement.innerHTML = this.highScore
    }
}
