const PgRooms = require("../../models/admin/PgRoom");

function formatDate(date) {
  let m = date.getMonth() + 1;
  let d = date.getDate();
  return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
}


class Rooms {
  constructor(roomid = null) {
    this.room_id = roomid;
  }

  /***************************************
   * Add new room to collection
   * @param {*} rd 
   * @returns {ObjectId} room id
   ***************************************/

  async addNewRoom(rd) {
    if (Object.keys(rd).length) {
      const newRoom = new PgRooms({
        room_no: rd.room_no,
        room_location: rd.room_location,
        num_of_sharing: rd.num_sharing,
        room_image: rd.room_image,
        room_facility: rd.room_facility,
      });

      try {
        const row = await newRoom.save();
        if (row) {
          this.room_id = row._id;
          return this.room_id.toString();
        }
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  
  /***************************************
   * Get all room rows from room collection
   * @param null 
   * @returns {*} room data
   ***************************************/
  async getRoomList(){
    const allroom = [];

    const r = await PgRooms.find();
    if(r.length){
      r.forEach(rd => {
        allroom.push({
          id: rd._id,
          room_no: rd.room_no,
          room_location: rd.room_location,
          num_of_sharing: rd.num_of_sharing,
          room_image: rd.room_image,
          room_facility: rd.room_facility,
          room_mates: rd.room_mates,
          created_at: formatDate(new Date(rd.created_at)), 
        })
      });

      return allroom;
    }

    return allroom;
  }
}

module.exports = Rooms;