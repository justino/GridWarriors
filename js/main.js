import { Tran } from "./tran.js"

window.onload = function() {
    console.log('TRAN: Initialize TRAN');

    const canvas = document.getElementById('gamegrid');
    const scoreBoard = document.getElementById('scoreboard');

    new Tran(canvas, scoreBoard);
}
