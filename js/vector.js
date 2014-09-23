function Vector(points) {
    this.points = points;
    this.dimensions = this.points.length;
}

// Proto Functions
Vector.prototype.Add = function(vector) {
    if (this.dimensions != vector.dimensions) {
        throw "Cannot add vectors of different dimensions"
    }
    
    for (var i = 0; i < this.dimensions; i++) {
        this.points[i] += vector.points[i];
    }
}

Vector.prototype.Sub = function(vector) {
    if (this.dimensions != vector.dimensions) {
        throw "Cannot subtract vectors of different dimensions"
    }
    
    for (var i = 0; i < this.dimensions; i++) {
        this.points[i] -= vector.points[i];
    }
}

Vector.prototype.Mul = function(n) {
    for (var i = 0; i < this.dimensions; i++) {
        this.points[i] *= n;
    }
}

Vector.prototype.Div = function(n) {
    if (n == 0) {
        throw "Cannot divide a vector by zero"
    }
    
    for (var i = 0; i < this.dimensions; i++) {
        this.points[i] /= n;
    }
}

Vector.prototype.Magnitude = function() {
    var x = 0;
    for (var i = 0; i < this.dimensions; i++) {
        x += Math.pow(this.points[i], 2);
    }
    
    return Math.sqrt(x);
}

Vector.prototype.Normalize = function() {
    var mag = this.Magnitude();
    
    if (mag != 0) {
        this.Div(mag);
    }
}

Vector.prototype.Limit = function(max) {
    if (this.Magnitude() > max) {
        this.Normalize();
        this.Mul(max)
    }
}
Vector.prototype.Clone = function() {
    return new Vector(this.points);
}

// Static Functions
Vector.Random2D = function() {
    var vector = new Vector([Math.random(), Math.random()]);
    vector.Normalize();
    
    return vector;
}

Vector.AddFactory = function(a, b) {
    var vector = new Vector(a.points);
    vector.Add(b);
    
    return vector;
}

Vector.SubFactory = function(a, b) {
    var vector = new Vector(a.points);
    vector.Sub(b);
    
    return vector;
}