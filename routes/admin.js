const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const skills = require('../model/skills.json');
const nconf = require('nconf');
const db = function () {
  return nconf
      .argv()
      .env()
      .file({ file: path.join(__dirname, '../model/data.json') })
}()
function init () {
  return db.get("1");
}
const products = init();

router.get('/', (req, res, next) => {
  if(req.session.isAdmin)
  // подставляем через skills в счетчики
    res.render('pages/admin', { title: 'Admin page', skills})
  else
    res.redirect('/')
})

router.post('/skills', (req, res, next) => {

  if(!req.body.age || !req.body.concerts || !req.body.cities || !req.body.years)
  {
    res.render('pages/admin', { title: 'Admin page', skills, msgskill:'все поля должны быть заполнены' });
    return next();
  }
  else {
    //сохранение в БД
    skills[0].number = req.body.age;
    skills[1].number = req.body.concerts;
    skills[2].number = req.body.cities;
    skills[3].number = req.body.years;

    fs.writeFile('./model/skills.json', JSON.stringify(skills), function (err) {
      if (err) {
        console.log(err.message);
        return;
      }
    });
    res.render('pages/admin', { title: 'Admin page', skills, msgskill:'Cохранены новые значения' });
  }
})

router.post('/upload', (req, res, next) => {

  let form = new formidable.IncomingForm();
  let upload = path.join('./public/assets/img', 'products');

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  form.uploadDir = path.join(process.cwd(), upload);

  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err)
    }

    if (files.photo.name === '' || files.photo.size === 0) {
      return res.render('pages/admin', { title: 'Admin page', skills, msgfile:'Не загружена картинка!' });
    }
    if (!fields.name) {
      return res.render('pages/admin', { title: 'Admin page', skills, msgfile:'Не указано описание картинки!' });
    }

    console.log(files.photo.path+" "+fields.name);
    console.log(JSON.stringify({ fields, files }));
    const fileName = path.join(upload, files.photo.originalFilename);
    console.log(fileName);
    fs.rename(files.photo.filepath, fileName, function (err) {
      if (err) {
        console.error(err.message);
        return;
      }

      let dir = fileName.substr(fileName.indexOf('\\'));
      let newproduct = {
        src : fileName,
        name: fields.name,
        price: fields.price
      }
      products.push(newproduct);
      db.set("1", products);
      db.save()
      res.render('pages/admin', { title: 'Admin page', skills, msgfile:'успешно загружена' });
    })
  })
})

const validation = (fields, files) => {

  return res.render('pages/admin', { title: 'Admin page', skills, msgfile:'ОК' });
}

module.exports = router
