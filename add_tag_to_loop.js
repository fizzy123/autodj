const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
(async () => {
  const loopName = process.argv[2]
  let getSongQuery = `SELECT tags FROM loops where name = '${loopName}';`
  let results = await db.prepare(getSongQuery).all()
  console.log(results);
  let tags = results[0].tags || ''
  let tagList = tags.split(",")
  tagList.push(process.argv[3])
  tags = tagList.join(',')
  let updateQuery = `UPDATE loops SET tags = '${tags}' WHERE name = '${loopName}';`
  results = db.prepare(updateQuery).run()
  if (results.changes) {
    console.log("successfully added");
  } else {
    console.log("unsuccessfully added");
  }
})()
