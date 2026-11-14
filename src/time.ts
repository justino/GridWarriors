import { config } from "@/config"

// Game time is counted in updates, which run config.targetFps times a second and stop while paused.
// Durations in config are milliseconds, convert them with this before counting.
export function msToTicks(ms: number) {
    return Math.round(ms / 1000 * config.targetFps)
}
