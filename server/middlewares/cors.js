function cors (req, res, next) {
  // we can define Only the routes we allow instead of all (*)
  res.header ('Access-Control-Allow-Origin', '*');
  // HTTP method allowed for CORS
  res.header ('Access-Control-Allow-Credentials', 'true');
  res.header ('Access-Control-Allow-Methods', 'GET,PATCH,PUT,POST,DELETE');
  res.header (
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, x-auth, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  );
  res.header ('Access-Control-Expose-Headers', 'x-auth');
  next ();
}

module.exports = cors;
