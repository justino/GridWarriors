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
            if (this.player.disc.Collided(this.enemies[i])) {
                this.enemies[i].Hit();
                console.log(this.enemies[i].name + ' hit. ' + (this.enemies[i].maxHits - this.enemies[i].hits) + ' left');

                // Check to see if they died
                if (this.enemies[i].hits == this.enemies[i].maxHits) {
                    console.log(this.enemies[i].name + ' derezzed');
                    if (this.enemies[i].regenerateTimer) {
                        window.clearTimeout(this.enemies[i].regenerateTimer);
                    }
                    this.enemies.splice(i, 1);
                }

                // Return disc to player
                this.player.disc.Return();
            }
        }
    }
    // Check for player hits/death
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].disc && this.enemies[i].disc.status == 'deadly' && this.enemies[i].disc.Collided(this.player)) {
            this.player.Hit();
            console.log(this.player.name + ' hit. ' + (this.player.maxHits - this.player.hits) + ' left');

            if (this.player.hits == this.player.maxHits) {
                console.log(this.player.name + ' derezzed');
                console.log('Game Over');
                this.player = null;
                break;
            }

            // Return disc to enemy
            this.enemies[i].disc.Return();
        }
    }

    // Movement
    if (this.player) {
        this.player.Update();

        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Update();
        }
    }
}
