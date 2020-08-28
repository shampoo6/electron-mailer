import nodemailer from 'nodemailer'

class Mailer {
  sendMail

  constructor () {
    this.sendMail = sendMail
  }
}

async function sendMail (template, callback) {
  let poolTemplate = `smtps://${template.email}:${template.pwd}@${template.smtp}/?pool=true`
  let transporter = nodemailer.createTransport(poolTemplate)
  // send mail with defined transport object
  await transporter.sendMail({
    from: `"${template.name}" <${template.email}>`, // sender address
    to: template.to, // list of receivers
    cc: template.cc,
    subject: template.subject, // Subject line
    html: `${template.content}<br/>${template.sign}` // html body
  }, (err, msg) => {
    if (err) {
      console.log.error(err)
      console.log.error(msg)
    } else {
    }
    if (callback) {
      callback(err, msg)
    }
  })
}

const mailer = new Mailer()

export default mailer
