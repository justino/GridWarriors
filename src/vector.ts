type twod = [number, number]

export class Vector {
    public points: twod
    public dimensions: number

    constructor(points: twod) {
        this.points = points
        this.dimensions = this.points.length
    }

    add(vector: Vector) {
        if (this.dimensions !== vector.dimensions) {
            throw "Cannot add vectors of different dimensions"
        }

        for (let i = 0; i < this.dimensions; i++) {
            this.points[i] += vector.points[i]
        }
    }

    sub(vector: Vector) {
        if (this.dimensions !== vector.dimensions) {
            throw "Cannot subtract vectors of different dimensions"
        }

        for (let i = 0; i < this.dimensions; i++) {
            this.points[i] -= vector.points[i]
        }
    }

    mul(n: number) {
        for (let i = 0; i < this.dimensions; i++) {
            this.points[i] *= n
        }
    }

    div(n: number) {
        if (n === 0) {
            throw "Cannot divide a vector by zero"
        }

        for (let i = 0; i < this.dimensions; i++) {
            this.points[i] /= n
        }
    }

    magnitude() {
        let x = 0
        for (let i = 0; i < this.dimensions; i++) {
            x += Math.pow(this.points[i], 2)
        }

        return Math.sqrt(x)
    }

    normalize() {
        const mag = this.magnitude()

        if (mag !== 0) {
            this.div(mag)
        }
    }

    angle() {
        const rads = Math.atan2(this.points[0], this.points[1])
        const degs = (180 * rads / Math.PI) - 90
        return (360 + Math.round(degs)) % 360
    }

    limit(max: number) {
        if (this.magnitude() > max) {
            this.normalize()
            this.mul(max)
        }
    }

    distance(vector: Vector) {
        return Math.sqrt(
            Math.abs(
                Math.pow(vector.points[0] - this.points[0], 2) +
                Math.pow(vector.points[1] - this.points[1], 2)
            )
        )
    }

    static random2D(width: number, height: number) {
        const vector = new Vector([
            Math.round(Math.random() * width),
            Math.round(Math.random() * height)
        ])

        return vector
    }

    static addFactory(a: Vector, b: Vector) {
        const vector = Vector.clone(a)
        vector.add(b)

        return vector
    }

    static subFactory(a: Vector, b: Vector) {
        const vector = Vector.clone(a)
        vector.sub(b)

        return vector
    }

    static clone(oldVector: Vector) {
        return new Vector([...oldVector.points])
    }
}
