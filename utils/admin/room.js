const PgRooms = require("../../models/admin/PgRoom");

class Rooms {
  constructor(roomid = null) {
    this.room_id = roomid;
  }
}

module.exports = Rooms;