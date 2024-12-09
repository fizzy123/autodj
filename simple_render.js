const { Ableton } = require("ableton-js");
const { randomChoice } = require("./util");
const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const ableton = new Ableton({ logger: console });

trackClipDict = {
//  "Mixing": [61,68],
//  "kick": [79,90],
//  "stutter.perc": [82,98],
//  "snare": [61,61],
//  "perc": [83,98],
//  "perc.2": [83,98],
  "hh": [68,73],
  "hh.2": [68,73],
}

length = 4 * 1000

const render = async () => {
  await ableton.start()
  trackDict = {};

  tracks = await ableton.song.get("tracks");
  for (const track of tracks) {
    let trackName = await track.get("name")
    if (trackClipDict[trackName]) {
      currentTime = 0
      while (currentTime < length) {
          selectIndex = trackClipDict[trackName][0] + Math.floor(Math.random() * (trackClipDict[trackName][1] + 1 - trackClipDict[trackName][0]))
          const clipSlots = await track.get("clip_slots")
          clipSlot = clipSlots[selectIndex - 1]

          const clip = await clipSlot.get("clip");
          const clipLength = await clip.get("length");
          nextCurrentTime = currentTime + 4 * 4
          while (currentTime < nextCurrentTime) {
              await track.duplicateClipToArrangement(clip.raw.id, currentTime)
              currentTime = currentTime + clipLength
          }
      }
    }
  }
}
let startTime = performance.now()
render().then(function() {
  let timing = (performance.now() - startTime)/1000
  console.log(`rendered in ${timing}s!`)
  process.exit()
})
