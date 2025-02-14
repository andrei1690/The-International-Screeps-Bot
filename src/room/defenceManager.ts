import { generalFuncs } from "international/generalFunctions"

/**
 * Handles defence related situations for a commune
 */
export function defenceManager(room: Room) {

    // Get enemy creeps in the room

    const enemyCreeps = room.get('enemyCreeps')

    // If there are no enemy creeps, stop

    if (!enemyCreeps.length) return

    advancedActivateSafeMode()

    function advancedActivateSafeMode() {

        // If safeMode is on cooldown, stop

        if (room.controller.safeModeCooldown) return

        // Otherwise if there are no safeModes left, stop

        if (room.controller.safeModeAvailable == 0) return

        // Otherwise if the controller is upgradeBlocked, stop

        if (room.controller.upgradeBlocked > 0) return

        // Otherwise if safeMode can be activated

        // Get the previous tick's events

        const eventLog = room.getEventLog()

        // Loop through each eventItem

        for (const eventItem of eventLog) {

            // If the event wasn't an attack, iterate

            if (eventItem.event != EVENT_ATTACK) continue

            // Otherwise get the target of the attack

            const attackTarget: Structure | Creep = generalFuncs.findObjectWithID(eventItem.data.targetId)

            // If the attackTarget doesn't have a structureType, iterate

            if (!attackTarget.structureType) continue

            // Otherwise activate safeMode and stop the loop

            room.controller.activateSafeMode()
            break
        }
    }
}
