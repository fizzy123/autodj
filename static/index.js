function clearTransitionUI() {
  state = {}

  $("#song-name").text("")
  $("#song-key").val("")
  $("#song-bpm").val("")
  $("#song-end-time").val("")
  $(".song-dont").val("")
  $(".song-preferred").val("")

  $("#next-song-name").text("")
  $("#next-song-key").val("")
  $("#next-song-bpm").val("")
  $("#next-song-start-time").val("")
  $.get("/work/", loadWork)
}

function clearTransition() {
  tags = state.lastSong.tags.filter(item => item !== loadedTransition.transition)

  $.ajax({
    url: "/song",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: state.lastSong.name,
      tags: tags.join(','),
    }),
    success: function (res) {
      clearTransitionUI()
    }
  })
}

function transitionSongUpdate() {
  let fieldType = $(this).data("type")
  let fieldPosition = $(this).data("position")

  let songName = state[`${fieldPosition}Song`].name
  let payload = {}
  if (fieldType === "start") {
    fieldType = `${state.currentSong.intensity}Start`
  }
  payload[fieldType] = $(this).val()
  payload.name = songName

  $.ajax({
    url: "/song",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    failure: function() {
      console.log("REQUEST FAILED")
    }
  })
}

function loadTransition(data) {
  if (data.song === undefined) {
    $.get("/work/", loadWork)
    return
  }
  state["lastSong"] = {
    name: data.song.song,
    dont: data.song.dont,
    preferred: data.song.preferred,
    tags: data.song.tags,
  }
  state["currentSong"] = {
    name: data.nextSong.song,
    intensity: data.nextSong.intensity
  }
  $("#song-name").text(data.song.song)
  $("#song-key").val(data.song.key)
  $("#song-bpm").val(data.song.bpm)
  $("#song-end-time").val(data.song.time)
  $(".song-dont").val(data.song.dont)
  $(".song-preferred").val(data.song.preferred)

  $("#next-song-name").text(data.nextSong.song)
  $("#next-song-key").val(data.nextSong.key)
  $("#next-song-bpm").val(data.nextSong.bpm)
  $("#next-song-start-time").val(data.nextSong.time)
}

function loadWork(data) {
  $("#expand-songs").empty()
  for (const expandSong of data.expandSongs) {
    let expandSongCheckbox = $("<input>")
    expandSongCheckbox.prop("name", "transition-songs")
    expandSongCheckbox.prop("type", "radio")
    expandSongCheckbox.data("song", expandSong.song)
    expandSongCheckbox.data("transition", "expand")

    let expandSongLabel = $("<div>")
    expandSongLabel.text(expandSong.song)

    let expandSongContainer = $("<div>")
    expandSongContainer.append(expandSongCheckbox)
    expandSongContainer.append(expandSongLabel)
    expandSongContainer.addClass("no-inline-block")
    $("#expand-songs").append(expandSongContainer)
  }
  $("#fix-songs").empty()
  for (const fixSong of data.fixSongs) {
    let tags = fixSong.tags.split(",")
    for (const tag of tags) {
      if (tag.includes("fix")) {
        let fixSongCheckbox = $("<input>")
        fixSongCheckbox.prop("name", "transition-songs")
        fixSongCheckbox.prop("type", "radio")
        fixSongCheckbox.data("song", fixSong.song)
        fixSongCheckbox.data("transition", tag)

        let fixSongLabel = $("<div>")

        fixSongLabel.text(`${fixSong.song}->${tag.split("-")[1]}`)

        let fixSongContainer = $("<div>")
        fixSongContainer.append(fixSongCheckbox)
        fixSongContainer.append(fixSongLabel)
        fixSongContainer.addClass("no-inline-block")
        $("#fix-songs").append(fixSongContainer)
      }
    }

  }
}

let state = {}
function loadState(data) {
  state = {
    lastSong: {
      name: data.lastSong.song,
      dont: data.lastSong.dont,
      preferred: data.lastSong.preferred,
      tags: data.lastSong.tags,
    },
    currentSong: {
      name: data.currentSong.song,
      loops: data.loops,
    }
  }
  if (data.lastSong.song) {
    console.log(data)
    $(".song-dont").prop( "disabled", false );
    $(".song-preferred").prop( "disabled", false );
  }
  $("#current-song-name").text(data.currentSong.song)
  if (Object.keys(data.lastSong).length > 0) {
    $("#last-song-name").text(data.lastSong.song)
    $(".song-dont").val(data.lastSong.dont)
    $(".song-preferred").val(data.lastSong.preferred)

    // set tags
    $("#starting-song").prop({
      checked: data.lastSong.tags.includes("starting-song")
    })
    $("#expand").prop({
      checked: data.lastSong.tags.includes("expand")
    })
    $("#fix").prop({
      checked: data.lastSong.tags.includes("fix-" + data.currentSong.song)
    })
    $("#delete").prop({
      checked: data.lastSong.tags.includes("delete")
    })
    $("#last-song-tags input").change(saveTags)
  }
  $("#current-loops").empty()
  for (const loop of data.loops) {
    let loopSelect = $("<input>")
    loopSelect.prop({
      type: "checkbox",
      checked: loop.preferred,
    })
    loopSelect.data({
      loop: loop.name
    })
    loopSelect.change(saveLoops)

    let loopName = $("<div>")
    loopName.text(loop.name)

    let loopWrapper = $("<div>")
    loopWrapper.addClass("no-inline-block")
    loopWrapper.append(loopSelect)
    loopWrapper.append(loopName)
    $("#current-loops").append(loopWrapper)
  }

}

function saveTransition() {
  let dont = $(".song-dont").val()
  let preferred = $(".song-preferred").val()

  $.ajax({
    url: "/song",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: state.lastSong.name,
      dont: dont,
      preferred: preferred,
    }),
    success: function (res) {
      state.lastSong.preferred = preferred
      state.lastSong.dont = dont
      $(".song-dont").val(dont)
      $(".song-preferred").val(preferred)
    }
  })
}

function saveTags() {
  tags = state.lastSong.tags

  tags = tags.filter(item => item !== "starting-song")
  if ($("#starting-song").prop("checked")) {
    tags.push("starting-song")
  }

  tags = tags.filter(item => item !== "expand")
  if ($("#expand").prop("checked")) {
    tags.push("expand")
  }

  tags = tags.filter(item => item !== "fix-" + state.currentSong.name)
  if ($("#fix").prop("checked")) {
    tags.push("fix-" + state.currentSong.name)
  }

  tags = tags.filter(item => item !== "delete")
  if ($("#delete").prop("checked")) {
    tags.push("delete")
  }

  $.ajax({
    url: "/song",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: state.lastSong.name,
      tags: tags.join(','),
    }),
    success: function (res) {
      state.lastSong.tags = tags
    }
  })
}

function saveLoops() {
  loops = []
  $("#current-loops input").each(function() {
    if ($(this).prop("checked")) {
      loops.push($(this).data("loop"))
    }
  })
  console.log({
    name: state.currentSong.name,
    loops: loops.join(","),
  })
  $.ajax({
    url: "/song",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: state.currentSong.name,
      loops: loops.join(","),
    }),
    success: function(res) {
      state.currentSong.loops = loops
    }
  })
}

const loadStartingSongs = () => {
  $.get("/starting-songs", (data) => {
    for (const song of data.songs) {
      let input = $("<input>")
      input.prop("name", "starting-songs")
      input.prop("type", "radio")
      input.prop("value", song.song)

      let label = $("<div>")
      label.text(`${song.song}|${song.key}|${song.bpm}`)

      let songWrapper = $("<div>")
      songWrapper.append(input)
      songWrapper.append(label)
      songWrapper.addClass("no-inline-block")
      $("#starting-song-container").append(songWrapper)
    }
  })
}

let loadedTransition
window.onload = function() {
  // setup sockets
  const socket = new WebSocket("ws://localhost:8080")
  socket.onopen = (event) => {
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.message === "status") {
        loadState(msg)
      } else if (msg.message === "init-complete") {
        $("#init-loading").hide()
        $("#show-play").click()
      }
    }
  };
  socket.onclose = (event) => {
    console.log("CLOSING SOCKET")
    let reloadNotice = $("<h1>")
    reloadNotice.text("Lost Connection. Please reload!")
    reloadNotice.css("background-color", "red")
    $("body").prepend(reloadNotice)
  }

  // set up buttons
  $("#show-start").click(function () {
    if (!$("#start").is(":visible")) {
      $("#start").show()
      $("#play").hide()
      $("#work").hide()
    }
  });
  $("#show-play").click(function () {
    if (!$("#play").is(":visible")) {
      $.get("/current/", loadState)
      $("#play").show()
      $("#start").hide()
      $("#work").hide()
    }
  });
  $("#show-work").click(function () {
    if (!$("#work").is(":visible")) {
      $.get("/work/", loadWork)
      $("#work").show()
      $("#play").hide()
      $("#start").hide()
    }
  });
  $("#initialize").click(function () {
    let startingSong = $("#starting-song-container input:checked").prop("value")
    let isTesting = $("#is-testing").prop("checked")

    console.log("INIT")
    console.log(isTesting)
    $.ajax({
      url: "/initialize",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        startingSong: startingSong,
        isTesting: isTesting
      }),
      success: function (res) {
        $("#init-loading").show()
      }
    })
  })
  $("#transition-setup").click(function () {
    let transitionSong = $("#transitions input:checked").data("song")
    let transition = $("#transitions input:checked").data("transition")

    loadedTransition = {
      name: transitionSong,
      transition: transition,
    }
    $.ajax({
      url: "/setup-transition",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(loadedTransition),
      success: loadTransition,
    })
  })
  $(".transition-field").change(transitionSongUpdate)
  $("#clear-transition").click(clearTransition)
  $(".song-dont").change(saveTransition)
  $(".song-preferred").change(saveTransition)

  // load starting songs
  loadStartingSongs();
}
