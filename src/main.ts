import { config } from "@/config"
import { GridWarriors } from "@/gridwarriors"

declare global {
    interface Window {
        config: typeof config
        gridwarriors: GridWarriors
    }
}

window.onload = function() {
    window.config = config
    window.gridwarriors = new GridWarriors()
}
