const r = require('express').Router();

r.get('/', (req, res) => {
  // data を ejs に渡す
  res.render('index.ejs');
});

module.exports = r;
