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
  let oldEnv = {}
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
    oldEnv = Object.assign({}, env);
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
      await trackDict["songs"].clips[nextSongName].clip.set("pitch_coarse", 0)
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
    return trackDict["songs"].clips[songName].clipSlot.clipIndex + 1
  }

  const deleteSong = async (songName) => {
    await trackDict["songs"].clips[songName].clipSlot.deleteClip()

    let clipSlots = await trackDict["songs"].get("clip_slots")
    firstOpenClipSlot = -1
    for (let i=0; i<clipSlots.length; i++) {
      let hasClip = await clipSlots[i].get("has_clip")
      if (firstOpenClipSlot < 0 && !hasClip) {
        firstOpenClipSlot = i
      }
      if (firstOpenClipSlot >= 0 && hasClip) {
        clipSlots[i].duplicateClipTo(clipSlots[firstOpenClipSlot])
        firstOpenClipSlot = firstOpenClipSlot + 1
      }
    }
  }

  const undo = () => {
    env = oldEnv
    env = Object.assign({}, oldEnv);
  }

  let replServer = repl.start({ignoreUndefined: true})
  replServer.context.env = env
  replServer.context.trackDict = trackDict
  replServer.context.songDict = songDict
  replServer.context.loopDict = loopDict
  replServer.context.undo = undo
  replServer.context.get = get
  replServer.context.getLoops = getLoops
  replServer.context.next = nextWrapper // need to do this so that next gets updated
  replServer.context.load = loadWrapper // done to avoid async callback
  replServer.context.loadClip = loadClipWrapper // done to avoid async callback
  replServer.context.loadTransition = loadTransition
  replServer.context.loadDrums = loadDrums
  replServer.context.loadAudioLoop = loadAudioLoop
  replServer.context.findSongIndex = findSongIndex
  replServer.context.deleteSong = deleteSong
  replServer.context.saveState = saveState
  replServer.context.loadState = loadState
})()
