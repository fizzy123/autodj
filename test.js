const { Ableton } = require("ableton-js");
const ableton = new Ableton();

(async () => {
  let remover = await ableton.song.addListener("current_song_time", (async (time) => {
    console.log(1)
  }));
  await remover()
  ableton.song.addListener("current_song_time", (async (time) => {
    console.log(2)
  }));
  console.log("all set")
})()
