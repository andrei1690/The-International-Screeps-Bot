import { generalFuncs } from "international/generalFunctions"

StructureSpawn.prototype.advancedSpawn = function(spawnRequest) {

    const spawn = this

    // Attempt to spawn using the values in the spawnRequest

    const spawnResult = spawn.spawnCreep(spawnRequest.body, spawnRequest.extraOpts.memory.role + ', T' + spawnRequest.tier + ', ' + generalFuncs.newID(), spawnRequest.extraOpts)
    return spawnResult
}
