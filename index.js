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
  Hello,<br>
  Thanks for subscribing to my newsletter. From now on you will receive a new email everytime I post a new project / have a big update on a project.
  If you did not signup for this at http://martve.site please click the link below to unsubscribe
  `
  let getToken = await database.getTokenWithEmail(email) 
  if(getToken == undefined) {
    database.addEmail(email)
    mailing.sendEmail(email, text, nodemailer)
  }
  else console.log('ERR DUPLICATE EMAIL: <'+email+'>')
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

database.connect(admin, process.env.private_key)


/*
CLIENT GET REQUESTS

new email
$.get('http://127.0.0.1:3100/email', 'martvanenck1@gmail.com')

update
$.get('http://127.0.0.1:3100/update', {'password': 'password', 'text': 'text'})
*/