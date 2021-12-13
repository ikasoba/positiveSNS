module.exports = {
  second: (time)  => 1000*time,
  minute: (time)  => 1000*60*time,
  hour:   (time)  => 1000*60*60*time,
  day:    (time)  => this.hour(24)*time
}