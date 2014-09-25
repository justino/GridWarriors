function GameGrid(canvas) {
    console.log("Grid: Rezzing");
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.init();
}

GameGrid.prototype.init = function() {
    this.player = new Player(this, new Vector([this.canvas.width / 2, this.canvas.height / 2]));
    this.enemies = [];
}

GameGrid.prototype.Draw = function() {
    this.DrawBackground();
    this.player.Draw();
}

GameGrid.prototype.DrawBackground = function() {
    this.context.fillStyle = config.gridColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

GameGrid.prototype.Update = function() {
    // Movement
    this.player.Update();
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Update();
    }
}
