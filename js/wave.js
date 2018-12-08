function Wave() {
    this.timer;
}

Wave.prototype.init = function() {
    this.next();
}

Wave.prototype.next = function() {
    if (tron.gameGrid.enemies.length >= config.enemyCount) return;

    var unitsToSpawn = config.enemyCount - tron.gameGrid.enemies.length;
    console.log(`Spawning ${unitsToSpawn} units`);

    for (var i = 0; i < unitsToSpawn; i++) {
        this.spawnUnit();
    }
}

Wave.prototype.end = function() {
    if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

Wave.prototype.hit = function() {
    this.end();

    this.timer = setTimeout(this.next.bind(this), config.respawnInterval * 1000);
    console.log("Wave triggered");
}

Wave.prototype.spawnUnit = function() {
    var units = [];
    units.push(Warrior);

    var unit = units[Math.floor(Math.random() * units.length)];
    var location = new Vector([ Math.random() * (tron.gameGrid.canvas.width - config.unitSize * 2) + config.unitSize, Math.random() * (tron.gameGrid.canvas.height - config.unitSize * 2) + config.unitSize ]);
    tron.gameGrid.enemies.push(new unit(location));
}
