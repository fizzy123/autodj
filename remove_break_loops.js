const util = require("./util");
const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console });

(async () => {
  await ableton.start();
  tracks = await ableton.song.get("tracks");
  let clipsTrack;
  for (const track of tracks) {
    let name = await track.get("name")
    if (name === "loops.perc") {
      clipsTrack = track
      break;
    }
  }
  
  del = false
  const clipSlots = await clipsTrack.get("clip_slots")
  for (const clipSlot of clipSlots) {
    const clip = await clipSlot.get("clip");
    if (!clip) {
      break
    }

    let clipName = await clip.get("name");
    if (clipName === "honky_tonk_woman.rolling_stones") {
        del = true
    }
    if (del) {
      await clipSlot.deleteClip()
      console.log(clipName)
      clipName = clipName.replace(/'/g,"''").replace()
      let deleteQuery = `DELETE FROM loops WHERE name = '${clipName}'`
      db.prepare(deleteQuery).run()
      console.log("deleted")
    }
  }
  process.exit();
})()
