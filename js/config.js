var config = {
    // Game Window Metrics
    width: 800,
    height: 600,
    unitSize: 16,
    discSize: 4, // Deadly is Math.round(discScale / 2)
    
    // Game Play Params
    discReturnTime: 1000,  // Seconds
    discSpeed: 4,
    whiteDiscPercent: 20, // Percentage for when a white disc appears
    warriorAccuracy: 35, // Percent
    bulldogAccuracy: 25, // Percent
    leaderAccuracy: 60, // Percent
    
    // Colors
    gridColor: 'rgba(96, 96, 96, 1)',
    tronColor: 'rgba(255, 0, 0, 1)',
    warriorColor: 'rgba(0, 255, 255, 1)',
    bulldogColor: 'rgba(255, 0, 255, 1)',
    leaderColor: 'rgba(0, 127, 255, 1)',
    guardColor: 'rgba(255, 255, 127, 1)'
    
    // Debuging Params
};