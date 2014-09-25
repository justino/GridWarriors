function Sprite(name, gameGrid, width, height, color, location) {
    this.name = name;
    this.gameGrid = gameGrid;
    this.width = width;
    this.height = height;
    this.color = color;
    this.location = Vector.Clone(location);
    
    this.canvas = this.gameGrid.canvas;
    this.context = this.canvas.getContext('2d');
    this.buildBoundingBox();
    
    // Filled in by child class
    this.velocity = null;
    
    console.log('Sprite: ' + this.name + ' Rezzed');
}

Sprite.prototype.changeWidth = function(width) {
    this.width = width;
}

Sprite.prototype.changeHeight = function(height) {
    this.height = height;
}

Sprite.prototype.buildBoundingBox = function() {
    this.boundingBox = [
        this.location.points[0] - Math.round(this.width  / 2),  // Left
        this.location.points[1] - Math.round(this.height / 2),  // Top
        this.location.points[0] + Math.round(this.width  / 2),  // Right
        this.location.points[1] + Math.round(this.height / 2)   // Bottom
    ];
}

Sprite.prototype.bindToGameGrid = function() {
    var bounded = [0, 0];
    
    // Top
    if (this.boundingBox[1] < 0) {
        bounded[1] = 1; // Y-axis
        this.location.points[1] = 0 + Math.round(this.height / 2);
    }
    
    // Bottom
    if (this.boundingBox[3] > this.canvas.height) {
        bounded[1] = 1; // Y-axis
        this.location.points[1] = this.canvas.height - Math.round(this.height / 2);
    }
    
    // Left
    if (this.boundingBox[0] < 0) {
        bounded[0] = 1; // X-axis
        this.location.points[0] = 0 + Math.round(this.width / 2);
    }
    
    // Right
    if (this.boundingBox[2] > this.canvas.width) {
        bounded[0] = 1; // X-axis
        this.location.points[0] = this.canvas.width - Math.round(this.width / 2);
    }
    
    return bounded;
}

Sprite.prototype.Collision = function(sprite) {
    // See if the 2 boxes intersect in any way
    this.context.beginPath()
    this.context.rect(
        sprite.boundingBox[0], sprite.boundingBox[1],
        sprite.width, sprite.height
    );

    return (
        this.context.isPointInPath(this.boundingBox[0], this.boundingBox[1]) ||
        this.context.isPointInPath(this.boundingBox[2], this.boundingBox[1]) ||
        this.context.isPointInPath(this.boundingBox[0], this.boundingBox[3]) ||
        this.context.isPointInPath(this.boundingBox[2], this.boundingBox[3]) ||
        this.context.isPointInPath(this.location.points[0], this.location.points[1])
    );
}

Sprite.prototype.DrawSprite = function() {
    this.buildBoundingBox()
    
    this.context.fillStyle = this.color;
    this.context.fillRect(
        this.boundingBox[0], this.boundingBox[1],
        this.width, this.height
    );
}