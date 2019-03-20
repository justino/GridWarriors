function GameGrid(canvas) {
    console.log("Grid: Rezzing");

    addEventListener('UnitHit', this.unitHit);
}

GameGrid.prototype.reset = function() {
    this.enemies = [];
    this.player = new Player(
        new Vector([tran.canvas.width / 2, tran.canvas.height / 2])
    );
    this.wave = new Wave();
}

GameGrid.prototype.Draw = function() {
    this.DrawBackground();

    if (this.player) { this.player.Draw() };
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].Draw();
    }
}

GameGrid.prototype.DrawBackground = function() {
    tran.context.fillStyle = config.gridColor;
    tran.context.fillRect(0, 0, tran.canvas.width, tran.canvas.height);
}

GameGrid.prototype.Update = function() {
    if (! this.player) { return; }

    // Check for hits/deaths by player
    if (this.player.disc.status === 'deadly') {
        for (var enemy of this.enemies) {
            this.player.disc.checkCollide(enemy);
        }
    }

    // Check for player hits/death
    for (var enemy of this.enemies) {
        enemy.disc.checkCollide(this.player);
    }

    // Movement
    if (this.player) {
        this.player.Update();

        for (var enemy of this.enemies) {
            enemy.Update();
        }
    }
}

GameGrid.prototype.unitHit = function(e) {
    console.log('Disc Collided');

    e.detail.loser.Hit(e.detail.winner.disc.strength);

    if (e.detail.winner.isPlayer) {
        if (e.detail.loser.isDead()) {
            dispatchEvent(new CustomEvent('Score', { detail: { score: e.detail.loser.points } }));

            e.detail.loser.remove();
            tran.gameGrid.wave.trigger();
        }
    }
    else {
        if (e.detail.loser.isDead()) {
            e.detail.loser.remove();
            tran.gameGrid.player = null;
            dispatchEvent(new Event('GameOver'));
        }
    }
}
