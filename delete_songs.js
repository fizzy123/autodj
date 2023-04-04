const util = require("./util");
const db = require('better-sqlite3')('/Users/seonyoo/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const { Ableton } = require("ableton-js");
const ableton = new Ableton();

(async () => {
  let getStartingSongQuery = "SELECT song FROM songs WHERE tags LIKE '%delete%';"
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

  clips = {}
  let clipCount = 0
  let deletedClipCount = 0
  const clipSlots = await clipsTrack.get("clip_slots")
  for (const clipSlot of clipSlots) {
    const clip = await clipSlot.get("clip");
    if (!clip) {
      break
    }
    clipCount = clipCount + 1

    let clipName = await clip.get("name");
    if (resultsDict[clipName]) {
      deletedClipCount = deletedClipCount + 1
      await clipSlot.deleteClip()
      let deleteQuery = `DELETE FROM songs WHERE song = '${clipName}'`
      db.prepare(deleteQuery).run()
      util.removeSongFromTransitions(clipName)
      console.log(`removed ${clipName}`)
    }
    console.log("counting clips", clipCount)
  }

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
    let lastSlot = clipCount - deletedClipCount
    if (i >= lastSlot) {
      if (hasClip) {
        await clipSlots[i].deleteClip()
      } else {
        break
      }
    }
    console.log("moving clips", i)
  }
  process.exit();
})()
