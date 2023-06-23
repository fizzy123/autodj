const open = require('open');
const { Ableton } = require("ableton-js");
const { get, randomCombination } = require("./util");
const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const express = require('express')
const app = express()
app.use(express.json())

const ws = require("ws");
const wss = new ws.Server({
  port: 8080
})
wss.on('connection', function connection(s) {
  s.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== s && client.readyState === ws.OPEN) {
        client.send(data, { binary: isBinary });
      }
    })
  });
});
function sendMsg(text) {
  const wsClient = new ws('ws://localhost:8080');
  wsClient.on('open', () => {
    wsClient.send(text);
  });
}

app.use("/static", express.static('static'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html');
})

app.get('/current/', async (req, res) => {
  return res.json(await currentStatus())
})

const currentStatus = async () => {
  const currentSong = await getCurrentSong()
  if (Object.keys(lastSong).length > 0) {
    lastSong = await getSong(lastSong.song)
  }
  return {
    loops: currentLoops,
    currentSong: currentSong,
    lastSong: lastSong,
  }
}

app.get("/hydra", (req, res) => {
  res.sendFile(__dirname + '/html/hydra.html');
})

app.get("/new", (req, res) => {
  res.sendFile(__dirname + '/html/new.html');
})

app.post('/new', async (req, res) => {
  let songDetails = req.body
  if (!songDetails.name) {
    throw new Error("No song name specified!")
  }

  if ("lowStart" in songDetails) {
    insertLowStartQuery = `INSERT INTO songs (song, bpm, key, time, section, syncopated, intensity) VALUES ('${songDetails.name}', ${songDetails.bpm}, ${songDetails.key}, ${songDetails.lowStart}, 'start', -1, 'low')`
    results = await db.prepare(insertLowStartQuery).run()
  } else if ("highStart" in songDetails) {
    insertHighStartQuery = `INSERT INTO songs (song, bpm, key, time, section, syncopated, intensity) VALUES ('${songDetails.name}', ${songDetails.bpm}, ${songDetails.key}, ${songDetails.highStart}, 'start', -1, 'high')`
    results = await db.prepare(insertHighStartQuery).run()
  } else {
    res.json({success: false})
  }

  insertEndQuery = `INSERT INTO songs (song, bpm, key, time, section, syncopated, intensity) VALUES ('${songDetails.name}', ${songDetails.bpm}, ${songDetails.key}, ${songDetails.end}, 'end', -1, 'low,mid')`
  results = await db.prepare(insertEndQuery).run()

  return res.json({success: true})
})

// Expecting bodies in the form:
// {
//   name: string (required)
//   bpm: number
//   key: number
//   lowStart: number
//   highStart: number
//   end: number
//   endIntensity: string
//   dont: comma seperated string
//   preferred: comma seperated string
//   loops: comma seperated string
//   tags: comma seperated string
// }
app.post('/song', async (req, res) => {
  let songDetails = req.body
  if (!songDetails.name) {
    throw new Error("No song name specified!")
  }
  delete songCache[songDetails.name]

  var getSongQuery = "SELECT bpm, key, time, syncopated, intensity, dont, preferred, song, loops, tags, section FROM songs WHERE song = '" + songDetails.name + "' ORDER BY section DESC, time ASC;"
  let results = await db.prepare(getSongQuery).all()
  if (results.length < 2) {
    throw new Error("Results for " + songDetails.name + " not found!")
  }

  let lowStart, highStart, end;
  for (const result of results) {
    if (result.section === "start" && result.intensity === "low") {
      lowStart = result
    }
    if (result.section === "start" && result.intensity === "high") {
      highStart = result
    }
    if (result.section === "end") {
      end = result
    }
  }
  if (!("bpm" in songDetails)) {
    // can grab bpm from any result cause it should be the same for all of them
    songDetails.bpm = results[0].bpm
  }
  if (!("key" in songDetails)) {
    // can grab key from any result cause it should be the same for all of them
    songDetails.key = results[0].key
  }
  if (!("lowStart" in songDetails) && lowStart) {
    songDetails.lowStart = lowStart.time
  }
  if (!("highStart" in songDetails) && highStart) {
    songDetails.highStart = highStart.time
  }
  if (!("end" in songDetails)) {
    songDetails.end = end.time
  }
  if (!("endIntensity" in songDetails)) {
    songDetails.endIntensity = end.intensity
  }
  if (!("dont" in songDetails)) {
    songDetails.dont = end.dont
  }
  if (!("preferred" in songDetails)) {
    songDetails.preferred = end.preferred
  }
  if (!("loops" in songDetails)) {
    songDetails.loops = end.loops
  } else {
    for (const currentLoop of currentLoops) {
      if (songDetails.loops.includes(currentLoop.name)) {
        currentLoop.preferred = true
      } else {
        currentLoop.preferred = false
      }
    }
  }
  if (!("tags" in songDetails)) {
    songDetails.tags = end.tags
  }

  if (lowStart) {
    console.log("updating ", songDetails.name)
    updateLowStartQuery = "UPDATE songs SET bpm = " + songDetails.bpm + ", key = " + songDetails.key + ", time = " + songDetails.lowStart + " WHERE song = '" + songDetails.name + "' AND section = 'start' and intensity = 'low';"
    results = await db.prepare(updateLowStartQuery).run()
    console.log("low start changed: ", results.changes)
  }

  if (highStart) {
    updateHighStartQuery = "UPDATE songs SET bpm = " + songDetails.bpm + ", key = " + songDetails.key + ", time = " + songDetails.highStart + " WHERE song = '" + songDetails.name + "' AND section = 'start' and intensity = 'high';"
    results = await db.prepare(updateHighStartQuery).run()
    console.log("high start changed: ", results.changes)
  }

  updateEndQuery = "UPDATE songs SET bpm = " + songDetails.bpm + ", key = " + songDetails.key + ", time = " + songDetails.end + ", intensity = '" + songDetails.endIntensity + "', dont = '" + songDetails.dont + "', preferred = '" + songDetails.preferred + "', loops = '" + songDetails.loops + "', tags = '" + songDetails.tags + "'  WHERE song = '" + songDetails.name + "' AND section = 'end';"
  results = await db.prepare(updateEndQuery).run()
  console.log("end changed: ", results.changes)

  return res.json({success: true})
})

app.get('/starting-songs', async (req, res) => {
  let getStartingSongQuery = "SELECT song, key, bpm FROM songs WHERE tags LIKE '%starting-song%';"
  let results = await db.prepare(getStartingSongQuery).all()
  return res.json({ songs: results })
})

let songListenerRemover = null;
app.post('/initialize', async (req, res) => {
  startingTrack = req.body.startingSong
  if (req.body.isTesting) {
    isTesting = true
  }
  initialize().then(async () => {
    if (songListenerRemover) {
      await songListenerRemover()
    }
    songListenerRemover = await ableton.song.addListener("current_song_time", (async (time) => {
      await beat(time)
    }));

    sendMsg(JSON.stringify({ message: "init-complete" }))
  })
  return res.json({success: true})
})

app.get("/work", async (req, res) => {
  if (songListenerRemover) {
    await songListenerRemover()
  }
  songListenerRemover = null
  isTesting = true
  songHistory = []

  let expandSongQuery = "SELECT song FROM songs WHERE tags LIKE '%expand%';"
  let expandResults = await db.prepare(expandSongQuery).all()

  let fixSongQuery = "SELECT song, tags FROM songs WHERE tags LIKE '%fix%';"
  let fixResults = await db.prepare(fixSongQuery).all()

  return res.json({
    expandSongs: expandResults,
    fixSongs: fixResults,
  })
})

app.post("/setup-transition", async (req, res) => {
  state[currentChannel].end = 0
  state[currentChannel].currentPosition = 0
  let songName = req.body.name
  trackDict["testing1"].duplicateClipToArrangement(clips[songName].clip.raw.id, 0)
  let transition = req.body.transition
  let song = await getSong(songName)
  let nextSong;
  if (transition === "expand") {
    currentKey = song.key
    await setNotedMidiKey()

    results = await db.prepare(buildNextSongQuery(song, true)).all()
    nextSong = findPreferredSong(song, results)
  } else if (transition.includes("fix")) {
    nextSongName = transition.split("-")[1]
    let intensity
    if (song.intensity.includes("low")) {
      intensity = "low"
    } else if (song.intensity.includes("high")) {
      intensity = "high"
    }
    let fixSongQuery = `SELECT song, time, key, bpm, intensity FROM songs WHERE song = '${nextSongName}' AND section = 'start' AND intensity = '${intensity}';`
    let fixResults = await db.prepare(fixSongQuery).all()
    nextSong = fixResults[0]
  }

  if (nextSong === undefined) {
    newTags = song.tags.filter((tag) => tag != transition)
    let removeTagQuery = `UPDATE songs set tags = '${newTags}' where song = '${songName}';`
    let removeTagResults = await db.prepare(removeTagQuery).run()
    console.log(removeTagResults)
    return res.json({})
  }
  let diff = song.key - nextSong.key
  if (song.key === 11 && nextSong.key === 0) {
    diff = -1
  } else if (song.key === 0 && nextSong.key === 11) {
    diff = 1
  }

  await clips[nextSong.song].clip.set("pitch_coarse", diff)
  trackDict["testing2"].duplicateClipToArrangement(clips[nextSong.song].clip.raw.id, song.time - nextSong.time)
  await clips[nextSong.song].clip.set("pitch_coarse", 0)
  return res.json({
    song: song,
    nextSong: nextSong,
  })
})

const ableton = new Ableton({ logger: console });

var songHistory
var SONG_INDEX
var trackDict
var clips
var colorDict
var loops
var percLoops
var startingTrack
var goalBPM
var loopBPM
var currentKey
var state
var reverbOut
var playing
var startTime
var currentBeat
var currentChannel
var loopLength
var songsPerLoopSet
var songCounter
var unsyncedCount
var stalled
var liveAPICache
var chosen
var isTesting

const init = async () => {
  await ableton.start();

  liveAPICache = {}
  songHistory = []

  SONG_INDEX = 0

  trackDict = {};

  tracks = await ableton.song.get("tracks");
  for (const track of tracks) {
    trackDict[await track.get("name")] = track
  }

  clips = {}
  const clipSlots = await trackDict["clips"].get("clip_slots")
  for (const clipSlot of clipSlots) {
    const clip = await clipSlot.get("clip");
    if (!clip) {
      break
    }

    // ensure various qualities of clip
    await clip.set("pitch_coarse", 0)
    await clip.set("warp_mode", 4)

    clipName = await clip.get("name")
    clips[clipName] = {
      "clip": clip,
      "clipSlot": clipSlot,
    }
  }

  loops = {}
  const loopSlots = await trackDict["loops"].get("clip_slots")
  for (const loopSlot of loopSlots) {
    const loop = await loopSlot.get("clip");
    if (!loop) {
      break
    }

    // ensure various qualities of clip
    await loop.set("looping", 1)
    await loop.set("pitch_coarse", 0)
    await loop.set("warp_mode", 4)

    loopName = await loop.get("name")
    loops[loopName] = {
      "clip": loop,
      "clipSlot": loopSlot,
    }
  }

  percLoops = {}
  const percLoopSlots = await trackDict["loops.perc"].get("clip_slots")
  for (const percLoopSlot of percLoopSlots) {
    const percLoop = await percLoopSlot.get("clip");
    if (!percLoop) {
      break
    }

    // ensure various qualities of clip
    await percLoop.set("looping", 1)

    percLoopName = await percLoop.get("name")
    percLoops[percLoopName] = {
      "clip": percLoop,
      "clipSlot": percLoopSlot,
    }
  }

  midiLoops = {}
  const midiLoopSlots = await trackDict["loops.midi"].get("clip_slots")
  for (const midiLoopSlot of midiLoopSlots) {
    const midiLoop = await midiLoopSlot.get("clip");
    if (!midiLoop) {
      break
    }

    // ensure various qualities of clip
    await midiLoop.set("looping", 1)

    midiLoopName = await midiLoop.get("name")
    midiLoops[midiLoopName] = {
      "clip": midiLoop,
      "clipSlot": midiLoopSlot,
    }
  }

  percMidiLoops = {}
  const percMidiLoopSlots = await trackDict["loops.perc.midi"].get("clip_slots")
  for (const percMidiLoopSlot of percMidiLoopSlots) {
    const percMidiLoop = await percMidiLoopSlot.get("clip");
    if (!percMidiLoop) {
      break
    }

    // ensure various qualities of clip
    await percMidiLoop.set("looping", 1)

    percMidiLoopName = await percMidiLoop.get("name")
    percMidiLoops[percMidiLoopName] = {
      "clip": percMidiLoop,
      "clipSlot": percMidiLoopSlot,
    }
  }

  colorDict = [
    "ff2f3a",
    "fd691d",
    "ffee4c",
    "84fe72",
    "37c228",
    "00bfaf",
    "00eafe",
    "00a6eb",
    "007fbe",
    "826fe0",
    "b678c4",
    "ff39d1",
  ]

  //await colorClips()
  //await colorLoops()
  //startingTrack = "intro.jaykode"
  //  startingTrack = "love_is_alive.chet_porter"
  //  startingTrack = "worlds_intro.chet_porter"
  // startingTrack = "spicy_boyfriend.shawn_wasabi"
  // startingTrack = "wildcard.kubbi.1"
  // startingTrack = "huracan.heart_space"

  goalBPM = 0
  currentKey = 8

  state = {
    A: {
      currentPosition: 0,
      start: 0,
      end: 0,
      played: true
    },
    B: {
      currentPosition: 0,
      start: 0,
      end: 0,
      played: false
    }
  }

  const devicesA = await trackDict["A"].get("devices")
  const deviceA = devicesA[1]
  const parametersA = await deviceA.get('parameters')
  for (const parameterA of parametersA) {
    const parameterName = await parameterA.get('name')
  console.log(2)
    console.log(parameterName)
    if (parameterName === "Intensit") {
      state['A'].reverb = parameterA
      console.log("reverb set")
    }
  }

  const devicesB = await trackDict["B"].get("devices")
  const deviceB = devicesB[1]
  const parametersB = await deviceB.get('parameters')
  for (const parameterB of parametersB) {
    const parameterName = await parameterB.get('name')
    if (parameterName === "Intensit") {
      state['B'].reverb = parameterB
    }
  }

  reverbOut = null
  playing = 0;
  currentBeat = 0
  currentChannel = 'A'
  loopLength = 16
  songsPerLoopSet = 2
  songCounter = 0
  unsyncedCount = 0

  chosen = ""

  stalled = null
}


const colorClips = async () => {
  results = await db.prepare("select song, key from songs group by song;").all()
  for (const result of results) {
    if (result.song in clips) {
      color = await clips[result.song].clip.get("color")
      await clips[result.song].clip.set("color", parseInt(colorDict[parseInt(result.key)], 16))
    }
  }
}

const colorLoops = async () => {
  results = await db.prepare("select name, key from loops group by name;").all()
  for (const result of results) {
    if (result.name in loops) {
      await loops[result.name].clip.set("color", parseInt(colorDict[parseInt(result.key)], 16))
    }
  }
  console.log("test5")
}


function getOtherChannel() {
  if (currentChannel === 'A') {
    return 'B'
  } else if (currentChannel === 'B') {
    return 'A'
  }
}

const getClip = async (track, clipSlotIndex) => {
  let clipSlots
  try {
    clipSlots = await trackDict[track].get('clip_slots')
  } catch (e) {
    clipSlots = await trackDict[track].get('clip_slots')
  }
  hasClip = await clipSlots[clipSlotIndex].get("has_clip")
  let loopCount = 0
  while (!hasClip) {
    loopCount = loopCount + 1
    hasClip = await clipSlots[clipSlotIndex].get("has_clip")
  }
  if (loopCount) {
    console.log("looped waiting for clip slot to have clip")
    console.log(loopCount)
  }
  return await clipSlots[clipSlotIndex].get("clip")
}

const getClipSlot = async (track, clipSlotIndex) => {
  const clipSlots = await trackDict[track].get('clip_slots')
  return clipSlots[clipSlotIndex]
}

function generateCheckpointDiffs(checkpoints) {
  var diffs = []
  for (var i = 0; i < checkpoints.length - 1; i++) {
    diffs.push(checkpoints[i + 1] - checkpoints[i])
  }
  return diffs
}

var initialized = false
var processingBeat = false
const beat = async (beats) => {
  // trigger only on first call after new beat
  if (currentBeat == Math.floor(beats)) {
    return
  }
  if (processingBeat) {
    console.log("RACE CONDITION")
    return
  }
  processingBeat = true
  var beatStart = (new Date()).getTime()
  await updateTime(beats)
  // if the distance between now and the end of the currently playing song matches the distance between the next song's intial point and the point we want it to start at
  if (timeToStartNextSong()) {
    initialized = true
    console.log("initialized: ", initialized)
    console.log("starting next song")
    const paramMin = await state[getOtherChannel()].reverb.get('min')
    await state[getOtherChannel()].reverb.set('value', paramMin) // remove effects
    await startNextSong()
    currentState = await currentStatus()
    currentState.message = "status"
    sendMsg(JSON.stringify(currentState))
  } else if (songJustStarted()) {
    console.log("song just started ", songCounter)
    let tempo = await ableton.song.get("tempo");
    if (tempo > (loopBPM + 15) && initialized) {
      console.log("half bpm")
      await ableton.song.set("tempo", tempo / 2);
    }
    if (tempo < (loopBPM - 15) && initialized) {
      cosnole.log("double bpm")
      await ableton.song.set("tempo", tempo * 2);
    }
    // resync clips and global clock
    console.log("adjusting loop")
    console.log(Math.round(parseFloat(beats)))
    await ableton.song.set("loop_length", 16 + (Math.round(parseFloat(beats))))
    console.log("Loading Loops task")
    await loadLoops()
    currentState = await currentStatus()
    currentState.message = "status"
    sendMsg(JSON.stringify(currentState))
  } else if (await transitionFailed()) {
    console.log("Transition failed")
    if (!stalled) {
      const paramMin = await state[getOtherChannel()].reverb.get('min')
      await state[getOtherChannel()].reverb.set('value', paramMin) // remove effects
      await startNextSong()
      stalled = (new Date()).getTime()
    } else if ((new Date()).getTime() - stalled > 5000) {
      await ableton.song.stopPlaying()
      stalled = null
    }
  } else {
    stalled = false
  }
  if (await songHasFinished()) {
    console.log("picking next song")
    await pickNextSong()
  }
  let loopLength = await ableton.song.get("loop_length")
  if (currentBeat === loopLength - 1) {
    await setBarStart()
  }
  await handleFadeOut()
  await updateTempo()
  processingBeat = false
}

const setBarStart = async () => {
  await (await getClipSlot("active_loops", 0)).fire()
}

const updateTime = async (beats) => {
  var oldBeat = currentBeat
  currentBeat = Math.round(beats)

  //  console.log("beat: " + beats)
  //  console.log("currentBeat: " + currentBeat)
  var loopLength
  if (currentBeat === 1) {
    await ableton.song.set("loop_length", 16)
    loopLength = 16
  } else {
    var loopLength = await ableton.song.get("loop_length")
  }

  // updates the current position state
  var difference = currentBeat - oldBeat
  if (difference < 0) {
    if (parseInt(loopLength) !== 0) {
      loopLength = parseInt(loopLength)
    }
    difference = loopLength + difference
  }
  if (difference > 1) {
    console.log("unusual differences: " + difference)
    console.log("beat difference: " + (difference).toString())
  }
  state['A'].currentPosition = state['A'].currentPosition + difference
  state['B'].currentPosition = state['B'].currentPosition + difference
}

const updateTempo = async () => {
  var tempo = await ableton.song.get("tempo")
  if (tempo - goalBPM > 0.05) {
    await ableton.song.set("tempo", tempo - 0.05)
  } else if (goalBPM - parseFloat(tempo) > 0.05) {
    await ableton.song.set("tempo", tempo + 0.05)
  }
}

const handleFadeOut = async () => {
  if (reverbOut) {
    var timeToTransition = state[reverbOut].end - state[reverbOut].currentPosition
    if (timeToTransition < 8 && timeToTransition >= 0) {
      const maxValue = await state[reverbOut].reverb.get('max')
      await state[reverbOut].reverb.set('value', maxValue * (8.0 - timeToTransition) / 8.0)

      reverbIn = "A"
      if (reverbOut === "A") {
        reverbIn = "B"
      }
      const minValue = await state[reverbIn].reverb.get('min')
      await state[reverbIn].reverb.set('value', minValue * (8.0 - timeToTransition) / 8.0)
    }
  }
}

function timeToStartNextSong() {
  return ((state[currentChannel].end - state[currentChannel].currentPosition) === (parseInt(state[getOtherChannel()].start) + 1) && // we have plus one cause we want to click play right before music should start
    state[currentChannel].end != 0 && // current channel has properly been initialized
    !state[getOtherChannel()].played) // guard against double playing
}

const transitionFailed = async () => {
  return !(await (await getClip(getOtherChannel(), 0)).get('is_playing')) &&
    !(await (await getClip(currentChannel, 0)).get('is_playing'))
}

const songHasFinished = async () => {
  return state[getOtherChannel()].played && // other channel has played once
    !(await (await getClip(getOtherChannel(), 0)).get('is_playing')) // other channel is not currently playing
}

function songJustStarted() {
  return state[currentChannel].currentPosition === parseInt(state[currentChannel].start) // we have plus one cause we want to click play right before music should start
}

// starts next song. this is assumed to be the song in the other channel
const startNextSong = async () => {
  // reset states for new song channel
  state[getOtherChannel()].currentPosition = -1
  var startMeasure = Date.now()
  nextSongClip = await getClip(getOtherChannel(), 0)
  await nextSongClip.fire()
  console.log(await nextSongClip.get("name"))
  console.log("startNextSong timing: " + (Date.now() - startMeasure).toString())
  state[getOtherChannel()].played = true

  lastSong = await getCurrentSong()
  currentChannel = getOtherChannel()
  songCounter = songCounter + 1
}

let currentLoops = []
const loadLoops = async () => {
  currentLoops = []
  //  var keyRequirements = "key BETWEEN " + (currentKey - 1).toString() + " AND " + (currentKey + 1).toString() 
  const currentSong = await getCurrentSong()
  var bpmRequirements = "bpm BETWEEN " + (currentSong.bpm - 15).toString() + " AND " + (currentSong.bpm + 15).toString() // TODO: implement wrap around

  var results = await db.prepare("SELECT name, key FROM loops WHERE " + bpmRequirements + " AND key >= 0 and name NOT IN ('" + currentSong.loops.join("','") + "') ORDER BY RANDOM()").all()
  var preferredLoops = await db.prepare("SELECT name, key FROM loops WHERE name IN ('" + currentSong.loops.join("','") + "') AND key >= 0").all()

  var loopStart = (new Date()).getTime()
  var normalLoopCount = 8;
  for (var i = 0; i < normalLoopCount; i++) {
    loop = {
      preferred: false
    }
    pool = results
    // verify we have preferred loops and that they are in the right track
    if (preferredLoops.length > i && preferredLoops[i].name in loops) {
      pool = preferredLoops
      loop.preferred = true
    }
    var destination = "loop." + (i + 1).toString()
    const targetClipSlot = await getClipSlot(destination, 0)
    if (!(pool[i].name in loops)) {
      console.log("LOOP NOT FOUND: ")
      console.log(pool[i].name)
    }
    loop.name = pool[i].name
    await loops[pool[i].name].clipSlot.duplicateClipTo(targetClipSlot)
    const loopClip = await getClip(destination, 0)
    var pitchCorrection = currentKey - parseInt(pool[i].key)
    if (pitchCorrection > 6) {
      pitchCorrection = pitchCorrection - 12
    }
    if (pitchCorrection <= -6) {
      pitchCorrection = pitchCorrection + 12
    }
    await loopClip.set("pitch_coarse", pitchCorrection)
    //    await loopClip.set("ram_mode", 1)
    currentLoops.push(loop)
  }

  // perc loops
  var percLoopCount = 4
  var results = await db.prepare("SELECT name, key FROM loops WHERE " + bpmRequirements + " AND key < 0 AND name NOT IN ('" + currentSong.loops.join("','") + "') ORDER BY RANDOM()").all()
  var preferredLoops = await db.prepare("SELECT name, key FROM loops WHERE name IN ('" + currentSong.loops.join("','") + "') AND key < 0").all()
  for (var i = 0; i < percLoopCount; i++) {
    loop = {
      preferred: false
    }
    name = results[i].name
    // verify we have preferred loops and that they are in the right track
    if (currentSong.loops.length > i && currentSong.loops[i] in percLoops) {
      name = currentSong.loops[i]
      loop.preferred = true
    }
    loop.name = name
    var destination = "perc." + (i + 1).toString()
    const targetClipSlot = await getClipSlot(destination, 0)

    if (!(name in percLoops)) {
      console.log("LOOP NOT FOUND: ")
      console.log(name)
    }
    await percLoops[name].clipSlot.duplicateClipTo(targetClipSlot)
    //   var loopClip = await getClip(destination, 1)
    //    loopClip.set("ram_mode", 1)
    currentLoops.push(loop)
  }

  midiLoopCount = 4
  midiLoopSelection = randomCombination(Object.keys(midiLoops), midiLoopCount)
  for (var i = 0; i < midiLoopCount; i++) {
    name = midiLoopSelection[i]
    var destination = "loop.midi." + (i + 1).toString()
    const targetClipSlot = await getClipSlot(destination, 0)
    await midiLoops[name].clipSlot.duplicateClipTo(targetClipSlot)
  }

  percMidiLoopCount = 2
  percMidiLoopSelection = randomCombination(Object.keys(percMidiLoops), percMidiLoopCount)
  for (var i = 0; i < percMidiLoopCount; i++) {
    name = percMidiLoopSelection[i]
    var destination = "perc.midi." + (i + 1).toString()
    const targetClipSlot = await getClipSlot(destination, 0)
    await percMidiLoops[name].clipSlot.duplicateClipTo(targetClipSlot)
  }

  console.log("load loop duration: ", (new Date()).getTime() - loopStart)
}

const pickNextSong = async () => {
  // get current song
  const currentSong = await getCurrentSong()
  const currentStart = await getCurrentSong("start") // Not sure what this does?

  // update state
  state[currentChannel].end = currentSong.time
  state[currentChannel].start = currentStart.time // Not sure what this does?
  if (goalBPM === 0) {
    ableton.song.set("tempo", currentSong.bpm)
  }
  goalBPM = currentSong.bpm
  console.log("new goal BPM: ", currentSong.bpm)

  // run query to find song that will match key
  const coreResults = await db.prepare(buildNextSongQuery(currentSong, true)).all()

  // get tempo wrap around results
  var loopResults = []
  if (currentSong.bpm > 155 || currentSong.bpm < 85) {
    loopResults = await db.prepare(buildNextSongQuery(currentSong, true, true)).all()
  }
  var results = coreResults.concat(loopResults)
  console.log("found " + results.length + " songs")

  var changedKey = false
  if (results.length === 0) { // if no songs match
    // find song in different key
    console.log("no results for next song!")

    // untested code
    results = await db.prepare(buildNextSongQuery(currentSong, false)).all()
    changedKey = true
  } else {
    results = [findPreferredSong(currentSong, results)]
  }
  var nextSong = results[0]
  await setNextSong(nextSong.song, currentSong.song)
  loopBPM = nextSong.bpm

  if (changedKey) {
    currentKey = nextSong.key
    await setNotedMidiKey()
  } else {
    await setCorrectKey(nextSong) // if key hasn't changed, make sure that new song is in same key
    setTransition(nextSong) // also set reverbOut or not
  }

  // setup new song start
  state[getOtherChannel()].start = nextSong.time
  state[getOtherChannel()].played = false
  unsyncedCount = 0
}

function choseSong(song) {
  chosen = song
}

let lastSong = {}
const songCache = {}
const getSong = async (songName) => {
  if (songName in songCache) {
    return songCache[songName]
  }

  // get current song end details
  var query = "SELECT bpm, key, time, syncopated, intensity, dont, preferred, song, loops, tags FROM songs WHERE song = '" + songName + "' AND section = 'end';"
  var results = await db.prepare(query).all()

  songObj = {
    "song": results[0].song,
    "bpm": parseFloat(results[0].bpm),
    "key": parseInt(results[0].key),
    "time": parseInt(results[0].time),
    "syncopated": parseInt(results[0].syncopated),
    "intensity": fieldToArray(results[0].intensity),
    "dont": fieldToArray(results[0].dont),
    "preferred": fieldToArray(results[0].preferred),
    "loops": fieldToArray(results[0].loops),
    "tags": fieldToArray(results[0].tags)
  }
  songCache[songName] = songObj
  return songObj
}
const getCurrentSong = async () => {
  const currentSongName = await (await getClip(currentChannel, 0)).get('name')
  return getSong(currentSongName)

}

function fieldToArray(value) {
  if (!value || value.toString() === "0" || !value.toString()) {
    return []
  }
  return value.toString().split(',')
}

function buildNextSongQuery(currentSong, matchKey, loopBpm) {
  var intensityArray = []
  if (typeof currentSong.intensity === "string") {
    intensityArray.push("'" + currentSong.intensity + "'")
  } else {
    for (var i = 0; i < currentSong.intensity.length; i++) {
      intensityArray.push("'" + currentSong.intensity[i] + "'")
    }
  }
  var intensityRequirements = "intensity IN (" + intensityArray.join(',') + ")"
  var rhythmRequirements = "syncopated = " + currentSong.syncopated
  var keyRequirements = "key BETWEEN " + (currentKey - 1).toString() + " AND " + (currentKey + 1).toString() // TODO: implement wrap around
  if (currentKey === 11) {
    keyRequirements = "key in (10, 11, 0)"
  }
  if (currentKey === 0) {
    keyRequirements = "key in (11, 0, 1)"
  }
  if (!matchKey) {
    keyRequirements = ""
  }
  var targetBpm = currentSong.bpm
  if (loopBpm) { // done for bpm loop clips
    if (targetBpm > 155) {
      targetBpm = targetBpm / 2
    }
    if (targetBpm < 85) {
      targetBpm = targetBpm * 2
    }
  }
  var bpmRequirements = "bpm BETWEEN " + (parseInt(targetBpm) - 5).toString() + " AND " + (parseInt(targetBpm) + 5).toString()
  var startSection = "section = 'start'"
  
  let startTime = state[currentChannel].end - state[currentChannel].currentPosition - 1
  let timeRequirements = ""
  if (startTime >= 0) {
    timeRequirements = "time BETWEEN 0 AND " + startTime.toString()
  }
  if (loopBpm) { // done to get bpm loop clips
    timeRequirements = "time = 0"
  }

  var newSong = []
  for (var i = 0; i < songHistory.length; i++) {
    newSong.push("song NOT LIKE '" + songHistory[i] + "%'")
  }
  for (var i = 0; i < currentSong.dont.length; i++) {
    if (currentSong.dont[i]) {
      newSong.push("song NOT LIKE '" + currentSong.dont[i] + "%'")
    }
  }

  //  var random = " ORDER BY RANDOM()"
  var random = " ORDER BY leads ASC"
  if (songCounter % 2) {
    random = " ORDER BY RANDOM()"
  }
  var requirementsArray = [rhythmRequirements, startSection, bpmRequirements]
  if (timeRequirements) {
    requirementsArray.push(timeRequirements)
  }
  if (matchKey) {
    requirementsArray.push(keyRequirements)
    requirementsArray.push(intensityRequirements) // temporary until i add more keys
  }
  var requirements = requirementsArray.join(" AND ")
  if (newSong.length) {
    requirements = requirements + " AND " + newSong.join(" AND ") 
  }
  console.log(requirements)
  return "SELECT song, time, key, intensity, bpm, dont, syncopated, (select count(inner.song) from songs as inner where inner.preferred like '%' || outer.song || '%') + (select count(inner.song) from songs as inner where inner.dont like '%' || outer.song || '%') as leads FROM songs AS outer WHERE " + requirements + random + ";"
}

function findPreferredSong(currentSong, results) {
  console.log("find preferred song")
  var match
  //  var firstPreferred = currentSong.preferred.shift()
  if (chosen) {
    currentSong.preferred.unshift(chosen)
  }
  for (var i = 0; i < currentSong.preferred.length; i++) {
    for (var j = 0; j < results.length; j++) {
      var song = currentSong.preferred[i].split("|")[0]
      var condition = results[j].song === song
      condition = condition && !match // if we haven't found a match yet
      if (currentSong.preferred[i].split("|").length === 2) {
        condition = condition && (currentSong.preferred[i].split("|")[1] === results[j].intensity)
      }
      //	  if (condition && Math.random() < ((i+1)/currentSong.preferred.length * 0)) {
      //    if (condition & (Math.random() < 0.1) ) {
      if (condition) {
        match = results[j]
        console.log("match found")
        break
      }
    }
    if (match) {
      break
    }
  }
  if (isTesting) {
    console.log("IGNORE MATCH CAUSE TESTING")
    match = null;
  }
  if (!match) {
    match = results[0]
  }
  console.log(match)
  return match
}

const setNextSong = async (nextSongName) => {
  console.log("next song: " + nextSongName)
  const targetClipSlot = await getClipSlot(getOtherChannel(), 0)
  const targetClip = await getClip(getOtherChannel(), 0)

  // overwrite original song copy
  let currentSongName = await targetClip.get("name")
  console.log(currentSongName)
  await targetClipSlot.duplicateClipTo(clips[currentSongName].clipSlot)

  await clips[nextSongName].clipSlot.duplicateClipTo(targetClipSlot)
  const nextSong = await getClip(getOtherChannel(), 0)
  //  nextSong.set("ram_mode", 1)
  songHistory.push(nextSongName.split('.')[0])

  if (songHistory.length > 60) {
    songHistory.shift()
  }
}

const setCorrectKey = async (nextSong) => {
  const newClip = await getClip(getOtherChannel(), 0)
  var difference = currentKey - parseInt(nextSong.key)
  while (difference > 6) {
    difference = difference - 12
  }
  while (difference < -6) {
    difference = difference + 12
  }
  await newClip.set("pitch_coarse", difference)
}

function setTransition(nextSong) {
  if (nextSong.intensity === 'low') {
    reverbOut = currentChannel
  } else {
    reverbOut = null
  }
}

const initialize = async () => {
  // cleanup B clip if it exists
  if (await (await getClipSlot("B", 0)).get('has_clip')) {
    (await getClipSlot("B", 0)).deleteClip
  }
  songHistory.push(startingTrack.split('.')[0])
  console.log(startingTrack)
  // queuing up first song
  const targetClipSlot = await getClipSlot(currentChannel, 0)
  await clips[startingTrack].clipSlot.duplicateClipTo(targetClipSlot)
  const nextSong = await getClip(currentChannel, 0)
  await nextSong.set("ram_mode", 1)
  await targetClipSlot.fire()
  const otherClipSlot = await getClipSlot(getOtherChannel(), 0)
  await otherClipSlot.stop()

  const currentSong = await getCurrentSong()
  currentKey = currentSong.key
  await setNotedMidiKey()

  await loadLoops()

  await setBarStart()

  ableton.song.stopPlaying()

  // setup next song
  await pickNextSong()
  console.log("initialized")

  const minValueA = await state["A"].reverb.get('min')
  await state["A"].reverb.set('value', minValueA)
  const minValueB = await state["B"].reverb.get('min')
  await state["B"].reverb.set('value', minValueB)
}

function is_playing(status) {
  console.log("playing: " + status)
  if (status === 0) {
    if (playing === 0) {
      return
    }
    console.log(((new Date()).getTime() - startTime.getTime()) / 1000 / 60) // log running time in minutes
    playing = 0
  } else if (status === 1) {
    state['A'].currentPosition = 0
    state['B'].currentPosition = 0
    currentBeat = 0
    if (playing === 1) {
      return
    }
    startTime = new Date()
    playing = 1
  }
}

async function setNotedMidiKey() {
    const devices = await trackDict["noted_midi"].get("devices")
    const pitch_shift = devices[0]
    const parameters = await pitch_shift.get('parameters')
    for (const parameter of parameters) {
      const parameterName = await parameter.get('name')
      if (parameterName === "Pitch") {
          parameter.set('value', -(6 - currentKey))
      }
    }
}

init().then(function() {
  const server = app.listen(3000)
  console.log("server listening")
})

