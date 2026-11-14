export const config = {
    targetFps: 60, // Simulation updates per second
    maxFrameTime: 250, // Milliseconds of elapsed time processed per frame at most

    /// Grid
    width: 1200,
    height: 800,
    gridColor: 'rgba(130, 130, 130, 1)',
    gridLinesColor: 'rgba(169, 169, 169, 1)',
    gameStartTime: 2, // Seconds

    // Units
    unitSize: 32, // Should be divisible by 2
    deflectArcRadius: 40, // Pixels, from the center of the unit
    deflectArcAngle: 90, // Degrees, total width of the arc, centered on the unit's facing
    deflectArcColor: 'rgba(255, 165, 0, 0.35)',
    regenerationTime: 6, // Seconds
    enemyCount: 3,
    respawnInterval: 5, // Seconds
    minimumDistance: 250,
    tiredChance: 5, // Percent, chance to rest each time a unit finishes a move
    tiredMinTime: 1, // Seconds
    tiredMaxTime: 4, // Seconds

    playerColor: 'rgba(255, 0, 0, 1)',
    playerSpeed: 2,
    warriorColor: 'rgba(97, 170, 200, 1)',
    warriorAccuracy: 85, // Percent
    warriorSpeed: 2,
    warriorUseDoorChance: 0, // Pecent
    bulldogAccuracy: 90, // Percent
    bulldogColor: 'rgba(255, 0, 255, 1)',
    bulldogSpeed: 1.75,
    bulldogUseDoorChance: 5, // Percent
    leaderAccuracy: 95, // Percent
    leaderColor: 'rgba(0, 127, 255, 1)',
    leaderSpeed: 3,
    leaderUseDoorChance: 10, // Percent

    // Discs
    discReturnTime: 1000,  // Seconds
    discDeflectedReturnMultiplier: 1.5, // A deflected disc takes this much longer to return than a wall bounce

    playerDiscColor: 'rgba(255, 255, 0, 1)',
    playerDiscSpeed: 4,
    beginnerDiscColor: 'rgba(0, 0, 128, 1)',
    beginnerDiscSpeed: 4,
    intermediateDiscColor: 'rgba(139, 69, 19, 1)',
    intermediateDiscSpeed: 4,
    homingDiscColor: 'rgba(255, 255, 255, 1)',
    homingDiscSpeed: 2,
    homingDiscPercent: 10, // Percentage for when a white disc appears

    // Doors
    doorThickness: 6,
    doorClosedColor: 'rgba(0, 0, 0, 1)',
    doorOpenColor: 'rgba(0, 128, 0, 1)',
    doorJammedColor: 'rgba(126, 0, 0, 1)',

    // Debuging Params
}
