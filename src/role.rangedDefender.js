var AttackWhitelist = ["cplive"];

module.exports = {
    run: function(creep) {

        var enemyCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (c) => {
                filter: (c) => c.owner.username !== "cplive" && c.owner.username !== "Brun1L" && c.owner.username !== "mrmartinstreet" && c.owner.username !== "Source Keeper"
            }
        });

        let target
        let ramparts = creep.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_RAMPART
        })

        for (let rampart of ramparts) {

            if (rampart.pos.inRangeTo(enemyCreep)) {

                target = rampart
                return
            }
        }
    }
};