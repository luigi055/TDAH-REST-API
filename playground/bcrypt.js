const bcrypt = require('bcryptjs');

const password = '123abc!';

let hashedPass;

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash)
//     bcrypt.compare(password, hash, (err, res) => {
//       console.log(res);
//     })
//   });
// });
bcrypt.compare('123abc!48', '$2a$10$CxRa3FyOmgSObjkyHNIYDO2D5wWq/qcnTJTDbuCmyADY/SQwKfaWq', (err, res) => {
  console.log(res);
});