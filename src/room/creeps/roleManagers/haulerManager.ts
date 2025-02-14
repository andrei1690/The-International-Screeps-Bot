import { generalFuncs } from 'international/generalFunctions'
import { RoomTask } from 'room/roomTasks'
import { Hauler } from '../creepClasses'
import './haulerFunctions'

export function haulerManager(room: Room, creepsOfRole: string[]) {

    // Loop through creep names of this role

    for (const creepName of creepsOfRole) {

        // Get the creep using its name

        const creep: Hauler = Game.creeps[creepName]

        // If creep has a task

        if (global[creep.id] && global[creep.id].respondingTaskID) {

            // Try to filfill task

            const fulfillTaskResult = creep.fulfillTask()

            // Iterate if the task wasn't fulfilled

            if (!fulfillTaskResult) continue

            // Otherwise find the task

            const task: RoomTask = global[room.name].tasksWithResponders[global[creep.id].respondingTaskID]

            // Delete it

            task.delete()
        }

        // Try to find a new task

        const findTaskResult = creep.findTask(new Set([
            'transfer',
            'withdraw',
            'pull',
            'pickup'
        ]))
        
        // If a task wasn't found, iterate

        if (!findTaskResult) continue

        // Try to filfill task

        const fulfillTaskResult = creep.fulfillTask()

        // Iterate if the task wasn't fulfilled

        if (!fulfillTaskResult) continue

        // Otherwise find the task

        const task: RoomTask = global[room.name].tasksWithResponders[global[creep.id].respondingTaskID]

        // Delete it

        task.delete()
    }
}
