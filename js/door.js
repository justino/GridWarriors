import config from "./config.js"
import { Vector } from "./vector.js"
import { UnitFacings } from "./units/unit.js"

export const DoorStates = Object.freeze({
    CLOSED: { color: config.doorClosedColor },
    OPEN:   { color: config.doorOpenColor },
    JAMMED: { color: config.doorJammedColor }
})

export const DoorOrientations = Object.freeze({
    HORIZONTAL: Symbol("horizontal"),
    VERTICAL:   Symbol("vertical")
})

export const DoorSides = Object.freeze({
    TOP:    Symbol("top"),
    BOTTOM: Symbol("bottom"),
    LEFT:   Symbol("left"),
    RIGHT:  Symbol("right")
})

export const DoorPositions = Object.freeze({
    TOPLEFT:      { side: DoorSides.TOP,    orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.DOWN,  teleportsTo: 'BOTTOMLEFT' },
    TOPCENTER:    { side: DoorSides.TOP,    orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.DOWN,  teleportsTo: 'BOTTOMCENTER' },
    TOPRIGHT:     { side: DoorSides.TOP,    orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.DOWN,  teleportsTo: 'BOTTOMRIGHT' },
    BOTTOMLEFT:   { side: DoorSides.BOTTOM, orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.UP,    teleportsTo: 'TOPLEFT' },
    BOTTOMCENTER: { side: DoorSides.BOTTOM, orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.UP,    teleportsTo: 'TOPCENTER' },
    BOTTOMRIGHT:  { side: DoorSides.BOTTOM, orientation: DoorOrientations.HORIZONTAL, facing: UnitFacings.UP,    teleportsTo: 'TOPRIGHT' },
    LEFTTOP:      { side: DoorSides.LEFT,   orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.RIGHT, teleportsTo: 'RIGHTTOP' },
    LEFTCENTER:   { side: DoorSides.LEFT,   orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.RIGHT, teleportsTo: 'RIGHTCENTER' },
    LEFTBOTTOM:   { side: DoorSides.LEFT,   orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.RIGHT, teleportsTo: 'RIGHTBOTTOM' },
    RIGHTTOP:     { side: DoorSides.RIGHT,  orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.LEFT,  teleportsTo: 'LEFTTOP' },
    RIGHTCENTER:  { side: DoorSides.RIGHT,  orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.LEFT,  teleportsTo: 'LEFTCENTER' },
    RIGHTBOTTOM:  { side: DoorSides.RIGHT,  orientation: DoorOrientations.VERTICAL,   facing: UnitFacings.LEFT,  teleportsTo: 'LEFTBOTTOM' },
})

export class Door {
    constructor(gameGrid, position) {
        this.gameGrid = gameGrid
        this.canvas = this.gameGrid.canvas
        this.context = this.gameGrid.context

        this.position = position
        this.rect = []
        this.location
        this.width = 0
        this.height = 0

        this.state = DoorStates.CLOSED

        this.spawnLocation

        this.Setup()
    }

    Setup() {
        const sectorWidth = this.canvas.width / 13
        const sectorHeight = this.canvas.height / 13
        const doorThickness = config.doorThickness

        let widthOffset = 0
        let heightOffset = 0

        // Widths and Heights
        if (this.position.orientation === DoorOrientations.HORIZONTAL) {
            this.width = sectorWidth * .66
            this.height = doorThickness
            widthOffset = sectorWidth - ((sectorWidth - this.width) / 2)
        }
        else {
            this.width = doorThickness
            this.height = sectorHeight * .66
            heightOffset = sectorHeight - ((sectorHeight - this.height) / 2)
        }

        // Locations
        switch(this.position) {
            case DoorPositions.TOPLEFT:
                this.location = new Vector([ 4 * sectorWidth - widthOffset, 0 ])
                break
            case DoorPositions.TOPCENTER:
                this.location = new Vector([ 7 * sectorWidth - widthOffset, 0 ])
                break
            case DoorPositions.TOPRIGHT:
                this.location = new Vector([ 10 * sectorWidth - widthOffset, 0 ])
                break
            case DoorPositions.BOTTOMLEFT:
                this.location = new Vector([ 4 * sectorWidth - widthOffset, this.canvas.height - doorThickness ])
                break
            case DoorPositions.BOTTOMCENTER:
                this.location = new Vector([ 7 * sectorWidth - widthOffset, this.canvas.height - doorThickness ])
                break
            case DoorPositions.BOTTOMRIGHT:
                this.location = new Vector([ 10 * sectorWidth - widthOffset, this.canvas.height - doorThickness ])
                break
            case DoorPositions.LEFTTOP:
                this.location = new Vector([ 0, 4 * sectorHeight - heightOffset ])
                break
            case DoorPositions.LEFTCENTER:
                this.location = new Vector([ 0, 7 * sectorHeight - heightOffset ])
                break
            case DoorPositions.LEFTBOTTOM:
                this.location = new Vector([ 0, 10 * sectorHeight - heightOffset ])
                break
            case DoorPositions.RIGHTTOP:
                this.location = new Vector([ this.canvas.width - doorThickness, 4 * sectorHeight - heightOffset ])
                break
            case DoorPositions.RIGHTCENTER:
                this.location = new Vector([ this.canvas.width - doorThickness, 7 * sectorHeight - heightOffset ])
                break
            case DoorPositions.RIGHTBOTTOM:
                this.location = new Vector([ this.canvas.width - doorThickness, 10 * sectorHeight - heightOffset ])
                break
        }

        // Spawn Location
        switch(this.position.side) {
            case DoorSides.TOP:
                this.spawnLocation = new Vector([
                    this.location.points[0] + (this.width / 2),
                    this.location.points[1]
                ])
                break
            case DoorSides.BOTTOM:
                this.spawnLocation = new Vector([
                    this.location.points[0] + (this.width / 2),
                    this.location.points[1] + this.height - 1
                ])
                break
            case DoorSides.LEFT:
                this.spawnLocation = new Vector([
                    this.location.points[0],
                    this.location.points[1] + (this.height / 2)
                ])
                break
            case DoorSides.RIGHT:
                this.spawnLocation = new Vector([
                    this.location.points[0] + this.width - 1,
                    this.location.points[1] + (this.height / 2)
                ])
                break
        }

        this.rect = [
            this.location.points[0],
            this.location.points[1],
            this.location.points[0] + this.width,
            this.location.points[1] + this.height
        ]
    }

    Draw() {
        this.context.fillStyle = this.state.color
        this.context.fillRect(
            this.rect[0], this.rect[1],
            this.width, this.height
        )
    }

    Open() {
        if (this.state !== DoorStates.CLOSED) return

        this.state = DoorStates.OPEN
    }

    Jam() {
        if (this.state !== DoorStates.OPEN) return

        this.state = DoorStates.JAMMED
    }

    Close() {
        if (this.state !== DoorStates.OPEN) return

        this.Reset()
    }

    Reset() {
        this.state = DoorStates.CLOSED
    }

    isCollided(sprite) {
        if (
            this.rect[0] > sprite.boundingBox[2] ||
            sprite.boundingBox[0] > this.rect[2]
        ) return false

        if (
            this.rect[1] > sprite.boundingBox[3] ||
            sprite.boundingBox[1] > this.rect[3]
        ) return false

        return true
    }
}
