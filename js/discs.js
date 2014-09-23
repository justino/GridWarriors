function Disc(name) {
    this.strength = 1;
    this.multiHit = false;
    this.status = 'held'; // attacking, returning, blocking
    
    this.name = name;
    
    console.log('Disc: ' + this.name + ' Created');
}

Disc.prototype.Draw = function() {
}

// -------------------------------------------------------------------------- //

function Yellow() {
    Disc.call(this, 'Yellow')
    this.color = 'rgba(255, 255, 0, 1)';
}
Yellow.prototype = Object.create(Disc.prototype);

function DarkBlue() {
    Disc.call(this, 'DarkBlue');
    this.color = 'rgba(0, 0, 128, 1)';    
}
DarkBlue.prototype = Object.create(Disc.prototype);

function Brown() {
    Disc.call(this, 'Brown');
    this.color = 'rgba(139, 69, 19, 1)';
    this.strength = 2;
}
Brown.prototype = Object.create(Disc.prototype);

function White() {
    Disc.call(this, 'White');
    this.color = 'rgba(255, 255, 255, 1)';
    this.multiHit = true;
}
White.prototype = Object.create(Disc.prototype);
