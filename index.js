let express = require('express')
let cors = require('cors')
const nodemailer = require('nodemailer')
require('dotenv').config({path: './secrets.env'})
var app = express()
let port = 3100
const { Client } = require('pg');


app.use(cors())

// Listen for new emails
app.get('/email', (req, res, next) => {
  let email = req.url.split('?')[1]
  console.log(req.url)
  let text = `
  Hello,<br>
  Thanks for subscribing to my newsletter. From now on you will receive a new email everytime I post a new project / have a big update on a project.
  If you did not signup for this at http://martve.site please click the link below to unsubscribe
  `
  sendEmail(email, text)
  addEmail(email)
})

// Listen for update
app.get('/update', (req, res, next) => {
  let data = req.url.split('?')[1]
  let password = data.split('&')[0].replace('password=', '')
  let text = data.split('&')[1].replace('text=', '')

  // If password is correct. Send emails
  if(password == process.env.PASSWORD) {
    let emails = getEmails()
    for(let email of emails) sendEmail(email, text)
  } 
  // else wrong password
  else console.log('WRONG PASSWORD')
  console.log(req.url)
})


app.listen(process.env.PORT || port, () => {
  console.log('Server started')
})

// connect database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

client.connect()
function addEmail(email) {
  let sql = `INSERT INTO emails (email)
            VALUES (${email});`
    client.query(sql, (err, res) => {
    if (err) throw err
    for(let row of res.rows) console.log(JSON.stringify(row))
    return res.rows
    client.end()
  })
}

function getEmails() {
  client.query('SELECT email FROM emails', (err, res) => {
    if (err) throw err
    for(let row of res.rows) console.log(JSON.stringify(row))
    return res.rows
    client.end()
  })
}

function sendEmail(email, text) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'martssitebot@gmail.com',
      pass: process.env.mailPass
    }
  })

  text.push(`<a href="https://news-letter.herokuapp.com/unsubscribe?${email}">Click here to unsubscribe</a>`)

  // mail Options
  let mailOptions = {
    from: '"MartBot" <Martssitebot@gmail.com>', // sender address
    to: to, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: mailText, // plain text body
    html: mailText // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, info) => {
    if(err) return console.log(error);
    console.log('Message sent: %s', info.messageId)
  })
}

/*
CLIENT GET REQUESTS

new email
$.get('http://127.0.0.1:3100/email', 'martvanenck1@gmail.com')

update
$.get('http://127.0.0.1:3100/update', {'password': 'password', 'text': 'text'})
*/