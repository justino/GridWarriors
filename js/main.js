import config from "./config.js"
import { Tran } from "./tran.js"

window.onload = function() {
    window.config = config
    window.tran = new Tran()
}
