window.onload = function() {
    // Build Animation System
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback) {
               window.setTimeout(callback, 1000 / 60);
            };
    })();
    
    console.log('TRON: Initialize TRON');
    tron = new Tron(config.width, config.height);
    tron.Play();
}

function Tron(width, height) {
    this.initCanvas(width, height);
    
    this.gameGrid = new GameGrid(this.canvas);
    this.gameGrid.Draw();
}

Tron.prototype.initCanvas = function(width, height) {
    console.log('TRON: Init Canvas');
    
    this.canvas = document.getElementById('gamegrid');
    this.canvas.width = width;
    this.canvas.height = height;
}

Tron.prototype.Play = function() {
    this.gameGrid.Update();
    this.gameGrid.Draw();
    
    requestAnimFrame(this.Play.bind(this));
}