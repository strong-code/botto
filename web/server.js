const express = require('express')
const db = require('../util/db.js') 
const eta = require('eta')
const app = express()

app.engine('eta', eta.renderFile)
app.set('view engine', 'eta')
app.set('views', 'web/views')

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK')
})

app.get('/', (req, res) => {
  res.render('index', {
    name: 'eta'
  })
})

app.listen(8181, () => {
  console.log(`Listening on port 8181`)
})
