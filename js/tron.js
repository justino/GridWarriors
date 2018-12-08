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
    
    console.log('TRON: Initialize TRON');
    tron = new Tron(config.width, config.height);
    tron.init();
    tron.play();
}

function Tron(width, height) {
    this.initCanvas(width, height);
}

Tron.prototype.initCanvas = function(width, height) {
    console.log('TRON: Init Canvas');
    
    this.canvas = document.getElementById('gamegrid');
    this.canvas.width = width;
    this.canvas.height = height;
}

Tron.prototype.init = function() {
    this.gameGrid = new GameGrid();
    this.gameGrid.init();
    this.gameGrid.Draw();
}

Tron.prototype.play = function() {
    this.gameGrid.Update();
    this.gameGrid.Draw();
    
    requestAnimFrame(this.play.bind(this));
}