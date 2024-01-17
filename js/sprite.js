import { Vector } from "./vector.js"

export class Sprite {
    constructor(gameGrid, name, width, height, color, location) {
        this.gameGrid = gameGrid
        this.name = name
        this.width = width
        this.height = height
        this.color = color

        this.location = Vector.Clone(location)

        this.buildBoundingBox()

        // Filled in by child class
        this.velocity = null

        console.log('Sprite: ' + this.name + ' Rezzed')
    }

    changeWidth(width) {
        this.width = width
    }

    changeHeight(height) {
        this.height = height
    }

    buildBoundingBox() {
        this.boundingBox = [
            this.location.points[0] - Math.round(this.width / 2),
            this.location.points[1] - Math.round(this.height / 2),
            this.location.points[0] + Math.round(this.width / 2),
            this.location.points[1] + Math.round(this.height / 2)
        ]
    }

    bindToGameGrid() {
        const bounded = [0, 0]

        // Top
        if (this.boundingBox[1] < 0) {
            bounded[1] = 1 // Y-axis
            this.location.points[1] = 0 + Math.round(this.height / 2)
        }

        // Bottom
        if (this.boundingBox[3] > this.gameGrid.canvas.height) {
            bounded[1] = 1 // Y-axis
            this.location.points[1] = this.gameGrid.canvas.height - Math.round(this.height / 2)
        }

        // Left
        if (this.boundingBox[0] < 0) {
            bounded[0] = 1 // X-axis
            this.location.points[0] = 0 + Math.round(this.width / 2)
        }

        // Right
        if (this.boundingBox[2] > this.gameGrid.canvas.width) {
            bounded[0] = 1 // X-axis
            this.location.points[0] = this.gameGrid.canvas.width - Math.round(this.width / 2)
        }

        return bounded
    }

    Collision(sprite) {
        // See if the 2 boxes intersect in any way
        this.gameGrid.context.beginPath()
        this.gameGrid.context.rect(
            sprite.boundingBox[0], sprite.boundingBox[1],
            sprite.width, sprite.height
        )

        return (
            this.gameGrid.context.isPointInPath(this.boundingBox[0], this.boundingBox[1]) ||
            this.gameGrid.context.isPointInPath(this.boundingBox[2], this.boundingBox[1]) ||
            this.gameGrid.context.isPointInPath(this.boundingBox[0], this.boundingBox[3]) ||
            this.gameGrid.context.isPointInPath(this.boundingBox[2], this.boundingBox[3]) ||
            this.gameGrid.context.isPointInPath(this.location.points[0], this.location.points[1])
        )
    }

    TouchLocation(location) {
        this.gameGrid.context.beginPath()
        this.gameGrid.context.rect(...this.boundingBox)
        return this.gameGrid.context.isPointInPath(...location.points)
    }

    DrawSprite() {
        this.buildBoundingBox()

        this.gameGrid.context.fillStyle = this.color
        this.gameGrid.context.fillRect(
            this.boundingBox[0], this.boundingBox[1],
            this.width, this.height
        )
    }
}
