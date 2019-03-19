Array.prototype.remove = function(value) {
    return this.filter(function(element) {
        return element != value;
    });
}

window.onload = function() {
    console.log('TRAN: Initialize TRAN');
    tran = new Tran(config.width, config.height);
}

function Tran(width, height) {
    this.initCanvas(width, height);
    this.playing = false;

    addEventListener('GameOver', this.gameOver.bind(this));
    document.querySelector('.overlay button').addEventListener('click', () => {
        tran.startGame();
    });

    this.init();
}

Tran.prototype.initCanvas = function(width, height) {
    console.log('TRAN: Init Canvas');
    
    this.canvas = document.getElementById('gamegrid');
    this.canvas.width = width;
    this.canvas.height = height;
}

Tran.prototype.init = function() {
    this.overlay();
}

Tran.prototype.startGame = function() {
    this.overlay(true);

    this.gameGrid = new GameGrid();
    this.gameGrid.init();
    this.gameGrid.Draw();

    this.playing = true;
    this.play();
}

Tran.prototype.play = function() {
    this.gameGrid.Update();
    this.gameGrid.Draw();
    
    if (this.playing) {
        requestAnimationFrame(this.play.bind(this));
    }
}

Tran.prototype.gameOver = function() {
    console.log('Game Over');
    this.playing = false;

    this.init();
}

Tran.prototype.overlay = function(hide = false) {
    var overlay = document.querySelector('.overlay');
    var func = 'add';
    if (hide) {
        func = 'remove';
    }

    overlay.classList[func]('show');
}