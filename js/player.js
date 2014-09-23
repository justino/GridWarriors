// Special Type of Unit

function Player(gameGrid) { 
    Unit.call(this, 'Player', gameGrid);
    
    this.color = 'rgba(255, 0, 0, 1)'
    this.isPlayer = true;
    this.canBlock = true;
    this.regenerates = true;
    this.hits = 3;
    
    this.disc = new Yellow();
    this.location = new Vector([this.canvas.width / 2, this.canvas.height / 2]); // Starting Location
}
Player.prototype = Object.create(Unit.prototype);

Player.prototype.Update = function() {
    this.UpdateLocation();
    this.UpdateDisc();
}

Player.prototype.UpdateLocation = function() {
    var velocity = new Vector([0, 0]);
    
    // Move around based on keyboard input
    if (KeyboardState.isDown(KeyboardState.DOWN))  { velocity.points[1] += (this.baseSpeed + this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.UP))    { velocity.points[1] -= (this.baseSpeed + this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.LEFT))  { velocity.points[0] -= (this.baseSpeed + this.speedModifier); }
    if (KeyboardState.isDown(KeyboardState.RIGHT)) { velocity.points[0] += (this.baseSpeed + this.speedModifier); }
    
    this.location.Add(velocity);
}

Player.prototype.UpdateDisc = function() {
}