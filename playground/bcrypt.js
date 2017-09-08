const bcrypt = require('bcryptjs');

const password = '123abc!';

let hashedPass;

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash)
    bcrypt.compare(password, hash, (err, res) => {
      console.log(res);
    })
  });
});
console.log(bcrypt.compare('123abc!5', '$2a$10$4Ko6bFQsvMdWAqKU5UXzQ.oMC4P5TC1wqtXGyjor5G8eJiEvBJGra'));