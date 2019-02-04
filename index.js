let express = require('express')
let cors = require('cors')
var app = express()
let port = 3100

app.use(cors())

// Listen for new emails
app.get('/email', (req, res, next) => {
  let email = req.url.split('?')[1]
  console.log(req.url)
})


app.listen(port, () => {
  console.log('Listening at http://localhost:' + port)
})