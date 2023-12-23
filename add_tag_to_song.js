const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
(async () => {
  const songName = process.argv[2]
  let getSongQuery = `SELECT tags FROM songs where song = '${songName}' AND section = 'end';`
  let results = await db.prepare(getSongQuery).all()
  console.log(results);
  let tags = results[0].tags || ''
  if (tags.includes("starting-song")) {
    console.log("song already marked as starting song")
//    return
  }
  let tagList = tags.split(",")
  tagList.push(process.argv[3])
  tags = tagList.join(',')
  let updateQuery = `UPDATE songs SET tags = '${tags}' WHERE song = '${songName}' AND section = 'end';`
  results = db.prepare(updateQuery).run()
  if (results.changes) {
    console.log("successfully added");
  } else {
    console.log("unsuccessfully added");
  }
})()
