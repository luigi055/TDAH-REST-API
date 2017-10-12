function cors (req, res, next) {
  // we can define Only the routes we allow instead of all (*)
  res.header ('Access-Control-Allow-Origin', '*');
  // HTTP method allowed for CORS
  res.header ('Access-Control-Allow-Methods', 'GET,PATCH,PUT,POST,DELETE');
  res.header ('Access-Control-Allow-Headers', 'Content-Type');
  res.header ('Access-Control-Expose-Headers', 'x-auth');
  next ();
}

module.exports = cors;
