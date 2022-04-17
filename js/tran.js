import { GameGrid } from "./gamegrid.js"
import config from "./config.js"

export class Tran {
    constructor(canvas, scoreBoard) {
        this.canvas = canvas;
        this.canvas.width = config.width;
        this.canvas.height = config.height;

        this.scoreBoard = scoreBoard;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;

        this.gameGrid = new GameGrid(config, this.canvas);

        this.playing = false;
        this.paused = false;

        addEventListener('GameOver', this.gameOver.bind(this));
        addEventListener('Score', this.updateScore.bind(this));

        addEventListener('keypress', this.pause.bind(this));
        document.querySelector('button.start').addEventListener('click', () => {
            this.hideOverlay();

            this.gameGrid.reset();
            this.score = 0;
            this.playing = true;
            this.play();
        });

        this.updateHighScore();
        this.showOverlay();
    }

    play() {
        if (this.playing) {
            if (!this.paused) {
                this.gameGrid.Update();
                this.gameGrid.Draw();
            }
            else {
                this.gameGrid.DrawBackground();
            }

            requestAnimationFrame(this.play.bind(this));
        }
    }

    updateScore(e) {
        // Track score
        this.score += e.detail.score;
        this.scoreBoard.querySelector('#score').innerHTML = this.score;

        this.updateHighScore();

        console.log('Updated Scoreboard');
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        this.scoreBoard.querySelector('#highscore').innerHTML = this.highScore;
    }

    pause(e) {
        if (![80, 112].includes(e.keyCode)) { return; }

        e.stopPropagation();
        this.paused = !this.paused;
        console.log(this.paused ? 'Paused' : 'Unpaused');
    }

    gameOver() {
        console.log('Game Over');
        this.playing = false;

        this.showOverlay();
    }

    showOverlay() {
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('show');
    }

    hideOverlay() {
        var overlay = document.querySelector('.overlay');
        overlay.classList.remove('show');
    }
}
