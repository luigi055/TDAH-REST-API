const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

function successEmailPassword(newPassword, emailToSend) {
  // START EMAILER
  try {
    // Generate email token

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"TDAH ABC 👻" <' + process.env.EMAIL_USER + '>', // sender address
        to: `${emailToSend}`, // list of receivers
        subject: 'Success Changing your Password', // Subject line
        html: `Your password was changed with success <br> this is your new password <br> <b>${newPassword}</b>`, // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return console.log(err);
        }
        // console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  } catch (err) {}

  // END EMAILER
}

function emailConfirmation(user, hostname) {

  try {
    // Generate email token
    const emailToken = jwt.sign({
      _id: user._id.toHexString(),
    }, process.env.EMAIL_SECRET, {
      expiresIn: '1d',
    });
    const validationURL = `http://${hostname}/api/advisor/activation/${emailToken}`;

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"TDAH ABC 👻" <' + process.env.EMAIL_USER + '>', // sender address
        to: `${user.email}`, // list of receivers
        subject: 'Confirmation Email', // Subject line
        html: `You\'re almost there creating your new account. the last step is confirm your email <br> <a href="${validationURL}">${validationURL}</a>`, // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return console.log(err);
        }
        // console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  } catch (err) {
    console.log(err);
  }
  // END EMAILER
}

function emailChangePwAuth(user, hostname) {

  // START EMAILER
  try {
    // Generate email token
    const emailToken = jwt.sign({
      _id: user._id.toHexString(),
      email: user.email,
    }, process.env.EMAIL_SECRET, {
      expiresIn: '2h',
    });
    const validationURL = `http://${hostname}/api/advisor/auth-change-password/${emailToken}`;

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"Pedro La Rosa 👻" <' + process.env.EMAIL_USER + '>', // sender address
        to: `${user.email}`, // list of receivers
        subject: 'Password change request', // Subject line
        html: `You\'re about to change your password. Click the link below to change your password <br> <a href="${validationURL}">${validationURL}</a>`, // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          throw new Error(err);
        }
        // console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  } catch (err) {}
  // END EMAILER
}

function emailChangePw(user, hostname) {
  // START EMAILER
  try {
    // Generate email token
    const emailToken = jwt.sign({
      _id: user._id,
      email: user.email,
    }, process.env.EMAIL_SECRET, {
      expiresIn: '2h',
    });
    const validationURL = `http://${hostname}/api/advisor/change-password/${emailToken}?email=${user.email}`;

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"Pedro La Rosa 👻" <' + process.env.EMAIL_USER + '>', // sender address
        to: `${user.email}`, // list of receivers
        subject: 'Forgotten Password change request', // Subject line
        html: `You\'re about to set a new password. Click the link below to change your password <br> <a href="${validationURL}">${validationURL}</a>`, // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return console.log(err);
        }
        // console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  } catch (err) {}
  // END EMAILER
}
module.exports = {
  successEmailPassword,
  emailConfirmation,
  emailChangePwAuth,
  emailChangePw,
}