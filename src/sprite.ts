import { Vector } from "@/vector"
import { GameGrid } from "@/gamegrid"

export class Sprite {
    public gameGrid: GameGrid
    public name: string
    protected width: number
    protected height: number
    protected color: string
    public location: Vector

    protected velocity: Vector

    constructor(gameGrid: GameGrid, name: string, width: number, height: number, color: string, location: Vector) {
        this.gameGrid = gameGrid
        this.name = name
        this.width = width
        this.height = height
        this.color = color

        this.location = Vector.clone(location)

        this.velocity = new Vector([0, 0])

        console.log('Sprite: ' + this.name + ' Rezzed')
    }

    changeWidth(width: number) {
        this.width = width
    }

    changeHeight(height: number) {
        this.height = height
    }

    // Always built from the current location and size, so it can never be out of date
    get boundingBox(): [number, number, number, number] {
        return [
            this.location.points[0] - Math.round(this.width / 2),
            this.location.points[1] - Math.round(this.height / 2),
            this.location.points[0] + Math.round(this.width / 2),
            this.location.points[1] + Math.round(this.height / 2)
        ]
    }

    // Keep the sprite inside the grid. Returns the walls it hit, each as the direction
    // that wall faces (into the grid), empty if it didn't hit any
    bindToGameGrid() {
        const walls: Vector[] = []

        // Top
        if (this.boundingBox[1] < 0) {
            walls.push(new Vector([0, 1]))
            this.location.points[1] = 0 + Math.round(this.height / 2)
        }

        // Bottom
        if (this.boundingBox[3] > this.gameGrid.canvas.height) {
            walls.push(new Vector([0, -1]))
            this.location.points[1] = this.gameGrid.canvas.height - Math.round(this.height / 2)
        }

        // Left
        if (this.boundingBox[0] < 0) {
            walls.push(new Vector([1, 0]))
            this.location.points[0] = 0 + Math.round(this.width / 2)
        }

        // Right
        if (this.boundingBox[2] > this.gameGrid.canvas.width) {
            walls.push(new Vector([-1, 0]))
            this.location.points[0] = this.gameGrid.canvas.width - Math.round(this.width / 2)
        }

        return walls
    }

    isCollidedWith(sprite: Sprite) {
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

    touchLocation(location: Vector) {
        this.gameGrid.context.beginPath()
        this.gameGrid.context.rect(
            this.boundingBox[0], this.boundingBox[1],
            this.width, this.height
        )
        return this.gameGrid.context.isPointInPath(...location.points)
    }

    drawSprite() {
        this.gameGrid.context.fillStyle = this.color
        this.gameGrid.context.fillRect(
            this.boundingBox[0], this.boundingBox[1],
            this.width, this.height
        )
    }
}
