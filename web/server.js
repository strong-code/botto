const express = require('express')
const moment = require('moment')
const { execSync } = require('child_process')
const db = require('../util/db.js') 
const eta = require('eta')
const app = express()

app.engine('eta', eta.renderFile)
app.set('view engine', 'eta')
app.set('views', 'web/views')

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK')
})

app.get('/', async (req, res) => {
  const observers = await db.manyOrNone('SELECT * FROM observers ORDER BY name')
  const commands = await db.manyOrNone('SELECT * FROM commands ORDER BY name')

  const adminCommands = commands.filter(c => c.admin)
  const userCommands = commands.filter(c => !c.admin)

  const lastCommand = await db.one('SELECT * FROM command_events ORDER BY time DESC LIMIT 1')
  const lastObserver = await db.one('SELECT * FROM observer_events ORDER BY time DESC LIMIT 1')

  const uptime = moment.duration(process.uptime(), 'seconds').humanize()
  const memory = Math.round(Number(process.memoryUsage().rss / 1024576))

  res.render('index', {
    name: 'eta',
    commands: userCommands,
    adminCommands: adminCommands,
    observers: observers,
    uptime: uptime,
    memory: memory,
    lastCommand: lastCommand,
    lastObserver: lastObserver
  })
})

app.listen(8181, () => {
  console.log(`Listening on port 8181`)
})
