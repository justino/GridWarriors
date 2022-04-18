import { Player } from "./player.js"
import { Wave } from "./wave.js"
import { Vector } from "./vector.js"

export class GameGrid {
    constructor(config, canvas) {
        console.log("Grid: Rezzing");
        this.config = config
        this.canvas = canvas
        this.context = this.canvas.getContext('2d');

        this.diagonal = Math.sqrt((this.config.width ^ 2) + (this.config.height ^ 2));

        addEventListener('UnitHit', this.unitHit.bind(this));
    }

    reset() {
        this.enemies = [];
        this.player = new Player(
            this,
            new Vector([this.canvas.width / 2, this.canvas.height / 2])
        );
        this.wave = new Wave(this);
    }

    Draw() {
        this.DrawBackground();

        if (this.player) { this.player.Draw(); };
        for (const enemy of this.enemies) {
            enemy.Draw();
        }
    }

    DrawBackground() {
        this.context.fillStyle = this.config.gridColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    Update() {
        if (!this.player) { return; }

        // Check for hits/deaths by player
        if (this.player.disc.status === this.player.disc.DEADLY) {
            for (const enemy of this.enemies) {
                this.player.disc.checkCollide(enemy);
            }
        }

        // Check for player hits/death
        for (const enemy of this.enemies) {
            enemy.disc.checkCollide(this.player);
        }

        // Movement
        if (this.player) {
            this.player.Update();

            for (const enemy of this.enemies) {
                enemy.Update();
            }
        }
    }

    unitHit(e) {
        console.log('Disc Collided');

        e.detail.loser.Hit(e.detail.winner.disc.strength);

        if (e.detail.winner === this.player) {
            if (e.detail.loser.isDead()) {
                dispatchEvent(new CustomEvent('Score', { detail: { score: e.detail.loser.points } }));

                e.detail.loser.remove();
                this.wave.trigger();
            }
        }
        else {
            dispatchEvent(new CustomEvent('Score', { detail: { score: -(e.detail.winner.disc.strength * 100) } }));

            if (e.detail.loser.isDead()) {
                e.detail.loser.remove();
                this.player = null;
                dispatchEvent(new Event('GameOver'));
            }
        }
    }
}
