export const config = {
    targetFps: 60, // Simulation updates per second
    maxFrameTime: 250, // Milliseconds of elapsed time processed per frame at most

    /// Grid
    width: 1200,
    height: 800,
    gridColor: 'rgba(130, 130, 130, 1)',
    gridLinesColor: 'rgba(169, 169, 169, 1)',
    gameStartTime: 2000, // Milliseconds before the first wave

    // Units
    unitSize: 32, // Should be divisible by 2
    deflectArcRadius: 40, // Pixels, from the center of the unit
    deflectZoneMultiplier: 2, // Enemies decide to deflect when a disc gets within this many times the arc radius
    deflectArcAngle: 90, // Degrees, total width of the arc, centered on the unit's facing
    deflectArcColor: 'rgba(255, 165, 0, 0.35)',
    enemyCount: 3,
    respawnInterval: 5000, // Milliseconds after an enemy dies before the grid is topped back up
    minimumDistance: 250,
    tiredChance: 5, // Percent, chance to rest each time a unit finishes a move
    tiredMinTime: 1000, // Milliseconds
    tiredMaxTime: 4000, // Milliseconds

    playerColor: 'rgba(255, 0, 0, 1)',
    playerSpeed: 2,
    warriorColor: 'rgba(185, 240, 255, 1)', // Pale sky blue
    warriorAccuracy: 85, // Percent
    warriorSpeed: 2,
    warriorUseDoorChance: 0, // Pecent
    warriorDeflectChance: 25, // Percent, chance to deflect when the player's disc enters its deflect zone
    bulldogAccuracy: 90, // Percent
    bulldogColor: 'rgba(255, 220, 255, 1)', // Pale pink
    bulldogSpeed: 1.75,
    bulldogUseDoorChance: 5, // Percent
    leaderAccuracy: 95, // Percent
    leaderColor: 'rgba(190, 255, 190, 1)', // Pale mint
    leaderSpeed: 3,
    leaderUseDoorChance: 10, // Percent
    leaderDeflectChance: 50, // Percent, chance to deflect when the player's disc enters its deflect zone

    // Discs
    discReturnTime: 1000, // Milliseconds, a bouncing disc heads home after this long
    discDeflectedReturnMultiplier: 1.5, // A deflected disc takes this much longer to return than a wall bounce

    playerDiscColor: 'rgba(255, 255, 0, 1)',
    playerDiscSpeed: 4,
    beginnerDiscColor: 'rgba(0, 0, 200, 1)', // Royal blue
    beginnerDiscSpeed: 4,
    intermediateDiscColor: 'rgba(0, 0, 0, 1)', // Black
    intermediateDiscSpeed: 4,
    homingDiscColor: 'rgba(145, 65, 172, 1)', // Purple (#9141ac)
    homingDiscSpeed: 2,
    homingDiscDelay: 1000, // Milliseconds of straight flight before a homing disc starts homing
    homingDiscBlinkColor: 'rgba(255, 255, 255, 1)', // Alternates with homingDiscColor while deadly
    homingDiscBlinkInterval: 150, // Milliseconds between color swaps while deadly
    homingDiscPercent: 10, // Percent, chance a leader gets a homing disc

    // Doors
    doorThickness: 6,
    doorClosedColor: 'rgba(0, 0, 0, 1)',
    doorOpenColor: 'rgba(0, 128, 0, 1)',
    doorJammedColor: 'rgba(126, 0, 0, 1)',

    // Debuging Params
}
