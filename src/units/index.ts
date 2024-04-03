import { Unit } from "@/units/unit"
import { Player } from "@/units/player"
import { Warrior } from "@/units/warrior"
import { Bulldog } from "@/units/bulldog"
import { Leader } from "@/units/leader"

export { Unit }
export { Player }
export { Warrior }
export { Bulldog }
export { Leader }

export type Enemy = Warrior | Bulldog | Leader
export type EnemyTypes = typeof Warrior | typeof Bulldog | typeof Leader
