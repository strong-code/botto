const Twitter = require('twit')
const config = require('../config.js').twitter
const client = new Twitter(config)
const Command = require('./command.js')

module.exports = class Twitter extends Command {

  constructor() {
    super('twitter')
  }

  call(opts, respond) {
    this.tweetByUser(opts.args[0], opts.args[1], respond)
  }

  tweetByUser(user, index, respond) {
    if (user == '') {
      return respond("No username supplied. Syntax is !twitter <username> <[optional] number of tweet>")
    }

    var options = { screen_name: user, offset: this.getOffset(index), trim_user: true }

    client.get('statuses/user_timeline', options, (err, data, response) => {
      if (err) {
        console.log(err)
        return respond("[" + response.statusCode + "] " + err.message)
      } else {
        try {
          return respond("[" + options.screen_name + "] " + data[options.offset]["text"].replace(/[\r\n]/g, " "))
        } catch (e) {
          console.log(e)
          return respond("Error fetching tweets for @" + options.screen_name + "...")
        }
      }
    })
  }

  /*
   * If second arg is an integer, attempt to retrieve that many tweets. If it is 'random'
   * then retrieve 100 latest tweets and select at random.
   */
  getOffset(index) {
    if (index == 'random') {
      return Math.floor(Math.random() * 20 + 0)
    } else {
      return (typeof index !== 'undefined' ? index : 0)
    }
  }

}
