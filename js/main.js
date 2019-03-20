window.onload = function() {
    console.log('TRAN: Initialize TRAN');

    var canvas = document.getElementById('gamegrid');
    var scoreBoard = document.getElementById('scoreboard');

    tran = new Tran(canvas, scoreBoard);
}
