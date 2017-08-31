const mongoose = require('mongoose');

promise.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = mongoose;