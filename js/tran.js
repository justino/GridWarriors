function Tran(canvas, scoreBoard) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');

    this.scoreBoard = scoreBoard;
    this.gameGrid = new GameGrid(this.canvas);

    this.canvas.width = config.width;
    this.canvas.height = config.height;

    this.scoreTotal = 0;
    this.playing = false;

    addEventListener('GameOver', this.gameOver.bind(this));
    addEventListener('Score', this.score.bind(this));

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
        this.gameGrid.Update();
        this.gameGrid.Draw();
        requestAnimationFrame(this.play.bind(this));
    }
}

Tran.prototype.score = function(e) {
    // Track score
    this.scoreTotal += e.detail.score;
    this.scoreBoard.querySelector('#score').innerHTML = this.scoreTotal;

    console.log('Updated Scoreboard');
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
