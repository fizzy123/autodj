const stringify = require('json-stable-stringify');
const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console});
const fs = require('fs');
const repl = require("repl");
const chalk = require("chalk");
const util = require("./util.js");

/*
Song JSON format:
{
  "{name}": {
    "key": ...,
    "bpm": ...,
    "start_time": ...,
    "end_time": ...,
    "tags": ..., // Includes genre, vibe, and generic intro/transition notes
    "transition_notes": {
      "{song_name}": {
        "ranking": ...,
        "text": ...,
      },
      ...
    },
    "notes": ..., // this is meant to include more detailed notes. maybe this includes notes about interesting things i could do to remix the song, or what i could do on my guitar, etc. 
  },
...
}
  */

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
};


(async () => {
  // init env variables
  let env = {
    key: undefined,
    bpm: undefined,
    lastLoadedSongName: undefined,
    songCursor: 0,
    currentTrack: "A",
    history: [],
    loopHistory: [],
    recentlyShownSongs: [],
  }
  let nextWrapper = () => {next()}
  let next = () => {}

  // load resources
  let songDict = JSON.parse(fs.readFileSync('songs.json', 'utf8'));
  let loopDict = JSON.parse(fs.readFileSync('loops.json', 'utf8'));
  
  // add name to details
  for (const [songName, details] of Object.entries(songDict)) {
    details.name = songName;
  }
  for (const [loopName, details] of Object.entries(loopDict)) {
    details.name = loopName;
  }

  // load ableton state
  await ableton.start()

  let trackDict = {};
  let loadTimeStart = Date.now();
  tracks = await ableton.song.get("tracks");
  for (const track of tracks) {
    let chainParam;
    let majMinParam;
    let keyParam;
    clips = {}
    const clipSlots = await track.get("clip_slots")
    for (let i=0;i<clipSlots.length;i++) {
      const clipSlot = clipSlots[i]
      clipSlot.clipIndex = i
      const clip = await clipSlot.get("clip");
      if (!clip) {
        break
      }

      // ensure various qualities of clip
      // await clip.set("pitch_coarse", 0)
      // await clip.set("warp_mode", 4)

      clipName = clip.raw.name
      clips[clipName] = {
        "clip": clip,
        "clipSlot": clipSlot,
      }
    }

    let trackName = track.raw.name
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
        if (parameterName === "Key") {
          keyParam = parameter
        }
        if (parameterName === "Major/Minor") {
          majMinParam = parameter
        }
      }
    }

    track.clips = clips
    track.chainParam = chainParam
    track.majMinParam = majMinParam
    track.keyParam = keyParam
    trackDict[track.raw.name] = track
  }
  console.log(`Load Time: ${(Date.now() - loadTimeStart)/1000}s`)

  const get = (
    anyKey = false,
    key, 
    bpm,
    lastLoadedSongName,
    keyRange = 1,
    bpmRange = 5
  ) => {
    if (key === undefined) {
      key = env.key
    }
    if (bpm === undefined) {
      bpm = env.bpm
    }
    if (lastLoadedSongName === undefined) {
      lastLoadedSongName = env.lastLoadedSongName
    }
    if (key === undefined || bpm === undefined || !lastLoadedSongName === undefined) {
      console.log(chalk.yellow("no song loaded. assuming you want starting songs"))
      getStartingSongs()
      return
    }
    if (!songDict[lastLoadedSongName]) {
      throw new Error(`error! ${lastLoadedSongName} not found in songDict`)
    }
    let transitionNotes = songDict[lastLoadedSongName].transitionNotes
    let songs = []
    for (const song of Object.values(songDict)) {
      let keyCondition = (
        (song.key >= key - keyRange && song.key <= key + keyRange) ||
        (song.key + 12 >= key - keyRange && song.key + 12 <= key + keyRange) || // handle wraparounds
        (song.key - 12 >= key - keyRange && song.key - 12 <= key + keyRange)
      )
      if (anyKey) {
        keyCondition = true
      }
      let bpmCondition = (
        (song.bpm >= bpm - bpmRange && song.bpm <= bpm + bpmRange) ||
        (song.bpm + 80 >= bpm - bpmRange && song.bpm + 80 <= bpm + bpmRange) || // handle wraparounds
        (song.bpm - 80 >= bpm - bpmRange && song.bpm - 80 <= bpm + bpmRange)
      )
      if (keyCondition && bpmCondition && !env.history.includes(song.name)) {
        songs.push(song)
      }
    }
    songs = util.shuffle(songs)
    songs.sort((a, b) => {
      aRanking = transitionNotes[a.name]?.ranking
      if (!aRanking) {
        aRanking = 3
      }

      bRanking = transitionNotes[b.name]?.ranking
      if (!bRanking) {
        bRanking = 3
      }
      return bRanking - aRanking
    })
    printSongs(songs, transitionNotes)
  }

  const getStartingSongs = () => {
    let songs = [];
    for (const song of Object.values(songDict)) {
      if (song.tags?.includes("starting-song")) {
        songs.push(song)
      }
    }
    songs = util.shuffle(songs)
    printSongs(songs)
  }

  const printSongs = (songs, transitionNotes = {}, index=0, pageSize=10) => {
    let done = false;

    env.recentlyShownSongs = []
    for (let i=index; i<index+pageSize; i++) {
      if (songs[i] === undefined) {
        console.log("hit end of list") 
        break;
      }
      let songString = `${i-index}) ${chalk.white(songs[i].name)} [${chalk.blue(songs[i].key)}][${chalk.cyan(songs[i].bpm)}]`
      if(songs[i].tags) {
        songString = songString + `[${chalk.magenta(songs[i].tags)}]`
      }
      if (transitionNotes[songs[i].name]) {
        songString = songString + `
  [${transitionNotes[songs[i].name].ranking || 3}]${transitionNotes[songs[i].name].text || ""}`
      }
      console.log(songString)
      env.recentlyShownSongs.push(songs[i])
    }

    // this is a weird dumb function i'm making so to making pagination of songs easier. 
    next = () => {
      printSongs(songs, transitionNotes, index+pageSize)
    }
  }

  const getLoops = () => {
    if (!env.key) {
      throw new Error("no key found. you must load a song first")
    }
    let key = env.key
    let bpm = env.bpm
    let keyRange = 2
    let bpmRange = 10
    let loops = [];
    for (const loop of Object.values(loopDict)) {
      let keyCondition = (
        (loop.key >= key - keyRange && loop.key <= key + keyRange) ||
        (loop.key + 12 >= key - keyRange && loop.key + 12 <= key + keyRange) || // handle wraparounds
        (loop.key - 12 >= key - keyRange && loop.key - 12 <= key + keyRange)
      ) || loop.key === -1
      let bpmCondition = (
        (loop.bpm >= bpm - bpmRange && loop.bpm <= bpm + bpmRange) ||
        (loop.bpm + 80 >= bpm - bpmRange && loop.bpm + 80 <= bpm + bpmRange) || // handle wraparounds
        (loop.bpm - 80 >= bpm - bpmRange && loop.bpm - 80 <= bpm + bpmRange)
      )
      if (keyCondition && bpmCondition) {
        loops.push(loop)
      }
    }
    loops = util.shuffle(loops)
    env.recentlyShownLoops = []
    for (let i=0;i<10;i++) {
      let loop = loops[i]
      console.log(`${i}) ${chalk.white(loop.name)} [${chalk.blue(loop.key)}][${chalk.cyan(loop.bpm)}]`)
      env.recentlyShownLoops.push(loop)
    }
  }

  const loadWrapper = (...args) => {
    load(...args)
  }
  const load = async (nextSongName, keyChange = false) => {
    if (typeof nextSongName === "number") {
      nextSongName = env.recentlyShownSongs[nextSongName]?.name
      if (!nextSongName) {
        throw new Error("loading from recently shown songs failed")
      }
      console.log(`loading ${nextSongName} from recently shown songs`)
    }
    if (nextSongName === undefined) {
      throw new Error("no song provided")
    }
    let songPosition = 0
    let nextSong = songDict[nextSongName]
    if (nextSong === undefined) {
      throw new Error(`can't find next song: ${nextSongName}`)
    }
    if (env.songCursor !== 0) {
      songPosition = env.songCursor - nextSong.startTime
    }

    if (!env.lastLoadedSongName || keyChange) {
      console.log("key set")
      env.key = nextSong.key
    } else {
      diff = env.key - nextSong.key
      if (env.key === 11 && nextSong.key === 0) {
        diff = -1
      } else if (env.key === 0 && nextSong.key === 11) {
        diff = 1
      }
      await trackDict["songs"].clips[nextSongName].clip.set("pitch_coarse", diff)
    }

    if (!env.lastLoadedSongName) {
      await ableton.song.set("tempo", nextSong.bpm)
    }

    await trackDict[env.currentTrack].duplicateClipToArrangement(trackDict["songs"].clips[nextSongName].clip.raw.id, songPosition)
    switchTracks()
    if (env.lastLoadedSongName) {
      loadTransition(env.songCursor, "swell", "swell")
      loadTransition(env.songCursor, env.currentTrack, "endless_smile")
    }

    env.bpm = nextSong.bpm
    env.lastLoadedSongName = nextSong.name
    env.songCursor = songPosition + nextSong.endTime
    env.history.push(nextSong.name)
    env.recentlyShownSongs = []

    let logString = `Loaded ${chalk.white(nextSong.name)} [${chalk.blue(nextSong.key)}][${chalk.cyan(nextSong.bpm)}]`
    if (nextSong.notes) {
      logString = logString + `
  ${nextSong.notes}`
    }
    console.log(logString)
  }

  const switchTracks = () => {
    if (env.currentTrack === 'A') {
      env.currentTrack = "B"
    } else if (env.currentTrack === 'B') {
      env.currentTrack = "A"
    }
  }


  const loadClipWrapper = (...args) => {
    loadClip(...args)
  }
  const loadClip = async (sourceTrackName, clipName, time, destinationTrackName) => {
    if (sourceTrackName === undefined ||
        clipName === undefined ||
        time === undefined) {
      throw new Error("clip details not provided")
    }
    if (sourceTrackName === "loops") {
      if (env.key === undefined) {
        throw new Error("clip details not provided")
      }
      let loop = loopDict[clipName]
      diff = env.key - loop.key
      if (env.key === 11 && loop.key === 0) {
        diff = -1
      } else if (env.key === 0 && loop.key === 11) {
        diff = 1
      }
      await trackDict[sourceTrackName].clips[clipName].clip.set("pitch_coarse", diff)
    }
    if (!destinationTrackName) {
      if (!trackDict[sourceTrackName]) {
        console.log(`"${sourceTrackName}" not found.`)
      }
      await trackDict[sourceTrackName].duplicateClipToArrangement(trackDict[sourceTrackName].clips[clipName].clip.raw.id, time)
    } else {
      const clipSlots = await trackDict[destinationTrackName].get("clip_slots")
      let targetClipSlot = clipSlots[0]
      await trackDict[sourceTrackName].clips[clipName].clipSlot.duplicateClipTo(targetClipSlot)

      let targetClip = await targetClipSlot.get("clip")
      await trackDict[destinationTrackName].duplicateClipToArrangement(targetClip.raw.id, time)
    }
  }

  const TRANSITION_TYPES = [
    "endless_smile",
    "swell",
  ]
  const TRACK_TRANSITION_TYPES = [
    "endless_smile",
  ]
  const loadTransition = (transitionTime, track, type) => {
    if (transitionTime === undefined) {
      throw new Error("transition time not provided")

    }
    if (type === undefined) {
      type = util.randomChoice(TRANSITION_TYPES)
    }
    if (!TRANSITION_TYPES.includes(type)) {
      throw new Error("transition type not supported")
    }
    if (TRACK_TRANSITION_TYPES.includes(type) && track == undefined) {
      throw new Error("tried to do track transition but no track provided")
    }
    if (type === "endless_smile") {
      loadClipWrapper("effects." + track,"endless_smile", transitionTime - 4)
    } else if (type === "swell") {
      loadClipWrapper("swell","swell", transitionTime - 32)
    }
  }

  const loadDrums = (time, drumTrackName) => {
    let clipName = util.randomChoice(Object.keys(trackDict[drumTrackName].clips))
    console.log(clipName)
    loadClip(drumTrackName, clipName, time)
  } 

  const loadAudioLoop = (time, loopName, destinationTrackId) => {
    if (typeof loopName === "number") {
      loopName = env.recentlyShownLoops[loopName]?.name
      if (!loopName) {
        throw new Error("loading from recently shown loops failed")
      }
      console.log(`loading ${loopName} from recently shown loops`)
    }
    let loop = loopDict[loopName]
    let trackName = "loops"
    if (loop.key === -1) {
      trackName = "loops.perc"
    }
    loadClip(trackName, loopName, time, "loop.audio." + destinationTrackId)
  }

  const saveState = () => {
    fs.writeFileSync('.dj_cli_state.json', stringify(env));
  }

  const loadState = () => {
    env = JSON.parse(fs.readFileSync('.dj_cli_state.json', 'utf8'));
    replServer.context.env = env
  }

  const findSongIndex = (songName) => {
    return trackDict["songs"].clips[songName].clipSlot.clipIndex
  }

  const getNewLoop = (mode) => {
    if (Object.keys(clipMapping).filter(loop => !env.loopHistory.includes(loop)).length === 0) {
      env.loopHistory = []
    }
    let loop = util.randomChoice(Object.keys(clipMapping)
      .filter(loop => !env.loopHistory.includes(loop) && clipTonic[loop] == mode)
    )
    env.loopHistory.push(loop)
    return loop
  }

  const getNewComplement = (currentLoop) => {
    if (!currentLoop) {
      return
    }
    if (clipMapping[currentLoop].filter(loop => !env.loopHistory.includes(loop))) {
      env.loopHistory = []
    }
    let nextComplement = util.randomChoice(clipMapping[currentLoop]
  //    .filter(loop => !env.loopHistory.includes(loop))
    )
    env.loopHistory.push(nextComplement)
    return nextComplement
  }

  const getNewHH = (bpm) => {
    let filteredClips = hhInfo.filter((hhClip) => {
      return hhClip.bpm[0] <= bpm && hhClip.bpm[1] >= bpm
    })
    
    let clipName = util.randomChoice(filteredClips).name
    return clipName
  }

  const getNewKick = (bpm) => {
      return util.randomChoice(kickInfo.filter((kickClip) => {
        return kickClip.bpm[0] < bpm && kickClip.bpm[1] > bpm
      })).name
  }

  const getNewSnare = (bpm) => {
    return util.randomChoice(snareInfo.filter((snareClip) => {
      return snareClip.bpm[0] < bpm && snareClip.bpm[1] > bpm
    })).name
  }

  const render = async (mode, measureCount) => {
    if (mode === undefined) {
      throw new Error("mode must be provided")
    }
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
        let newLoopName = getNewLoop(mode)
        currentLoop = trackDict["loops"].clips[newLoopName].clip
        currentLoopLength = await currentLoop.get("length")

        if (env.key === undefined) {
          throw new Error("clip details not provided")
        }
        let loopInfo = loopDict[newLoopName]
        diff = env.key - loopInfo.key
        console.log(newLoopName)
        console.log(env.key)
        console.log(loopInfo.key)
        if (diff > 6) {
          diff = diff - 12
        } else if (diff < -6) {
          diff = diff + 12
        }
        console.log(diff)
        await currentLoop.set("pitch_coarse", diff)
      }

      if (currentTime % currentLoopLength === 0) {
        await trackDict["loops"].duplicateClipToArrangement(currentLoop.raw.id, currentTime + env.songCursor)
      }
      
      // complements change every 8 measures
      if (((currentTime) % (8 * 4)) === 0) {
        let newComplementName = getNewComplement(currentLoop.raw.name)
        currentComplement = trackDict["complements"].clips[newComplementName].clip
        currentComplementLength = await currentComplement.get("length")

        if (env.key === undefined) {
          throw new Error("clip details not provided")
        }
        let loopInfo = loopDict[newComplementName]
        diff = env.key - loopInfo.key
        console.log(newComplementName)
        console.log(env.key)
        console.log(loopInfo.key)
        if (diff > 6) {
          diff = diff - 12
        } else if (diff < -6) {
          diff = diff + 12
        }
        console.log(diff)
        await currentComplement.set("pitch_coarse", diff)
      }
      if (currentTime % currentComplementLength === 0) {
        await trackDict["complements"].duplicateClipToArrangement(currentComplement.raw.id, currentTime + env.songCursor)
      }

      // hihats change every 8 measures and toggle on and off every 4 measures
      if (((currentTime) % (8 * 4)) === 0) {
        currentHH = trackDict["hh"].clips[getNewHH(bpm)].clip
        currentHHLength = await currentHH.get("length")
      }
      if (currentTime % currentHHLength === 0 && currentTime % (8 * 4) >= (4 * 4)) {
        await trackDict["hh"].duplicateClipToArrangement(currentHH.raw.id, currentTime + env.songCursor)
      }

      // kicks change every 16 measures and toggle on and off every 8 measures
      if (((currentTime) % (16 * 4)) === 0) {
        currentKick = trackDict["kick"].clips[getNewKick(bpm)].clip
        currentKickLength = await currentKick.get("length")
      }
      if (currentTime % currentKickLength === 0 && currentTime % (16 * 4) >= (8 * 4)) {
        await trackDict["kick"].duplicateClipToArrangement(currentKick.raw.id, currentTime + env.songCursor)
      }

      // snares change every 8 measures
      if (((currentTime) % (8 * 4)) === 0) {
        let tmpSnare = getNewSnare(bpm)
        currentSnare = trackDict["snare"].clips[tmpSnare].clip
        currentSnareLength = await currentSnare.get("length")
      }
      if (currentTime % currentSnareLength === 0) {
        await trackDict["snare"].duplicateClipToArrangement(currentSnare.raw.id, currentTime + env.songCursor)
      }

      // perc changes every 8 measures
      if (((currentTime) % (8 * 4)) === 0) {
        currentPerc = trackDict["perc"].clips[getNewSnare(bpm)].clip
        currentPercLength = await currentPerc.get("length")
      }
      if (currentTime % currentPercLength === 0) {
        await trackDict["perc"].duplicateClipToArrangement(currentPerc.raw.id, currentTime + env.songCursor)
      }

      currentTime = currentTime + 4
    }

    env.songCursor = env.songCursor + currentTime
  }

  let replServer = repl.start({ignoreUndefined: true})
  replServer.context.env = env
  replServer.context.trackDict = trackDict
  replServer.context.songDict = songDict
  replServer.context.loopDict = loopDict
  replServer.context.get = get
  replServer.context.getLoops = getLoops
  replServer.context.next = nextWrapper // need to do this so that next gets updated
  replServer.context.load = loadWrapper // done to avoid async callback
  replServer.context.loadClip = loadClipWrapper // done to avoid async callback
  replServer.context.loadTransition = loadTransition
  replServer.context.loadDrums = loadDrums
  replServer.context.loadAudioLoop = loadAudioLoop
  replServer.context.findSongIndex = findSongIndex
  replServer.context.renderClub = (mode, measureCount = 32) => {
    loadTransition(env.songCursor, "swell", "swell")
    loadTransition(env.songCursor, env.currentTrack, "endless_smile")
    render(mode, measureCount)

  }
  replServer.context.saveState = saveState
  replServer.context.loadState = loadState
})()
