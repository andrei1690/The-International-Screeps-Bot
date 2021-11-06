Room.prototype.get = function(roomObjectName: string) {

    const room: Room = this

    // Check if value is cached. If so then return it

    let cachedValue: any

    cachedValue = findRoomObjectInGlobal(roomObjectName)
    if (cachedValue) return cachedValue

    cachedValue = findRoomObjectInMemory(roomObjectName)
    if (cachedValue) return cachedValue

    /**
    @param roomObjectName name of roomObject
    @returns roomObject
     */
    function findRoomObjectInGlobal(roomObjectName: string) {

        // Stop if there is no stored object

        if (!global[room.name][roomObjectName]) return

        //

        const cacheAmount = global[room.name][roomObjectName].cacheAmount
        const lastCache = global[room.name][roomObjectName].lastCache

        // Stop if time is greater than lastCache + cacheAmount

        if (lastCache + cacheAmount < Game.time) return

        // See if roomObject's type is an id

        if (global[room.name][roomObjectName].type == 'id') {

            return global.findObjectWithId(global[room.name][roomObjectName].value)
        }

        // See if roomObject's type is an pos

        if (global[room.name][roomObjectName].type == 'pos') {

            // Return roomPosition of pos

            return room.newPos(global[room.name][roomObjectName].value)
        }

        // Return the value of the roomObject

        return global[room.name][roomObjectName].value
    }

    /**
    @param roomObjectName name of roomObject
    @returns roomObject
     */
    function findRoomObjectInMemory(roomObjectName: string) {

        // Stop if there is no stored object

        if (!room.memory[roomObjectName]) return

        // See if roomObject's type is an id

        if (room.memory[roomObjectName].type == 'id') {

            // Return roomObject with id

            return global.findObjectWithId(room.memory[roomObjectName].value)
        }

        // See if roomObject's type is an pos

        if (room.memory[roomObjectName].type == 'pos') {

            // Return roomPosition of pos

            return room.newPos(room.memory[roomObjectName].value)
        }

        // Return the value of the roomObject

        return room.memory[roomObjectName].value
    }

    interface RoomObject {
        value: object
        cacheAmount: number
        lastCache: number
        type: string
    }

    /**
     * @param value roomObject
     * @param cacheAmount if in global, how long to store roomObject for
     * @param storeMethod where to store the roomObject
     * @param type object, id, or pos
     */
    class RoomObject {
        constructor(value: any, cacheAmount: number, storeMethod: string, type: string) {

            this.value = value
            this.type = type

            if (storeMethod == 'global') {

                this.cacheAmount = cacheAmount
                this.lastCache = Game.time

                return
            }
        }
    }

    //

    let roomObjects: {[key: string]: any} = {}

    // Important Positions

    roomObjects.anchorPoint = findRoomObjectInMemory('anchorPoint') || new RoomObject(room.newPos(room.memory.anchorPoint), Infinity, 'memory', 'pos')

    // Resources

    roomObjects.mineral = findRoomObjectInGlobal('mineral') || new RoomObject(room.find(FIND_MINERALS)[0], Infinity, 'global', 'object')
    roomObjects.sources = findRoomObjectInGlobal('sources') || new RoomObject(room.find(FIND_SOURCES), Infinity, 'global', 'object')
    roomObjects.source1 = findRoomObjectInMemory('source1') || new RoomObject(roomObjects.sources.value[0], Infinity, 'memory', 'id')
    if (roomObjects.sources[1]) roomObjects.source2 = findRoomObjectInMemory('source2') || new RoomObject(roomObjects.sources.value[1], Infinity, 'memory', 'id')

    // Loop through each structureType in the game

    for (const structureType of global.allStructureTypes) {

        // Create roomObject for structureType

        roomObjects[structureType] = new RoomObject([], 1, 'global', 'object')
    }

    // Loop through all structres in room

    for (let structure of room.find(FIND_STRUCTURES)) {

        // Group structure by structureType

        roomObjects[structure.structureType].value.push(structure)
    }

    // Harvest positions

    roomObjects.source1HarvestPositions = findRoomObjectInGlobal('source1HarvestPositions') || new RoomObject(findHarvestPositions(roomObjects.source1.value), Infinity, 'global', 'object')
    roomObjects.source1ClosestHarvestPosition = findRoomObjectInGlobal('source1ClosestHarvestPosition') || new RoomObject(findClosestHarvestPosition(roomObjects.source1HarvestPositions.value), Infinity, 'memory', 'object')

    roomObjects.source2HarvestPositions = roomObjects.sources[1] ? findRoomObjectInGlobal('source2HarvestPositions') || new RoomObject(findHarvestPositions(roomObjects.source2.value), Infinity, 'global', 'object') : new RoomObject([], 0, 'global', 'object')
    roomObjects.source2ClosestHarvestPosition = roomObjects.sources[1] ? findRoomObjectInGlobal('source2ClosestHarvestPosition') || new RoomObject(findClosestHarvestPosition(roomObjects.source2HarvestPositions.value), Infinity, 'memory', 'object') : undefined

    /**
     * Finds positions adjacent to a source that a creep can harvest
     * @param source source object
     * @returns sources harvest positions
     */
    function findHarvestPositions(source: {[key: string]: any}) {

        // Find positions adjacent to source

        const rect = { x1: source.pos.x - 1, y1: source.pos.y - 1, x2: source.pos.x + 1, y2: source.pos.y + 1 }
        const adjacentPositions = global.getPositionsInsideRect(rect)

        let harvestPositions = []

        // Find terrain in room

        const terrain = Game.map.getRoomTerrain(room.name)

        for (let pos of adjacentPositions) {

            // Iterate if terrain for pos is a wall

            if (terrain.get(pos.x, pos.y) == TERRAIN_MASK_WALL) continue

            // Convert position into a RoomPosition

            pos = room.newPos(pos)

            // Add pos to harvestPositions

            harvestPositions.push(pos)
        }

        return harvestPositions
    }

    function findClosestHarvestPosition(harvestPositions: {}) {

        // Filter harvestPositions by closest one to anchorPoint

        return roomObjects.anchorPoint.value.findClosestByRange(harvestPositions)
    }

    // Source links

    roomObjects.source1Link = findRoomObjectInGlobal('source1Link') || new RoomObject(findSourceLink(roomObjects.source1ClosestHarvestPosition.value), Infinity, 'global', 'object')
    if (roomObjects.sources[1]) roomObjects.source2Link = findRoomObjectInGlobal('source2Link') || new RoomObject(findSourceLink(roomObjects.source2ClosestHarvestPosition.value), Infinity, 'global', 'object')

    function findSourceLink(closestHarvestPos) {

        // Find links

        const links = roomObjects.link.value

        // Filter links that are near closestHarvestPos, return the first one

        const linksNearHarvestPos = links.filter(link => link.pos.getRangeTo(closestHarvestPos) == 1)
        return linksNearHarvestPos[0]
    }

    // Check that queried value is in database

    if (!roomObjects[roomObjectName]) {

        new CustomLog('Tried to get non-existent property', roomObjectName, global.colors.white, global.colors.red)
        return undefined
    }

    // Return queried value if defined

    return roomObjects[roomObjectName].value
}

Room.prototype.newPos = function(object: {[key: string]: number}) {

    const room: Room = this

    // Create an return roomPosition

    return new RoomPosition(object.x, object.y, room.name)
}