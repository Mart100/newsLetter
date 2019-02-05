const database = require('./database.js')

module.exports = {
  async sendEmail(email, text, nodemailer) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'martssitebot@gmail.com',
        pass: process.env.mailPass
      }
    })

    // add unsubscribe link
    let token = await database.getTokenWithEmail(email)
    text += (`<br><br><a href="https://news-letter.herokuapp.com/unsubscribe?${token}">Click here to unsubscribe</a>`)

    // mail Options
    let mailOptions = {
      from: '"MartBot" <Martssitebot@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: text, // plain text body
      html: text // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
      if(err) return console.log(err);
      console.log('Mail send to: ', email)
    })
  }
}