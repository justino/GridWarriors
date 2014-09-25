function GameGrid(canvas) {
    console.log("Grid: Rezzing");
    this.canvas = canvas;
    this.init();
}

GameGrid.prototype.init = function() {
    this.player = new Player(this, new Vector([this.canvas.width / 2, this.canvas.height / 2]));
    this.enemies = [];
}

GameGrid.prototype.Draw = function() {
    context = this.canvas.getContext('2d');
    
    this.DrawBackground();
    this.player.Draw();
}

GameGrid.prototype.DrawBackground = function() {
    context = this.canvas.getContext('2d');
    context.fillStyle = config.gridColor;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

GameGrid.prototype.Update = function() {
    // Discs
    // TODO
    
    // Movement
    this.player.Update();
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Update();
    }
}
