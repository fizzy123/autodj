const { Ableton } = require("ableton-js");
const ableton = new Ableton({ logger: console });

(async () => {
  let start = (new Date()).getTime()
  await ableton.start();
  let time = await ableton.song.get("current_song_time");
  console.log(time)
  console.log("all set")
  console.log(((new Date()).getTime() - start))
})()
