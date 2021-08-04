const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(8181, () => {
  console.log(`Listening on port 8181`)
})
