const util = require("./util");
const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console });

(async () => {
  await ableton.start();
  let getStartingSongQuery = "SELECT song FROM songs WHERE section = 'end';"
  let results = await db.prepare(getStartingSongQuery).all()

  let resultsDict = {}
  for (const result of results) {
    resultsDict[result.song] = true
  }

  tracks = await ableton.song.get("tracks");
  let clipsTrack;
  for (const track of tracks) {
    let name = await track.get("name")
    if (name === "clips") {
      clipsTrack = track
      break;
    }
  }
  
  resultsCopy = Object.assign({}, resultsDict);
  clips = {}
  const clipSlots = await clipsTrack.get("clip_slots")
  for (const clipSlot of clipSlots) {
    const clip = await clipSlot.get("clip");
    if (!clip) {
      break
    }

    let clipName = await clip.get("name");
    if (!resultsDict[clipName]) {
      console.log(clipName + " not Found")
    } else {
      delete resultsCopy[clipName]
    }
  }
  console.log(resultsCopy)
  process.exit();
})()
