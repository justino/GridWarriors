import config from "./config.js"
import { GridWarriors } from "./gridwarriors.js"

window.onload = function() {
    window.config = config
    window.gridwarriors = new GridWarriors()
}
