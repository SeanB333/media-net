/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: false }));

const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

const router = require('./routes/routes.js');

app.use('/', router);

// Application is listening on port...
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Application is listening on port 5000');
});