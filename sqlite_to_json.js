let stringify = require('json-stable-stringify');
const fs = require('fs');
const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');

(async () => {
  // songs
  let getSongQuery = `SELECT song, key, bpm, section, preferred, dont, time, loops, tags from songs;`
  let results = await db.prepare(getSongQuery).all()
  let songJson = {}
  for (let result of results) {
    if (!songJson[result.song]) {
      songJson[result.song] = {
        "key": result.key,
        "bpm": result.bpm,
        "transitionNotes": {}
      }
    }
    if (result.section === "start") {
      songJson[result.song]["startTime"] = result.time
    } else if (result.section === "end") {
      songJson[result.song]["endTime"] = result.time
    }
    let dontArray = result.dont?.split(",") || []
    for (let song of dontArray) {
      if (song) {
        songJson[result.song]["transitionNotes"][song] = {
          "ranking": 2
        }
      }
    }
    let preferredArray = result.preferred?.split(",") || []
    for (let song of preferredArray) {
      if (song) {
        songJson[result.song]["transitionNotes"][song] = {
          "ranking": 4,
          "text": `rank from preferred: ${preferredArray.indexOf(song)}`
        }
      }
    }
    if (result.tags) {
      tags = result.tags.split(",").filter((tag) => tag && tag != "null")
      if (tags.length) {
        songJson[result.song]["tags"] = tags.join(",")
      }
    }
    if (result.loops) {
      loops = result.loops.split(",").filter((loop) => loop && loop != "null")
      if (loops.length) {
        songJson[result.song]["notes"] = loops.join(",")
      }
    }
  }
  let songString = stringify(songJson, {space: 2});
  fs.writeFileSync('songs.json', songString);

  // loops
  let getLoopQuery = `SELECT name, key, bpm from loops;`
  results = await db.prepare(getLoopQuery).all()
  loops = {}
  for (let result of results) {
    loops[result.name] = {
      key: result.key,
      bpm: result.bpm
    }
  }
  let loopsString = stringify(loops, {space: 2});
  fs.writeFileSync('loops.json', loopsString);
})()
