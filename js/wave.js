function Wave(gameGrid) {
    this.gameGrid = gameGrid;
    this.timer;
}

Wave.prototype.init = function() {
    this.next();
}

Wave.prototype.next = function() {
    if (this.gameGrid.enemies.length >= config.enemyCount) return;

    var unitsToSpawn = config.enemyCount - this.gameGrid.enemies.length;
    console.log(`Respawning ${unitsToSpawn} units`);

    for (var i = 0; i < unitsToSpawn; i++) {
        this.spawnUnit();
    }
}

Wave.prototype.end = function() {
    if (this.timer) {
        window.clearTimeout(this.timer);
    }
}

Wave.prototype.hit = function() {
    this.end();

    this.timer = window.setTimeout(this.next.bind(this), config.respawnInterval * 1000);
}

Wave.prototype.spawnUnit = function() {
    var units = [];
    units.push(Warrior);

    var unit = units[Math.floor(Math.random() * units.length)];
    var location = new Vector([ Math.random() * (this.gameGrid.canvas.width - config.unitSize * 2) + config.unitSize, Math.random() * (this.gameGrid.canvas.height - config.unitSize * 2) + config.unitSize ]);
    this.gameGrid.enemies.push(new unit(this.gameGrid, location));
}
