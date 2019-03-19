Array.prototype.remove = function(value) {
    return this.filter(function(element) {
        return element != value;
    });
}

window.onload = function() {
    // Build Animation System
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback) {
               setTimeout(callback, 1000 / 60);
            };
    })();
    
    console.log('TRAN: Initialize TRAN');
    tran = new Tran(config.width, config.height);
    tran.init();
    tran.play();
}

function Tran(width, height) {
    this.initCanvas(width, height);
}

Tran.prototype.initCanvas = function(width, height) {
    console.log('TRAN: Init Canvas');
    
    this.canvas = document.getElementById('gamegrid');
    this.canvas.width = width;
    this.canvas.height = height;
}

Tran.prototype.init = function() {
    this.gameGrid = new GameGrid();
    this.gameGrid.init();
    this.gameGrid.Draw();
}

Tran.prototype.play = function() {
    this.gameGrid.Update();
    this.gameGrid.Draw();
    
    requestAnimFrame(this.play.bind(this));
}
