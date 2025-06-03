require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const indexRouter = require('./routes/indexRouter');
const comicRouter = require('./routes/comicRouter');
const tagRouter = require('./routes/tagRouter');

// ejs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// Form middleware
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/', indexRouter);
app.use('/comics', comicRouter);
app.use('/tags', tagRouter);


app.listen(PORT, () => {
  console.log('Listening on port:' + PORT);
});
