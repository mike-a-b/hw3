const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('pages/login', { title: 'Страница авторизации' });
})

//проверка привелегий
const isAuth = (req, res, next) => {
// проверяем если входит админ запоминаем в сесии
  if(req.body.email === 'mikebocharov63@gmail.ru' && req.body.password ==='12345')
  {
    req.session.isAdmin = true;
    return next();
  }
  else{
    req.session.isAdmin = false;
    //это не админ прав нет на главную страницу его
    res.render('pages/login', { title: 'Страница авторизации' , msglogin:'вы не администратор!'});
  }
}

router.post('/', isAuth, (req, res, next) => {

  //промежуточное по middleware - сверка пароля пользователя с значением из базы +
  if(!req.body.email || !req.body.password)
      //заново открыть страницу ввода, не заполнены поля
    res.render('pages/login', { title: 'Страница авторизации' , msglogin:'Необходимо заполнить все поля'});
  else
  {
    res.redirect('/admin');
  }

})

module.exports = router;
