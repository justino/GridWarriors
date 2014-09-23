function GameGrid(canvas) {
    console.log("Grid: Building");
    this.canvas = canvas;
    this.init();
}

GameGrid.prototype.init = function() {
    this.player = new Player(this);
    this.enemies = [];
}

GameGrid.prototype.Draw = function() {
    context = this.canvas.getContext('2d');
    
    this.DrawBackground();
    this.player.Draw();
}

GameGrid.prototype.DrawBackground = function() {
    context = this.canvas.getContext('2d');
    context.fillStyle = 'rgba(225, 225, 225, 1)';
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

GameGrid.prototype.Update = function() {
    // Movement
    this.player.Update();
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Update();
    }
    
    // Discs
    // TODO
}
