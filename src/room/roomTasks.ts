import { generalFuncs } from "international/generalFunctions"

export interface RoomTask {
    /**
     * What the task is generally expected to entail for responders
     */
    type: RoomTaskTypes
    /**
     * The name of the room that the task will be recorded in
     */
    creatorID: string
    roomName: string
    responderID: string
    ID: number

    resourceType?: ResourceConstant

    // Functions

    /**
     * Finds where the task is stored in global
     */
    findLocation(): {[key: number]: RoomTask}

    /**
     * Informs whether the task needs to be deleted or not
     */
    shouldStayActive(): boolean

    /**
     * Deletes all references to the task
     */
    delete(): void
}

export class RoomTask {
    constructor(type: RoomTaskTypes, creatorID: string, roomName: string) {

        const task = this
        generalFuncs.customLog('Created task', type)
        // Assign parameters

        task.type = type
        task.creatorID = creatorID
        task.roomName = roomName

        // Generate an ID

        task.ID = generalFuncs.newID()

        // if there is no global for the creator, make one

        if (!global[creatorID]) global[creatorID] = {}

        // If there is no created task IDs object for the creator, make it

        if (!global[creatorID].createdTaskIDs) global[creatorID].createdTaskIDs = {}

        // Set a value for the creator's ID if it doesn't exist, then assign the taskID and responder state

        global[creatorID].createdTaskIDs[task.ID] = false

        // Record the task in the room with the requested roomName

        global[roomName].tasksWithoutResponders[task.ID] = task
    }
}

RoomTask.prototype.findLocation = function() {

    const task = this

    // If the task is in tasks with responders, inform that location

    if (global[task.roomName].tasksWithResponders[task.ID]) return global[task.roomName].tasksWithResponders

    // Otherwise inform tasks without responders

    return global[task.roomName].tasksWithoutResponders
}

RoomTask.prototype.shouldStayActive = function() {

    const task = this

    // If the task has a responderID

    if (task.responderID) {

        // If it doesn't exist, inform false

        if (!generalFuncs.findObjectWithID(task.responderID)) return false

        // Otherwise if it has no respondingtaskID, inform false

        if (!global[task.responderID].respondingTaskID) return false
    }

    // If the creator no longer exits, infom false

    if (!generalFuncs.findObjectWithID(task.creatorID)) return false

    // Otherwise inform true

    return true
}

RoomTask.prototype.delete = function() {

    const task = this

    // Construct task info based on found location
    generalFuncs.customLog('Deleted task', task.type)
    const taskLocation = task.findLocation()

    // And delete the taskID from the creator's list

    delete global[task.creatorID].createdTaskIDs[task.ID]

    // If the task has a responder remove the task ID from it

    if (task.responderID) delete global[task.responderID].respondingTaskID

    // Delete the task

    delete taskLocation[task.ID]
}

export interface RoomWithdrawTask extends RoomTask {
    withdrawAmount: number
    withdrawTargetID: string
}

export class RoomWithdrawTask extends RoomTask {
    constructor(roomName: string, resourceType: ResourceConstant, withdrawAmount: number, withdrawTargetID: Id<any>) {

        // Inherit from RoomTask

        super('withdraw', withdrawTargetID, roomName)

        const task = this

        // Assign paramaters

        task.resourceType = resourceType
        task.withdrawAmount = withdrawAmount

        task.withdrawTargetID = withdrawTargetID
    }
}

export interface RoomTransferTask extends RoomTask {
    transferAmount: number
    transferTargetID: Id<any>
}

export class RoomTransferTask extends RoomTask {
    constructor(roomName: string, resourceType: ResourceConstant, transferAmount: number, transferTargetID: Id<any>) {

        // Inherit from RoomTask

        super('transfer', transferTargetID, roomName)

        const task = this

        // Assign paramaters

        task.resourceType = resourceType
        task.transferAmount = transferAmount

        task.transferTargetID = transferTargetID
    }
}

export interface RoomRepairTask extends RoomTask {
    repairThreshold: number
    repairTargetID: string
}

export class RoomRepairTask extends RoomTask {
    constructor(roomName: string, repairTargetID: Id<Structure>, repairThreshold: number) {

        // Inherit from RoomTask

        super('repair', repairTargetID, roomName)

        const task = this

        // Assign paramaters

        task.repairThreshold = repairThreshold
        task.repairTargetID = repairTargetID
    }
}

export interface RoomPickupTask extends RoomTask {
    resourceID: Id<Resource>
    pickupAmount: number
}

export class RoomPickupTask extends RoomTask {
    constructor(roomName: string, resourceID: Id<Resource>, resourceType: ResourceConstant) {

        // Inherit from RoomTask

        super('pickup', resourceID, roomName)

        const task = this

        // Assign paramaters

        task.resourceID = resourceID
        task.resourceType = resourceType

        // Assign defaults

        task.pickupAmount = 10000000
    }
}

export interface RoomPullTask extends RoomTask {
    targetID: string
    targetPos: RoomPosition
}

export class RoomPullTask extends RoomTask {
    constructor(roomName: string, targetID: Id<Creep>, targetPos: RoomPosition) {

        // Inherit from RoomTask

        super('pull', targetID, roomName)

        const task = this

        // Assign paramaters

        task.targetID = targetID
        task.targetPos = targetPos
    }
}