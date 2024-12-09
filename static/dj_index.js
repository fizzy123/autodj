// we have async functions in this load but that's fine
window.onload = function() {
  // load data
  loadEnv()

  getSongs()

  // set listeners
  $('.state').on("change", updateState)
  $('#undo').on("click", undo)
  $('#get-all').on("click", getAll)
  $("#load").on("click", load)
  $("#delete").on("click", del)
}

const loadEnv = async () => {
  const res = (await axios.get("/state")).data
  if (res.key) {
    $('#state-key').val(res.key)
  }
  if (res.bpm) {
    $('#state-bpm').val(res.bpm)
  }
  if (res.lastLoadedSongName) {
    $('#state-last-loaded-song-name').val(res.lastLoadedSongName)
  }
  if (res.songCursor) {
    $('#state-song-cursor').val(res.songCursor)
  }
  if (res.currentTrack) {
    $('#state-current-track').val(res.currentTrack)
  }
}

const getSongs = async (anyKey = false) => {
  const res = (await axios.get("/get", {params:{anyKey: anyKey}})).data
  $("#select-song-load").empty()
  for (let i=0;i<res.songs.length;i++) {
    let songInfo = res.songs[i]
    songInfo.getIndex = i
    let songDiv = createSongDiv(songInfo)
    $("#select-song-load").append(songDiv)
  }
}

const createSongDiv = (songInfo) => {
  let songDiv = $("<div>")
  songDiv.addClass("no-inline-block")
  songDiv.addClass("loaded-song-div")
  songDiv.data("name", songInfo.name)
  songDiv.on("click", function() {
    $(".selected-song").removeClass("selected-song")
    $(this).addClass("selected-song")
  })

  let indexDiv = $("<div>")
  indexDiv.text(`${songInfo.getIndex}) `)
  indexDiv.css("white-space", "pre")
  songDiv.append(indexDiv)

  let nameDiv = $("<div>")
  nameDiv.css("font-weight", "bold")
  nameDiv.text(`${songInfo.name} `)
  nameDiv.css("white-space", "pre")
  songDiv.append(nameDiv)

  let keyDiv = $("<div>")
  keyDiv.css("color", "#e07a5f")
  keyDiv.text(`[${songInfo.key}]`)
  songDiv.append(keyDiv)

  let bpmDiv = $("<div>")
  bpmDiv.css("color", "#81b29a")
  bpmDiv.text(`[${songInfo.bpm}]`)
  songDiv.append(bpmDiv)

  if (songInfo.tags) {
    let tagsDiv = $("<div>")
    tagsDiv.css("color", "#f2cc8f")
    tagsDiv.text(`[${songInfo.tags}]`)
    songDiv.append(tagsDiv)
  }
  
  if (songInfo.prevTransitionNotes) {
    let transNotesDiv = $("<div>")
    transNotesDiv.addClass("no-inline-block")
    transNotesDiv.css("white-space", "pre")
    transNotesDiv.css("color", "#d5d4cc")
    transNotesDiv.text(`  [${songInfo.prevTransitionNotes.ranking || 3}] ${songInfo.prevTransitionNotes.text || ""}`)
    songDiv.append(transNotesDiv)
  }
  return songDiv
}

const updateState = async () => {
  env = {
    key: parseInt($("#state-key").val()),
    bpm: parseInt($("#state-bpm").val()),
    lastLoadedSongName: $("#state-last-loaded-song-name").val(),
    songCursor: parseInt($("#state-song-cursor").val()),
    currentTrack: $("#currentTrack").val(),
  }
  await axios.post("/state", env)
  await loadEnv()
}

const undo = async () => {
  await axios.post("/undo")
  await loadEnv()
  await getSongs()
}

const load = async () => {
  if (!$(".selected-song").data("name")) {
    return 
  }
  let body = {
    nextSongName: $(".selected-song").data("name"),
    keyChange: $("#keyChange").is(":checked"),
  }
  await axios.post("/load", body)
  await loadEnv()
  await getSongs()
}

const del = async () => {
  await axios.post("/delete", { songName: $("#delete-song-name").val() })
  $("#delete-song-name").val("")
}

const getAll = async () => {
  await getSongs(true)
}
