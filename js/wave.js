function Wave() {
    this.timer;
    this.count = 0;

    this.trigger();
}

Wave.prototype.next = function() {
    if (tran.gameGrid.enemies.length >= config.enemyCount) return;
    this.count++;

    var unitsToSpawn = config.enemyCount - tran.gameGrid.enemies.length;
    console.log(`Wave ${this.count}: Spawning ${unitsToSpawn} units`);

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

Wave.prototype.trigger = function(interval = config.respawnInterval) {
    this.end();

    if (! interval) { interval = config.gameStartTime; }

    this.timer = setTimeout(this.next.bind(this), interval * 1000);
    console.log("Wave triggered");

    if (this.isCleared()) {
        // Wave cleared, extra points
        dispatchEvent(new CustomEvent('Score', { detail: { score: 250 } }));
        console.log("Wave Cleared");
    }
}

Wave.prototype.spawnUnit = function() {
    var units = [];

    if (this.count > 10) units.push(Leader);
    if (this.count > 5) units.push(Bulldog);
    units.push(Warrior);

    var unit = units[Math.floor(Math.random() * units.length)];
    var location = new Vector([
        Math.random() * (tran.canvas.width - config.unitSize * 2) + config.unitSize,
        Math.random() * (tran.canvas.height - config.unitSize * 2) + config.unitSize
    ]);

    tran.gameGrid.enemies.push(new unit(location));
}

Wave.prototype.isCleared = function() {
    return (this.count > 0 && tran.gameGrid.enemies.length === 0);
}
