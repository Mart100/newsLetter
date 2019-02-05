let database

module.exports = {
  addEmail(email) {
    database.ref('emails/'+randomToken()).set(email)
    console.log('ADDED <'+email+'> TO DATABASE')
  },
  async removeEmail(token) {
    let email = await this.getEmailByToken(token)
    console.log('REMOVED <'+email+'> FROM DATABASE')
    database.ref('emails/'+token).remove()
  },
  getEmails() {
    return new Promise((resolve, reject) => {
      database.ref('emails/').once('value').then((snapshot) => { resolve(snapshot.val()) })
    })
  },
  async getEmailByToken(token) {
    return new Promise((resolve, reject) => {
      database.ref('emails/'+token).once('value').then((snapshot) => { resolve(snapshot.val()) })
    })
  },
  async getTokenWithEmail(email) {
    let emails = await this.getEmails()
    return Object.keys(emails).find(key => emails[key] == email)
  },
  connect(admin, env) {
    var serviceAccount = JSON.parse(`
    {
      "type": "service_account",
      "project_id": "mart-c2dcf",
      "private_key_id": "${env.private_key_id}",
      "private_key": "${env.private_key}",
      "client_email": "firebase-adminsdk-p8dxi@mart-c2dcf.iam.gserviceaccount.com",
      "client_id": "106912927001311688105",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-p8dxi%40mart-c2dcf.iam.gserviceaccount.com"
    }
    `)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://mart-c2dcf.firebaseio.com"
    })
    console.log('Succesfully connected to database!')
    database = admin.database()
  }
}

function randomToken() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let token = ''
  for(let i=0;i<10;i++) {
    token += chars[Math.round(Math.random()*chars.length)]
  }
  return token
}