const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
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

// supports both simple arrays and complex weighted arrays
exports.randomChoice = (array) => {
  if (array.length === 0) {
    return
  }
  if (array[0].weight === undefined || Array.isArray(array[0])) {
    return array[Math.floor(array.length * Math.random())]
  } else {
    // First, we loop the main dataset to count up the total weight. We're starting the counter at one because the upper boundary of Math.random() is exclusive.
    var total = 0;
    for (var i = 0; i < array.length; ++i) {
      total += parseInt(array[i].weight);
    }

    // Total in hand, we can now pick a random value akin to our
    // random index from before.
    const threshold = Math.random() * total;

    // Now we just need to loop through the main data one more time
    // until we discover which value would live within this
    // particular threshold. We need to keep a running count of
    // weights as we go, so let's just reuse the "total" variable
    // since it was already declared.
    total = 0;
    for (var i = 0; i < array.length; ++i) {
      // Add the weight to our running total.
      total += parseInt(array[i].weight);

      // If this value falls within the threshold, we're done!
      if (total >= threshold) {
        return array[i].value;
      }
    }
    return array[i].value;
  }
}

exports.shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

exports.randomCombination = (array, size) => {
  let arrayCopy = array.slice()
  exports.shuffle(arrayCopy)
  return arrayCopy.slice(0, size)
}
