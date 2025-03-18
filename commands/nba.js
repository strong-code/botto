const Command = require('./command.js')
const needle = require('needle')
const SCOREBOARD_ENDPOINT = 'https://nba-prod-us-east-1-mediaops-stats.s3.amazonaws.com/NBA/liveData/scoreboard/todaysScoreboard_00.json'

module.exports = class NBA extends Command {

  constructor() {
    super('nba')
  }

  async call(bot, opts, respond) {
    const res = await needle('GET', SCOREBOARD_ENDPOINT)
    const data = JSON.parse(res.body).scoreboard.games

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
        }
      }

      // Status 2 indicates the game is in progress
      if (game.gameStatus === 2) { 
        gameInfo.currentPeriod = game.period
        inProgress.push(gameInfo)
      } else {
        finished.push(gameInfo)
      }
    })

    let gameString = ''

    if (inProgress.length == 0) {
      finished.forEach(game => {
        gameString += `${game.homeTeam.teamName} ${game.homeTeam.score} - ${game.awayTeam.teamName} ${game.awayTeam.score} (${game.gameStatusText}) | `
      })
    } else {
      inProgress.forEach(game => {
        gameString += `${game.homeTeam.teamName} ${game.homeTeam.score} - ${game.awayTeam.teamName} ${game.awayTeam.score} (${game.gameStatusText}) | `
      })
    }

    return respond(gameString)
  }
}
