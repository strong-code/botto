const Command = require('./command.js')
const needle = require('needle')
const Colors = require('irc').colors
const SCOREBOARD_ENDPOINT = 'https://nba-prod-us-east-1-mediaops-stats.s3.amazonaws.com/NBA/liveData/scoreboard/todaysScoreboard_00.json'
const BOXSCORE_ENDPOINT = 'https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022401009.json'

module.exports = class NBA extends Command {

  // https://github.com/swar/nba_api/blob/master/docs/nba_api/live/endpoints/scoreboard.md
  // TODO: drill down for boxscore on certain game

  constructor() {
    super('nba')
  }

  async call(bot, opts, respond) {
    if (opts.args[0] === 'box') {
      const resp = await this.parseBoxScoreData()
      return respond(resp)
    }

    const res = await needle('GET', SCOREBOARD_ENDPOINT)
    const data = JSON.parse(res.body).scoreboard.games
    const [finished, inProgress] = this.parseGameData(data)

    let gameString = ''

    if (opts.args[0] === 'final' || inProgress.length == 0) {
      finished.forEach(game => {
        gameString += `${game.homeTeam.teamName} ${game.homeTeam.score} - ${game.awayTeam.score} ${game.awayTeam.teamName} (${game.gameStatusText}) | `
      })
    } else {
      inProgress.forEach(game => {
        let str = `${game.homeTeam.teamName} ${game.homeTeam.score} - ${game.awayTeam.score} ${game.awayTeam.teamName} (${game.gameStatusText}) `
        str = (game.clutchTime ? Colors.wrap('light_red', str) : str)
        gameString += `${str} | `
      })
    }

    return respond(gameString)
  }

  parseGameData(data) {
    const finished = []
    const inProgress = []

    data.forEach(game => {
      const gameInfo = {
        gameId: game.gameId,
        gameStatusText: game.gameStatusText.trim(),
        homeTeam: {
          teamName: game.homeTeam.teamName,
          score: game.homeTeam.score
        },
        awayTeam: {
          teamName: game.awayTeam.teamName,
          score: game.awayTeam.score
        },
        clutchTime: this.inClutchTime(game)
      }

      // Status 2 indicates the game is in progress
      if (game.gameStatus === 2) { 
        gameInfo.currentPeriod = game.period
        inProgress.push(gameInfo)
      } else {
        finished.push(gameInfo)
      }
    })

    return [finished, inProgress]
  }

  async parseBoxScoreData() {
    const ENDPOINT = 'https://nba-prod-us-east-1-mediaops-stats.s3.amazonaws.com/NBA/liveData/boxscore/boxscore_0022400627.json'
    const res = await needle('GET', ENDPOINT)
    return this.parseOnCourt(res.body.game)
  }

  parseOnCourt(game) {
    const home = {
      team: `${game.homeTeam.teamCity} ${game.homeTeam.teamName}`,
      onCourt: []
    }
    const away = {
      team: `${game.awayTeam.teamCity} ${game.awayTeam.teamName}`,
      onCourt: []
    }

    game.homeTeam.players.forEach(p => {
      if (p.oncourt === '1') {
        home.onCourt.push(p.nameI)
      }
    })

    game.awayTeam.players.forEach(p => {
      if (p.oncourt === '1') {
        away.onCourt.push(p.nameI)
      }
    })

    return `${home.team} - ${home.onCourt.join(', ')} || ${away.team} - ${away.onCourt.join(', ')}`
  }

  inClutchTime(game) {
    if (game.gameStatusText === 'Final' || game.gameStatusText.charAt(1) !== '4') {
      return false
    }

    let [quarter, minsLeft] = game.gameStatusText.split(' ')
    minsLeft = parseInt(minsLeft.split(':')[0]) || 0

    // TODO: check for OT quarter layout
    if (Math.abs(game.homeTeam.score -game.awayTeam.score) <= 5 && quarter == 'Q4' && minsLeft <= 4) {
      return true
    }

    return false
  }
}
