const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
(async () => {
  const songName = process.argv[2]
  let getSongQuery = `SELECT song, preferred, dont FROM songs where section = 'end' and (preferred LIKE '%${songName}%' OR dont LIKE '%${songName}%');`
  let results = await db.prepare(getSongQuery).all()
  for (let result of results) {
    let dont = result.dont.split(",").filter((song) => song != songName).join(",")
    let preferred = result.preferred.split(",").filter((song) => song != songName).join(",")
    let updateQuery = `UPDATE songs SET dont = '${dont}', preferred = '${preferred}' WHERE song = '${result.song}' AND section = 'end';`
    console.log(updateQuery)
    db.prepare(updateQuery).run()
    console.log(`updated ${result.song}`)
  }
  console.log(`updated ${results.length} songs`)
})()
