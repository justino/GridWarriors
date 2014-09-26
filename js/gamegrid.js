function GameGrid(canvas) {
    console.log("Grid: Rezzing");
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.init();
}

GameGrid.prototype.init = function() {
    this.player = new Player(this, new Vector([this.canvas.width / 2, this.canvas.height / 2]));
    // This will be managed by Waves
    this.enemies = [
        new Warrior(this, new Vector([ Math.random() * (this.canvas.width - config.unitSize) + config.unitSize, Math.random() * (this.canvas.height - config.unitSize) + config.unitSize ])),
        new Warrior(this, new Vector([ Math.random() * (this.canvas.width - config.unitSize) + config.unitSize, Math.random() * (this.canvas.height - config.unitSize) + config.unitSize ])),
        new Warrior(this, new Vector([ Math.random() * (this.canvas.width - config.unitSize) + config.unitSize, Math.random() * (this.canvas.height - config.unitSize) + config.unitSize ]))
    ];
}

GameGrid.prototype.Draw = function() {
    this.DrawBackground();
    this.player.Draw();
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Draw();
    }
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
