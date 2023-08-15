const path = require("path");
const fs = require("fs");
const PgRooms = require("../../models/admin/PgRoom");
const PgPerson = require("../../models/admin/PgPerson");

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
   * update room details
   * @param {*} rd  roomdata
   * @returns {*} acknowladgement
   ***************************************/

  async editRoom(rd) {
    if (Object.keys(rd).length && this.room_id) {

      const r = await PgRooms.findById(this.room_id);
      if (r) {
        r.room_no = rd.room_no;
        r.room_location = rd.room_location;
        r.num_sharing = rd.num_of_sharing;
        r.room_image = rd.room_image;
        r.room_facility = rd.room_facility;

        try {
          const row = await r.save();
          if (row) {
            this.room_id = row._id;
            return row;
          }
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }


  /***************************************
   * Get all room rows from room collection
   * @param null 
   * @returns {*} room data
   ***************************************/
  async getRoomList() {
    const allroom = [];

    const r = await PgRooms.find().sort({ room_no: 1 });
    if (r.length) {
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

  /***************************************
   * Get room info from room id
   * @param null 
   * @returns {*} room data
   ***************************************/

  async getRoom() {
    if (this.room_id) {
      try {
        const r = await PgRooms.findById(this.room_id);
        const roomData = {
          id: r._id,
          room_no: r.room_no,
          room_location: r.room_location,
          num_sharing: r.num_of_sharing,
          room_image: r.room_image,
          room_facility: r.room_facility,
          room_mates: r.room_mates,
        }

        return roomData;
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 404;
        }
        throw new Error(err);
      }
    } else {
      return false;
    }
  }

  /***************************************
   * Remove room info from collection
   * @param room_id 
   * @returns null
   ***************************************/

  async removeRoom() {
    if (this.room_id) {
      const dirpath = path.join(__dirname, "../../public/images/uploads");
      const getRoom = await this.getRoom();

      if (getRoom.room_image) {
        const roomImg = `${dirpath + getRoom.room_image}`
        if (fs.existsSync(roomImg)) {
          const removeProfile = fs.unlink(roomImg, (err) => {
            if (err) {
              throw new Error(err);
            }
          });
        }
      }

      const { deletedCount } = await PgRooms.deleteOne({ _id: this.room_id });
      if (deletedCount) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /***************************************
   * get room info by room no
   * @param room_no 
   * @returns {*} room info
   ***************************************/
  async getRoomByRoomNo(room_no) {
    if (room_no) {
      try {
        const r = await PgRooms.findOne({room_no});
        const roomData = {
          id: r._id,
          room_no: r.room_no,
          room_location: r.room_location,
          num_sharing: r.num_of_sharing,
          room_image: r.room_image,
          room_facility: r.room_facility,
          room_mates: r.room_mates,
        }

        return roomData;
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 404;
        }
        throw new Error(err);
      }
    } else {
      return false;
    }
  }

  
  /***************************************
   * add person to room
   * @param room_no
   * @param person_id
   * @returns aknowladgement
   ***************************************/
  async addRoomMate(room_no,person){
    if(room_no){
      const r = await PgRooms.findOne({room_no});
      if(r){
        const p = await PgPerson.findOne({_id:person});
        if(p){
          r.room_mates.push(p);
          p.room_id = r._id;
          const rmtupd = await r.save();
          const prsnupd = await p.save();
          return rmtupd;
        }else{
          throw new Error("Person not found");  
        }

      }else{
        throw new Error("Room not found");
      }
      
    }

  }
}

module.exports = Rooms;