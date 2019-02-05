let express = require('express')
let cors = require('cors')
const nodemailer = require('nodemailer')
const mailing = require('./mailing.js')
const database = require('./database.js')
var admin = require('firebase-admin')
require('dotenv').config({path: './secrets.env'})
var app = express()
let port = 3100

app.use(cors())

// Listen for new emails
app.get('/email', async (req, res, next) => {
  let email = req.url.split('?')[1]
  let text = `
  Hello,<br><br>
  Thanks for subscribing to my newsletter!<br> From now on you will receive a new email everytime I post a new project / have a big update on a project.<br>
  If you did not signup for this at <a href="http://martve.site">http://martve.site</a> please click the link below to unsubscribe
  `
  // check if email givin is an actual email
  let re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  if(re.test(email) == false) return res.send('INVALID_EMAIL')


  // check if email is already in database
  let getToken = await database.getTokenWithEmail(email) 
  if(getToken != undefined) return res.send('EMAIL_DUPLICATE')

  // SUCCESS
  database.addEmail(email)
  mailing.sendEmail(email, text, nodemailer)
  res.send('SUCCESS')

})

// Listen for update
app.get('/update', async (req, res, next) => {
  let data = req.url.split('?')[1]
  let password = data.split('&')[0].replace('password=', '').trim()
  let text = data.split('&')[1].replace('text=', '')

  // If password is correct. Send emails
  if(password == process.env.PASSWORD.trim()) {
    let emails = await database.getEmails()
    console.log(emails)
    for(let token in emails) {
      let email = emails[token]
      mailing.sendEmail(email, text, nodemailer)
    }
  } 
  // else wrong password
  else console.log('WRONG PASSWORD: <'+password+'>   CORRECT: <'+process.env.PASSWORD+'>')
  console.log(req.url)
})

// listen for unsubscribe
app.get('/unsubscribe', async (req, res, next) => {
  let token = req.url.split('?')[1]
  database.removeEmail(token)
  let email = await database.getEmailByToken(token)
  res.send('Successfully unsubscribed <'+email+'>')
})


app.listen(process.env.PORT || port, () => {
  console.log('Server started')
})

database.connect(admin, process.env)


/*
CLIENT GET REQUESTS

new email
$.get('http://127.0.0.1:3100/email', 'martvanenck1@gmail.com')

update
$.get('http://127.0.0.1:3100/update', {'password': 'password', 'text': 'text'})
*/