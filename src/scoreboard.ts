export class Scoreboard {
    private scoreElement: HTMLElement
    private highScoreElement: HTMLElement

    private currentScore: number
    private highScore: number

    constructor() {
        const score = document.getElementById('score')
        if (! score) throw new Error('Unable to find Score element')
        this.scoreElement =  score

        const highScore = document.getElementById('highscore')
        if (! highScore) throw new Error('Unable to find Highscore element')
        this.highScoreElement = highScore

        this.currentScore = 0
        this.highScore = this.getHighScore()

        this.updateBoard()
    }

    public reset() {
        this.currentScore = 0
        this.highScore = this.getHighScore()
    }

    public score(points: number) {
        const newScore = this.currentScore + points
        if (newScore >= 0)
            this.currentScore = newScore

        this.updateHighScore()
        this.updateBoard()
    }

    private getHighScore() {
        let highScore = 0
        try {
            highScore = parseInt(localStorage.getItem('highScore') || '0')
        }
        catch {}

        return highScore
    }

    private updateHighScore() {
        if (this.currentScore <= this.highScore) return

        this.highScore = this.currentScore
        localStorage.setItem('highScore', this.highScore.toString())
    }

    private updateBoard() {
        this.scoreElement.innerHTML = this.currentScore.toString()
        this.highScoreElement.innerHTML = this.highScore.toString()
    }
}
