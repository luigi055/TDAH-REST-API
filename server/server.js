'use strict';

require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('./middlewares/cors');
const authRoute = require('./routes/authRoute');

const PORT = process.env.PORT;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors);

authRoute(app);

app.listen(PORT, () => {
  console.log(`Server running on localhost:${PORT}`);
});

module.exports = app;