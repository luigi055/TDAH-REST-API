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
bcrypt.compare('123abc!', '$2a$10$wceB9FdQWhzD7jID8EzP2ueJFGaDR6yGTdq3MS67ZlFWjOVA3886W', (err, res) => {
  console.log(res);
});