const util = require("./util");
const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console});

(async () => {
  await ableton.start()
  tracks = await ableton.song.get("tracks");
  let clipsTrack;
  for (const track of tracks) {
    let name = await track.get("name")
    if (name === "clips") {
      clipsTrack = track
      break;
    }
  }

  let clipCount = 0
  const clipSlots = await clipsTrack.get("clip_slots")
  for (const clipSlot of clipSlots) {
    const clip = await clipSlot.get("clip");
    if (!clip) {
      break
    }
    clipCount = clipCount + 1

    let clipName = await clip.get("name");
    if (clipName === process.argv[2]) {
      console.log(clipCount)
//      break;
    }
  }
  process.exit();
})()
