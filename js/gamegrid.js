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
        new Bulldog(this, new Vector([ Math.random() * (this.canvas.width - config.unitSize) + config.unitSize, Math.random() * (this.canvas.height - config.unitSize) + config.unitSize ]))
    ];
}

GameGrid.prototype.Draw = function() {
    this.DrawBackground();
    if (this.player) { this.player.Draw() };
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Draw();
    }
}

GameGrid.prototype.DrawBackground = function() {
    this.context.fillStyle = config.gridColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

GameGrid.prototype.Update = function() {
    if (! this.player) { return; }
    
    // Check for hits/deaths by player
    if (this.player.disc.status == 'deadly') {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies.state == 'ready' && this.player.disc.Collision(this.enemies[i])) {
                this.enemies[i].hit();

                // Check to see if they died
                if (this.enemies[i].state == 'derezzed') {
                    this.enemies.splice(i, 1);
                }
            }
        }
    }
    // Check for player hits/death
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].disc && this.enemies[i].disc.status == 'deadly' && this.enemies[i].disc.Collision(this.player)) {
            this.player.hits += 1;
            console.log(this.player.name + ' hit. ' + (this.player.maxHits - this.player.hits) + ' left');
            
            if (this.player.hits == this.player.maxHits) {
                console.log(this.player.name + ' derezzed');
                console.log('Game Over');
                this.player = null;
            }
        }
    }
    
    // Movement
    if (this.player) { this.player.Update(); }
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Update();
    }
}