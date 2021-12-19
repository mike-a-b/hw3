const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const skills = require('../model/skills.json')
const nconf = require('nconf')
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
  if (req.session.isAdmin)
    // подставляем через skills в счетчики
    res.render('pages/admin', { title: 'Admin page', skills, msgskill: req.flash('msgskill')[0],
      msgfile: req.flash('msgfile')[0] })
  else res.redirect('/login')
})

router.post('/skills', (req, res, next) => {
  if (
    !req.body.age ||
    !req.body.concerts ||
    !req.body.cities ||
    !req.body.years
  ) {
    req.flash('msgskill', 'все поля должны быть заполнены')
  } else {
    //сохранение в БД
    skills[0].number = req.body.age
    skills[1].number = req.body.concerts
    skills[2].number = req.body.cities
    skills[3].number = req.body.years

    fs.writeFile('./model/skills.json', JSON.stringify(skills), function (err) {
      if (err) {
        console.log(err.message)
        return
      }
    })

    req.flash('msgskill', 'Cохранены новые значения')

  }
  res.redirect('/admin')
})

router.post('/upload', (req, res, next) => {
  let form = new formidable.IncomingForm()
  let upload = path.join('./public/assets/img', 'products')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err)
    }

    if (files.photo.name === '' || files.photo.size === 0) {
      req.flash('msgfile', 'Не загружена картинка!')
      return res.redirect('/admin')
    }
    if (!fields.name) {
      req.flash('msgfile','Не указано описание картинки!')
      res.redirect('/admin')
    }

    // console.log(files.photo.path + ' ' + fields.name)
    console.log(JSON.stringify({ fields, files }))
    const fileName = path.join(__dirname, '../public/assets/img/products', files.photo.originalFilename)
    console.log(fileName)
    fs.rename(files.photo.filepath, fileName, function (err) {
      if (err) {
        console.error(err.message)
        return
      }

      let dir = fileName.substr(fileName.indexOf('\\'))
      let newproduct = {
        src: fileName,
        name: fields.name,
        price: fields.price,
      }
      products.push(newproduct)
      db.set('1', products)
      db.save()
      req.flash('msgfile','успешно загружена')
      res.redirect('/admin')
    })
  })
})

module.exports = router
