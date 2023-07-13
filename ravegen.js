const { Ableton } = require("ableton-js");
const { randomChoice } = require("./util");
const db = require('better-sqlite3')('D:/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
const ableton = new Ableton({ logger: console });

let kickInfo = [
  {name: "nigeria", bpm: [80, 160]},
  {name: "congolese", bpm: [80, 160]},
  {name: "jamaica.1", bpm: [80, 160]},
  {name: "sync.perc.4", bpm: [80, 160]},
  {name: "sync.perc.3", bpm: [80, 160]},
  {name: "sync.perc.1", bpm: [80, 160]},
  {name: "sync.perc.2", bpm: [80, 160]},
  {name: "snare.alt.1", bpm: [80, 160]},
  {name: "3.poly.alt.1", bpm: [80, 160]},
  {name: "snare.alt.2", bpm: [80, 160]},
  {name: "moomba.1", bpm: [80, 160]},
  {name: "moomba.2", bpm: [80, 160]},
  {name: "moomba.3", bpm: [80, 160]},
  {name: "2s.1", bpm: [80, 160]},
  {name: "snare_slow_roll", bpm: [80, 160]},
  {name: "fast_claps", bpm: [80, 100]},
  {name: "chill.1", bpm: [80, 160]},
  {name: "dnb.1", bpm: [80, 100]},
  {name: "snare_sync.1", bpm: [80, 160]},
  {name: "chill.2", bpm: [80, 160]},
  {name: "dnb.2", bpm: [80, 100]},
  {name: "click.sync.1", bpm: [80, 160]},
  {name: "snare_sync.2", bpm: [80, 160]},
  {name: "click_offset", bpm: [80, 160]},
  {name: "snare_sync.3", bpm: [80, 160]},
  {name: "nigeria.2x", bpm: [80, 100]},
  {name: "congolese.2x", bpm: [80, 100]},
  {name: "jamaica.1.2x", bpm: [80, 100]},
]

let snareInfo = [
  {name: "nigeria", bpm: [80, 160]},
  {name: "congolese", bpm: [80, 160]},
  {name: "jamaica.1", bpm: [80, 160]},
  {name: "sync.perc.4", bpm: [80, 160]},
  {name: "sync.perc.3", bpm: [80, 160]},
  {name: "sync.perc.1", bpm: [80, 160]},
  {name: "sync.perc.2", bpm: [80, 160]},
  {name: "snare.alt.1", bpm: [80, 160]},
  {name: "3.poly.alt.1", bpm: [80, 160]},
  {name: "snare.alt.2", bpm: [80, 160]},
  {name: "moomba.1", bpm: [80, 160]},
  {name: "moomba.2", bpm: [80, 160]},
  {name: "moomba.3", bpm: [80, 160]},
  {name: "2s.1", bpm: [80, 160]},
  {name: "snare_slow_roll", bpm: [80, 160]},
  {name: "fast_claps", bpm: [80, 100]},
  {name: "chill.1", bpm: [80, 160]},
  {name: "dnb.1", bpm: [80, 100]},
  {name: "snare_sync.1", bpm: [80, 160]},
  {name: "chill.2", bpm: [80, 160]},
  {name: "dnb.2", bpm: [80, 100]},
  {name: "click.sync.1", bpm: [80, 160]},
  {name: "snare_sync.2", bpm: [80, 160]},
  {name: "click_offset", bpm: [80, 160]},
  {name: "snare_sync.3", bpm: [80, 160]},
  {name: "nigeria.2x", bpm: [80, 100]},
  {name: "congolese.2x", bpm: [80, 100]},
  {name: "jamaica.1.2x", bpm: [80, 100]},
]

let hhInfo = [
  {name: "fast_hh.1", bpm: [80, 160]},
  {name: "fast_hh.2x.1", bpm: [80, 160]},
  {name: "shaker.1", bpm: [80, 160]},
  {name: "shaker.2", bpm: [80, 160]},
  {name: "shaker.3", bpm: [80, 160]},
  {name: "hh.1", bpm: [80, 160]},
  {name: "hh.sync.3", bpm: [80, 160]},
  {name: "hh.sync.2", bpm: [80, 160]},
  {name: "hh.sync.1", bpm: [80, 160]},
  {name: "shaker.4", bpm: [80, 160]},
  {name: "offset_hh", bpm: [80, 160]},
]

const TARGET_KEY = 8
let songListenerRemover = null;

const setLoopKey = async () => {
  loops = {}
  const clips = await trackDict["loops"].clips
  for (const clip of clips) {
    let loopQuery = `SELECT name, key, bpm FROM loops WHERE name = '${loopName}'`
    let loopResults = await db.prepare(loopQuery).all()
    if (loopResults.length === 1) {
      let loopData = loopResults[0]

      // ensure various qualities of clip
      // await loop.set("looping", 1)
      // await loop.set("warp_mode", 4)
      var pitchCorrection = TARGET_KEY - parseInt(loopData.key)
      if (pitchCorrection > 6) {
        pitchCorrection = pitchCorrection - 12
      }
      if (pitchCorrection <= -6) {
        pitchCorrection = pitchCorrection + 12
      }
      await clip.clip.set("pitch_coarse", pitchCorrection)
    }
  }
}

const init = async () => {
  await ableton.start()
  trackDict = {};

  tracks = await ableton.song.get("tracks");
  for (const track of tracks) {
    let trackName = await track.get("name")

    let chainParam;
    let clips = {}
    const clipSlots = await track.get("clip_slots")
    for (const clipSlot of clipSlots) {
      const clip = await clipSlot.get("clip");
      if (!clip) {
        break
      }

      let clipName = await clip.get("name")
      clips[clipName] = {
        "clip": clip,
        "clipSlot": clipSlot,
      }

      if (trackName.startsWith("loop")) {
        let loopQuery = `SELECT name, key, bpm FROM loops WHERE name = '${clipName}'`
        let loopResults = await db.prepare(loopQuery).all()
        if (loopResults.length === 1) {
          clips[clipName].data = loopResults[0]

//          var pitchCorrection = TARGET_KEY - parseInt(loopResults[0].key)
//          if (pitchCorrection > 6) {
//            pitchCorrection = pitchCorrection - 12
//          }
//          if (pitchCorrection <= -6) {
//            pitchCorrection = pitchCorrection + 12
//          }
//          await clip.set("pitch_coarse", pitchCorrection)
        } else {
          //console.log(clipName)
        }
      }
      if (trackName === "kick" ||
          trackName === "snare" ||
          trackName === "hh") {
        let devices = await track.get("devices")
        let instrument;
        for (let device of devices) {
          let deviceName = await device.get("name")
          if (deviceName === "Drum") {
            instrument = device
            break;
          }
        }
        const parameters = await instrument.get('parameters')
        for (const parameter of parameters) {
          const parameterName = await parameter.get("name")
          if (parameterName === "Chain") {
            chainParam = parameter
          }
        }
      }
    }

    trackDict[await trackName] = {
      track: track,
      clips: clips,
      chainParam: chainParam,
    }
  }

  if (songListenerRemover) {
    await songListenerRemover()
  }
  songListenerRemover = await ableton.song.addListener("current_song_time", (async (time) => {
    await beat(time)
  }));
}

let processingBeat = false
let currentBeat = 0;
const beat = async(beats) => {
  // trigger only on first call after new beat
  if (currentBeat == Math.floor(beats)) {
    return
  }
  currentBeat = Math.round(beats)
  if (processingBeat) {
    console.log("RACE CONDITION")
    return
  }
  processingBeat = true

  let bpm = await ableton.song.get("tempo")

  if (((currentBeat + 16 * 4) % (32 * 4)) === (8 * 4 - 1) || ((currentBeat + 16 * 4) % (32 * 4)) === (24 * 4 - 1)) {
    await toggleHH(bpm, true)
  }

  if (((currentBeat + 16 * 4) % (32 * 4)) === (16 * 4 - 1)) {
    await toggleKick(bpm, true)
    await toggleHH(bpm, false)
    await toggleSnare(bpm)
//    await toggleChords(bpm)
//    await toggleLead(bpm)
  }
  if (((currentBeat + 16 * 4) % (32 * 4)) === (32 * 4 - 1)) {
    await toggleKick(bpm, false)
    await toggleHH(bpm, false)
//    await toggleChords(bpm)
//    await toggleLead(bpm)
    await toggleSnare(bpm)
  }

  processingBeat = false
}

const toggleHH = async (bpm, toggle) => {
  if (toggle) {
    let filteredClips = hhInfo.filter((hhClip) => {
      return hhClip.bpm[0] < bpm && hhClip.bpm[1] > bpm
    })
    let nextClip = randomChoice(filteredClips)
    await trackDict["hh"].clips[nextClip.name].clip.fire()
    await trackDict["hh"].chainParam.set("value", Math.floor(128 * Math.random()))
  } else {
    await trackDict["hh"].clips["blank"].clip.fire()
  }
}

const toggleKick = async (bpm, toggle) => {
  if (toggle) {
    let nextClip = randomChoice(kickInfo.filter((kickClip) => {
      return kickClip.bpm[0] < bpm && kickClip.bpm[1] > bpm
    }))
    await trackDict["kick"].clips[nextClip.name].clip.fire()
    await trackDict["kick"].chainParam.set("value", Math.floor(128 * Math.random()))

  } else {
    await trackDict["kick"].clips["blank"].clip.fire()
  }
}

const toggleSnare = async (bpm) => {
  let nextClip = randomChoice(snareInfo.filter((snareClip) => {
    return snareClip.bpm[0] < bpm && snareClip.bpm[1] > bpm
  }))
  await trackDict["snare"].clips[nextClip.name].clip.fire()
  await trackDict["snare"].chainParam.set("value", Math.floor(128 * Math.random()))
}

const toggleChords = async (bpm) => {
  nextClip = randomChoice(Object.values(trackDict["loop.chord"].clips).filter((clip) => {
    if (!clip.data) {
      console.log(clip.clip.raw.name)
      return false
    }
    return clip.data.bpm < bpm + 5 && clip.data.bpm > bpm - 20
  }))
  await nextClip.clip.fire()
}

const toggleLead = async (bpm) => {
  let clipChoices = Object.values(trackDict["loop.lead"].clips).filter((clip) => {
    if (!clip.data) {
      console.log(clip.clip.raw.name)
      return false
    }
    return clip.data.bpm < bpm + 5 && clip.data.bpm > bpm - 20
  })
  let nextClip = randomChoice(clipChoices)
  await nextClip.clip.fire()
}

init().then(function() {
  console.log("initalized!")
})
