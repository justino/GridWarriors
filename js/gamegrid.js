function GameGrid() {
    console.log("Grid: Rezzing");
    this.canvas = tron.canvas;
    this.context = this.canvas.getContext('2d');

    this.score = 0;
    this.enemies = [];
}

GameGrid.prototype.init = function() {
    this.player = new Player(new Vector([this.canvas.width / 2, this.canvas.height / 2]));
    this.wave = new Wave();

    // Event listeners
    addEventListener('UnitHit', this.unitHit);
    addEventListener('Score', this.updateScoreboard);
    addEventListener('GameOver', this.gameOver);

    // Begin game
    this.wave.init();
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

    e.detail.loser.Hit();
    e.detail.winner.disc.Return();

    if (e.detail.winner.isPlayer) {
        if (e.detail.loser.isDead()) {
            tron.gameGrid.score += e.detail.loser.points;
            dispatchEvent(new CustomEvent('Score', { detail: { score: tron.gameGrid.score } }));

            e.detail.loser.remove();
            tron.gameGrid.wave.hit();
        }
    }
    else {
        if (e.detail.loser.isDead()) {
            e.detail.loser.remove();
            tron.gameGrid.player = null;
            dispatchEvent(new Event('GameOver'));
        }
    }
}

GameGrid.prototype.updateScoreboard = function(e) {
    document.querySelector('#score').innerHTML = e.detail.score;

    console.log('Updated scoreboard');
}

GameGrid.prototype.gameOver = function(e) {
    console.log('Game Over');
}
