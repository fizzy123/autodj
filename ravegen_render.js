const { Ableton } = require("ableton-js");
const { randomChoice } = require("./util");
const db = require('better-sqlite3')('C:/Users/fizzz/Dropbox/User Library/Presets/Instruments/Max Instrument/songs.db');
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
  {name: "4s", bpm: [80, 160]},
  {name: "8s", bpm: [80, 160]},
  {name: "3s", bpm: [80, 160]},
  {name: "6s", bpm: [80, 160]},
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
  {name: "4s", bpm: [80, 160]},
  {name: "8s", bpm: [80, 160]},
  {name: "3s", bpm: [80, 160]},
  {name: "6s", bpm: [80, 160]},
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
  {name: "offset_hh_slow", bpm: [80, 160]},
]

let majMelodies = [
  "blip.2",
  "chippy.9",
  "chippy.10",
  "spicy_boyfriend",
  "chippy.12",
  "distorted.2",
  "dr_mario",
  "eudaimonia_overture",
  "feeling_this",
  "finish_line",
  "flute.3",
  "flute.7",
  "flute.8",
  "gay_pirates",
  "get_olde_second_wind",
  "ghost",
  "guitar.1",
  "i_aint_saying_he_a_gold_digga",
  "its_strange",
  "ka_ba_ta",
  "lifeproof",
  "lollipop_kiss",
  "lounge",
  "madness",
  "meteor_eschat",
  "music_box.1",
  "pluck.2",
  "reach_out_to_the_truth",
  "royals",
  "safety_animals",
  "samantha",
  "secondary",
  "sex_and_drugs",
  "synth.4",
  "tappy.1",
  "the_voiceless.2",
  "tightrope",
  "twang.1",
  "vocal.1",
  "vocal.9",
  "we_will_rock_you",
  "weirdy.2",
  "what_i_know",
  "world_in_harmony",
  "midsummer madness.1",
  "thank u next.2",
  "energy.2",
  "jesus.5",
  "bet you wanna.3",
  "ice cream.1",
  "ice cream.3"
]

let minMelodies = [
  "blip.1",
  "windy",
  "partition",
  "chippy.6",
  "chippy.11",
  "choir.1",
  "choir.3",
  "glitch",
  "bed"
]

let clipMapping = {
  "blip.2": majMelodies,
  "breakneck_speed": majMelodies,
  "chippy.9": majMelodies,
  "chippy.10": majMelodies,
  "chippy.12": majMelodies,
  "distorted.2": majMelodies,
  "divinity.2": majMelodies,
  "dr_mario": majMelodies,
  "eudaimonia_overture": majMelodies,
  "feeling_this": majMelodies,
  "finish_line": majMelodies,
  "flute.3": majMelodies,
  "flute.7": majMelodies,
  "flute.8": majMelodies,
  "gay_pirates": majMelodies,
  "get_olde_second_wind": majMelodies,
  "ghost": majMelodies,
  "guitar.1": majMelodies,
  "harp.1": majMelodies,
  "harp.3": majMelodies,
  "harp.4": majMelodies,
  "harp.4": majMelodies,
  "i_aint_saying_he_a_gold_digga": majMelodies,
  "its_strange": majMelodies,
  "just_for_now": majMelodies,
  "ka_ba_ta": majMelodies,
  "kids": majMelodies,
  "latch": majMelodies,
  "lawn_knives": majMelodies,
  "life_coach": majMelodies,
  "lifeproof": majMelodies,
  "like_a_mouse": majMelodies,
  "liquor_stains": majMelodies,
  "lollipop_kiss": majMelodies,
  "lounge": majMelodies,
  "madness": majMelodies,
  "memories_that_you_call.1": majMelodies,
  "meteor_eschat": majMelodies,
  "moonbase_blues": majMelodies,
  "music_box.1": majMelodies,
  "my_kinda_woman": majMelodies,
  "white_lies": majMelodies,
  "oh_love": majMelodies,
  "pluck.2": majMelodies,
  "reach_out_to_the_truth": majMelodies,
  "rock": majMelodies,
  "royals": majMelodies,
  "runaway": majMelodies,
  "running_behind": majMelodies,
  "safety_animals": majMelodies,
  "samantha": majMelodies,
  "same_mistakes": majMelodies,
  "search_party_animal": minMelodies,
  "secondary": majMelodies,
  "sex_and_drugs": majMelodies,
  "since_jimmy": majMelodies,
  "spicy_boyfriend": majMelodies,
  "synth.4": majMelodies,
  "tappy.1": majMelodies,
  "the_voiceless.2": majMelodies,
  "tightrope": majMelodies,
  "time_for_you_to_stand_up": majMelodies,
  "twang.1": majMelodies,
  "woof_woof": majMelodies,
  "vocal.1": majMelodies,
  "vocal.9": majMelodies,
  "we_will_rock_you": majMelodies,
  "weirdy.2": majMelodies,
  "what_i_know": majMelodies,
  "world_in_harmony": majMelodies,
  "midsummer madness.1": majMelodies,
  "ringtone remix.1": majMelodies,
  "ringtone remix.3": majMelodies,
  "thank u next.2": majMelodies,
  "alien superstar.2": majMelodies,
  "alien superstar.3": majMelodies,
  "pure honey.1": majMelodies,
  "pure honey.2": majMelodies,
  "pure honey.3": majMelodies,
  "pure honey.8": majMelodies,
  "energy.2": majMelodies,
  "energy.3": majMelodies,
  "bet you wanna.3": majMelodies,
  "ice cream.1": majMelodies,
  "ice cream.3": majMelodies,
  "archers.1": minMelodies,
  "vocal.14": majMelodies,
  "jesus.5": majMelodies,
  "broccoli.2": majMelodies,
  "bubblegum_popcorn": majMelodies,
  "brambles": majMelodies,
  "cluster_a": majMelodies,
  "dear_my_love.1": majMelodies,
  "dear_my_love.2": majMelodies,
  "densmore": majMelodies,
  "harp.5": majMelodies,
  "thank u next.1": majMelodies,
  "heaven": majMelodies,
  "helix.2": majMelodies,
  "home": majMelodies,
  "i_need_you": majMelodies,
  "i_want_to_be_naked": majMelodies,
  "next_to_me": majMelodies,
  "octahate": majMelodies,
  "pls_stay_the_night": majMelodies,
  "pixel_forest": majMelodies,
  "san_fran": majMelodies,
  "you_dont_know_my_name": majMelodies,
  "taipei": majMelodies,
  "tomggg": majMelodies,
  "truck_stop_gospel": majMelodies,
  "u_n_me": majMelodies,
  "blip.1": minMelodies,
  "windy": minMelodies,
  "partition": minMelodies,
  "chippy.6": minMelodies,
  "chippy.11": minMelodies,
  "choir.1": minMelodies,
  "choir.3": minMelodies,
  "glitch": minMelodies,
  "bed": minMelodies,
}

let clipTonic = {
  "blip.2": "maj",
  "breakneck_speed": "maj",
  "chippy.9": "maj",
  "chippy.10": "maj",
  "chippy.12": "maj",
  "distorted.2": "maj",
  "divinity.2": "maj",
  "dr_mario": "maj",
  "eudaimonia_overture": "maj",
  "feeling_this": "maj",
  "finish_line": "maj",
  "flute.3": "maj",
  "flute.7": "maj",
  "flute.8": "maj",
  "gay_pirates": "maj",
  "get_olde_second_wind": "maj",
  "ghost": "maj",
  "guitar.1": "maj",
  "harp.1": "maj",
  "harp.3": "maj",
  "harp.4": "maj",
  "harp.4": "maj",
  "i_aint_saying_he_a_gold_digga": "maj",
  "its_strange": "maj",
  "just_for_now": "maj",
  "ka_ba_ta": "maj",
  "kids": "maj",
  "latch": "maj",
  "lawn_knives": "maj",
  "life_coach": "maj",
  "lifeproof": "maj",
  "like_a_mouse": "maj",
  "liquor_stains": "maj",
  "lollipop_kiss": "maj",
  "lounge": "maj",
  "madness": "maj",
  "memories_that_you_call.1": "maj",
  "meteor_eschat": "maj",
  "moonbase_blues": "maj",
  "music_box.1": "maj",
  "my_kinda_woman": "maj",
  "white_lies": "maj",
  "oh_love": "maj",
  "pluck.2": "maj",
  "reach_out_to_the_truth": "maj",
  "rock": "maj",
  "royals": "maj",
  "runaway": "maj",
  "running_behind": "maj",
  "safety_animals": "maj",
  "samantha": "maj",
  "same_mistakes": "maj",
  "search_party_animal": "min",
  "secondary": "maj",
  "sex_and_drugs": "maj",
  "since_jimmy": "maj",
  "spicy_boyfriend": "maj",
  "synth.4": "maj",
  "tappy.1": "maj",
  "the_voiceless.2": "maj",
  "tightrope": "maj",
  "time_for_you_to_stand_up": "maj",
  "twang.1": "maj",
  "woof_woof": "maj",
  "vocal.1": "maj",
  "vocal.9": "maj",
  "we_will_rock_you": "maj",
  "weirdy.2": "maj",
  "what_i_know": "maj",
  "world_in_harmony": "maj",
  "midsummer madness.1": "maj",
  "ringtone remix.1": "maj",
  "ringtone remix.3": "maj",
  "thank u next.2": "maj",
  "alien superstar.2": "maj",
  "alien superstar.3": "maj",
  "pure honey.1": "maj",
  "pure honey.2": "maj",
  "pure honey.3": "maj",
  "pure honey.8": "maj",
  "energy.2": "maj",
  "energy.3": "maj",
  "bet you wanna.3": "maj",
  "ice cream.1": "maj",
  "ice cream.3": "maj",
  "archers.1": "maj",
  "vocal.14": "maj",
  "jesus.5": "maj",
  "broccoli.2": "maj",
  "bubblegum_popcorn": "maj",
  "brambles": "maj",
  "cluster_a": "maj",
  "dear_my_love.1": "maj",
  "dear_my_love.2": "maj",
  "densmore": "maj",
  "harp.5": "maj",
  "thank u next.1": "maj",
  "heaven": "maj",
  "helix.2": "maj",
  "home": "maj",
  "i_need_you": "maj",
  "i_want_to_be_naked": "maj",
  "next_to_me": "maj",
  "octahate": "maj",
  "pls_stay_the_night": "maj",
  "pixel_forest": "maj",
  "san_fran": "maj",
  "you_dont_know_my_name": "maj",
  "taipei": "maj",
  "tomggg": "maj",
  "truck_stop_gospel": "maj",
  "u_n_me": "maj",
  "blip.1": "min",
  "windy": "min",
  "partition": "min",
  "chippy.6": "min",
  "chippy.11": "min",
  "choir.1": "min",
  "choir.3": "min",
  "glitch": "min",
  "bed": "min",
}

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

let HISTORY = [];

const init = async () => {
  await ableton.start()
  trackDict = {};

  tracks = await ableton.song.get("tracks");
  for (const track of tracks) {
    let trackName = await track.get("name")

    let chainParam;
    let majParam;
    let minParam;
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
          trackName === "perc" ||
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
          if (parameterName === "Maj On") {
            majParam = parameter
          }
          if (parameterName === "Min On") {
            minParam = parameter
          }
        }
      }
    }

    trackDict[await trackName] = {
      track: track,
      clips: clips,
      chainParam: chainParam,
      majParam: majParam,
      minParam: minParam,
    }
  }
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
  let startTime = Date.now();
  processingBeat = true

  let bpm = await ableton.song.get("tempo")
  if (((currentBeat) % (32 * 4)) === (32 * 4 - 1)) {
    await toggleLoop()
  }
  // Not awaiting since they are independent and so that we don't take too long to trigger clips.
  if (((currentBeat) % (16 * 4)) === (4 * 4 - 1) || ((currentBeat) % (16 * 4)) === (12 * 4 - 1)) {
    toggleHH(bpm, true)
  }

  if (((currentBeat) % (16 * 4)) === (8 * 4 - 1)) {
    toggleKick(bpm, true)
    toggleHH(bpm, false)
    toggleSnare(bpm)
  }
  if (((currentBeat) % (16 * 4)) === (16 * 4 - 1)) {
    if (Math.random() > 0.5) {
      toggleKick(bpm, false)
      toggleHH(bpm, false)
    }
    toggleComplement()
    toggleSnare(bpm)
    togglePerc(bpm)
  }

  duration = Date.now() - startTime
  if (duration > 100) {
    console.log(duration)
  }

  processingBeat = false
}

const renderLoop = async () => {
  await trackDict["loops"].clips[CURRENT_LOOP].clip.fire()
  if (clipTonic[CURRENT_LOOP] === "maj") {
    await trackDict["kick"].majParam.set("value", 127)
    await trackDict["kick"].minParam.set("value", 0)
  } else if (clipTonic[CURRENT_LOOP] === "min") {
    await trackDict["kick"].majParam.set("value", 0)
    await trackDict["kick"].minParam.set("value", 127)
  }
}

const getNewLoop = () => {
  if (Object.keys(clipMapping).filter(loop => !HISTORY.includes(loop)).length === 0) {
    HISTORY = []
  }
  let loop = randomChoice(Object.keys(clipMapping)
//    .filter(loop => !HISTORY.includes(loop)) disabling history uniqueness for now
  )
  HISTORY.push(loop)
  return loop
}

const toggleComplement = async() => {
  if (!CURRENT_LOOP) {
    return
  }
  if (clipMapping[CURRENT_LOOP].filter(loop => !HISTORY.includes(loop))) {
    HISTORY = []
  }
  let nextComplement = randomChoice(clipMapping[CURRENT_LOOP].filter(loop => !HISTORY.includes(loop)))
  HISTORY.push(CURRENT_LOOP)
  await trackDict["complements"].clips[nextComplement].clip.fire()
}

const getNewComplement = (currentLoop) => {
  if (!currentLoop) {
    return
  }
  if (clipMapping[currentLoop].filter(loop => !HISTORY.includes(loop))) {
    HISTORY = []
  }
  let nextComplement = randomChoice(clipMapping[currentLoop]
//    .filter(loop => !HISTORY.includes(loop))
  )
  HISTORY.push(nextComplement)
  return nextComplement
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

const getNewHH = (bpm) => {
    let filteredClips = hhInfo.filter((hhClip) => {
      return hhClip.bpm[0] < bpm && hhClip.bpm[1] > bpm
    })
    return randomChoice(filteredClips).name
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

const getNewKick = (bpm) => {
    return randomChoice(kickInfo.filter((kickClip) => {
      return kickClip.bpm[0] < bpm && kickClip.bpm[1] > bpm
    })).name
}

const toggleSnare = async (bpm) => {
  let nextClip = randomChoice(snareInfo.filter((snareClip) => {
    return snareClip.bpm[0] < bpm && snareClip.bpm[1] > bpm
  }))
  await trackDict["snare"].clips[nextClip.name].clip.fire()
  await trackDict["snare"].chainParam.set("value", Math.floor(128 * Math.random()))
}

const getNewSnare = (bpm) => {
  return randomChoice(snareInfo.filter((snareClip) => {
    return snareClip.bpm[0] < bpm && snareClip.bpm[1] > bpm
  })).name
}

const togglePerc = async (bpm) => {
  let nextClip = randomChoice(snareInfo.filter((snareClip) => {
    return snareClip.bpm[0] < bpm && snareClip.bpm[1] > bpm
  }))
  await trackDict["perc"].clips[nextClip.name].clip.fire()
  await trackDict["perc"].chainParam.set("value", Math.floor(128 * Math.random()))
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

const measureCount = 1024
const render = async () => {
  let bpm = await ableton.song.get("tempo")
  let setLength = 4 * measureCount
  let currentTime = 0
  let currentLoop, currentLoopLength

  let currentComplement, currentComplementLength

  let currentHH, currentHHLength

  let currentKick, currentKickLength

  let currentSnare, currentSnareLength

  let currentPerc, currentPercLength

  while (currentTime < setLength) {
    // loops change every 16 measures
    if (((currentTime) % (16 * 4)) === 0) {
      let tmpLoop = getNewLoop()
      currentLoop = trackDict["loops"].clips[tmpLoop].clip
      currentLoopLength = await currentLoop.get("length")
    }
    if (currentTime % currentLoopLength === 0) {
      await trackDict["loops"].track.duplicateClipToArrangement(currentLoop.raw.id, currentTime)
    }
    
    // complements change every 8 measures
    if (((currentTime) % (8 * 4)) === 0) {
      let tmpComplement = getNewComplement(getNewComplement(currentLoop.raw.name))
      currentComplement = trackDict["complements"].clips[tmpComplement].clip
      currentComplementLength = await currentComplement.get("length")
    }
    if (currentTime % currentComplementLength === 0) {
      await trackDict["complements"].track.duplicateClipToArrangement(currentComplement.raw.id, currentTime)
    }

    // hihats change every 8 measures and toggle on and off every 4 measures
    if (((currentTime) % (8 * 4)) === 0) {
      currentHH = trackDict["hh"].clips[getNewHH(bpm)].clip
      currentHHLength = await currentHH.get("length")
    }
    if (currentTime % currentHHLength === 0 && currentTime % (8 * 4) >= (4 * 4)) {
      await trackDict["hh"].track.duplicateClipToArrangement(currentHH.raw.id, currentTime)
    }

    // kicks change every 16 measures and toggle on and off every 8 measures
    if (((currentTime) % (16 * 4)) === 0) {
      currentKick = trackDict["kick"].clips[getNewKick(bpm)].clip
      currentKickLength = await currentKick.get("length")
    }
    if (currentTime % currentKickLength === 0 && currentTime % (16 * 4) >= (8 * 4)) {
      await trackDict["kick"].track.duplicateClipToArrangement(currentKick.raw.id, currentTime)
    }

    // snares change every 8 measures
    if (((currentTime) % (8 * 4)) === 0) {
      let tmpSnare = getNewSnare(bpm)
      currentSnare = trackDict["snare"].clips[tmpSnare].clip
      currentSnareLength = await currentSnare.get("length")
    }
    if (currentTime % currentSnareLength === 0) {
      await trackDict["snare"].track.duplicateClipToArrangement(currentSnare.raw.id, currentTime)
    }

    // perc changes every 8 measures
    if (((currentTime) % (8 * 4)) === 0) {
      currentPerc = trackDict["perc"].clips[getNewSnare(bpm)].clip
      currentPercLength = await currentPerc.get("length")
    }
    if (currentTime % currentPercLength === 0) {
      await trackDict["perc"].track.duplicateClipToArrangement(currentPerc.raw.id, currentTime)
    }

    currentTime = currentTime + 4
  }
}

init().then(render).then(function() {
  console.log("rendered!")
  process.exit()
})
