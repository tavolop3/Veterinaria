const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "02601c422649db",
      pass: "dbec640174a98f"
    }
  });

// async..await is not allowed in global scope, must use a wrapper
async function main(to,subject,text) {
  if(process.env.NODE_ENV != 'DEMO') { 
    console.log('Hacia: '+ to + ', Asunto: ' + subject + ', Texo: ' + text );
  } else { // set NODE_ENV=DEMO
    try{
      let info = await transporter.sendMail({
      from: '"OhMyDog 🐶" <widearrow.ohmydog@gmail.com>',
      to, 
      subject,
      text,
      });
      console.log("Message sent: %s", info.messageId);
    }catch(err) {
        console.error(err);
    }
  }
}
  
module.exports.sendEmail = main;