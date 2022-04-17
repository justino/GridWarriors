export class Vector {
    constructor(points) {
        this.points = points;
        this.dimensions = this.points.length;
    }

    Add(vector) {
        if (this.dimensions != vector.dimensions) {
            throw "Cannot add vectors of different dimensions";
        }

        for (var i = 0; i < this.dimensions; i++) {
            this.points[i] += vector.points[i];
        }
    }

    Sub(vector) {
        if (this.dimensions != vector.dimensions) {
            throw "Cannot subtract vectors of different dimensions";
        }

        for (var i = 0; i < this.dimensions; i++) {
            this.points[i] -= vector.points[i];
        }
    }

    Mul(n) {
        for (var i = 0; i < this.dimensions; i++) {
            this.points[i] *= n;
        }
    }

    Div(n) {
        if (n == 0) {
            throw "Cannot divide a vector by zero";
        }

        for (var i = 0; i < this.dimensions; i++) {
            this.points[i] /= n;
        }
    }

    Magnitude() {
        var x = 0;
        for (var i = 0; i < this.dimensions; i++) {
            x += Math.pow(this.points[i], 2);
        }

        return Math.sqrt(x);
    }

    Normalize() {
        var mag = this.Magnitude();

        if (mag != 0) {
            this.Div(mag);
        }
    }

    Limit(max) {
        if (this.Magnitude() > max) {
            this.Normalize();
            this.Mul(max);
        }
    }

    Distance(vector) {
        return Math.sqrt(
            Math.abs(
                Math.pow(vector.points[0] - this.points[0], 2) +
                Math.pow(vector.points[1] - this.points[1], 2)
            )
        );
    }

    static Random2D(width, height) {
        var vector = new Vector([
            Math.round(Math.random() * width),
            Math.round(Math.random() * height)
        ]);

        return vector;
    }

    static AddFactory(a, b) {
        var vector = Vector.Clone(a);
        vector.Add(b);

        return vector;
    }

    static SubFactory(a, b) {
        var vector = Vector.Clone(a);
        vector.Sub(b);

        return vector;
    }

    static Clone(oldVector) {
        return new Vector(oldVector.points.slice(0));
    }
}
