const express = require('express')
const router = express.Router()
const skills = require('../model/skills.json')
const nodemailer = require('nodemailer')
const config = require('../config.json')
const nconf = require('nconf')
const path = require('path')

const db = (function () {
  return nconf
    .argv()
    .env()
    .file({ file: path.join(__dirname, '../model/data.json') })
})()
function init() {
  return db.get('1')
}
const products = init()

router.get('/', (req, res, next) => {
  console.log(products, skills,req.flash('mail')[0])
  res.render('pages/index', { title: 'Main page', products, skills, msgemail: req.flash('mail')[0] })
})

router.post('/', (req, res, next) => {
  //проверка инпутов и отправка сообщения через gmail
  // требуем наличия имени, обратной почты и текста
  try {
    if (!req.body.name || !req.body.email || !req.body.message) {
      // если что-либо не указано - сообщаем об этом
      throw new Error('Заполните все поля!')
    }
    const transporter = nodemailer.createTransport(config.mail.smtp)
    const mailOptions = {
      from: `"${req.body.name}" <${req.body.email}>`,
      to: config.mail.smtp.auth.user,
      subject: config.mail.subject,
      text:
          req.body.message.trim().slice(0, 500) +
          `\n Отправлено с: <${req.body.email}>`,
    }
    // отправляем почту
    transporter.sendMail(mailOptions, function (error, info) {
      // если есть ошибки при отправке - сообщаем об этом
      if (error) {
        throw new Error(`При отправке письма произошла ошибка!: ${error}`)
      }
    })
    req.flash('mail', 'Письмо успешно отправлено!')
  }
  catch (error) {
    req.flash('mail', error.message)
  }
  res.redirect('/#mail')
})

module.exports = router
