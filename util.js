const db = require('better-sqlite3')('/Users/seonyoo/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
exports.get = function get(obj, key) {
  if (!obj) {
    return obj
  }
  if (key in obj) {
    return obj[key]
  } else {
  return null
  }
}

exports.removeSongFromTransitions = async (songName) => {
  let removeSongQuery = `SELECT song, dont, preferred FROM songs WHERE dont LIKE '%${songName}%' OR preferred LIKE '%${songName}%';`
  let results = await db.prepare(removeSongQuery).all()

  for (const result of results) {
    let dontList = []
    if (result.dont) {
      dontList = result.dont.split(',')
    }
    let preferredList = []
    if (result.preferred) {
      preferredList = result.preferred.split(',')
    }

    filteredDontList = dontList.filter(song => song !== songName)
    filteredPreferredList = preferredList.filter(song => song !== songName)

    let removeQuery = `UPDATE songs SET dont = '${filteredDontList.join(',')}', preferred = '${filteredPreferredList.join(',')}' WHERE song = '${result.song}' AND section = 'end'`
    results = db.prepare(removeQuery).run()
  }
}
