const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console });

(async () => {
  await ableton.start();
  const trackName = process.argv[2]
  tracks = await ableton.song.get("tracks");
  let clipsTrack;
  for (const track of tracks) {
    let name = await track.get("name")
    if (name === trackName) {
      clipsTrack = track
      break;
    }
  }

  const clipSlots = await clipsTrack.get("clip_slots")
  firstOpenClipSlot = -1
  for (let i=0; i<clipSlots.length; i++) {
    let hasClip = await clipSlots[i].get("has_clip")
    if (firstOpenClipSlot < 0 && !hasClip) {
      firstOpenClipSlot = i
    }
    if (firstOpenClipSlot >= 0 && hasClip) {
      clipSlots[i].duplicateClipTo(clipSlots[firstOpenClipSlot])
      firstOpenClipSlot = firstOpenClipSlot + 1
    }
    console.log("moving clips", i)
  }
  process.exit();
})()
