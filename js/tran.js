function Tran(canvas, scoreBoard) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');

    this.scoreBoard = scoreBoard;
    this.gameGrid = new GameGrid(this.canvas);

    this.canvas.width = config.width;
    this.canvas.height = config.height;

    this.scoreTotal = 0;
    this.playing = false;
    this.paused = false;

    addEventListener('GameOver', this.gameOver.bind(this));
    addEventListener('Score', this.score.bind(this));

    addEventListener('keypress', this.pause.bind(this));
    document.querySelector('button.start').addEventListener('click', () => {
        this.hideOverlay();

        this.gameGrid.reset();
        this.playing = true;
        this.play();
    });

    this.showOverlay();
}

Tran.prototype.play = function() {
    if (this.playing) {
        if (! this.paused) {
            this.gameGrid.Update();
            this.gameGrid.Draw();
        }
        else {
            this.gameGrid.DrawBackground();
        }

        requestAnimationFrame(this.play.bind(this));
    }
}

Tran.prototype.score = function(e) {
    // Track score
    this.scoreTotal += e.detail.score;
    this.scoreBoard.querySelector('#score').innerHTML = this.scoreTotal;

    console.log('Updated Scoreboard');
}

Tran.prototype.pause = function(e) {
    if (! [80, 112].includes(e.keyCode)) { return; }

    e.stopPropagation();
    this.paused = ! this.paused;
    console.log(this.paused ? 'Paused' : 'Unpaused');
}

Tran.prototype.gameOver = function() {
    console.log('Game Over');
    this.playing = false;

    this.showOverlay();
}

Tran.prototype.showOverlay = function() {
    var overlay = document.querySelector('.overlay');
    overlay.classList.add('show');
}

Tran.prototype.hideOverlay = function() {
    var overlay = document.querySelector('.overlay');
    overlay.classList.remove('show');
}
