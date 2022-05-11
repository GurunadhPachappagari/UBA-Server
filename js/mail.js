var nodemailer = require('nodemailer');

function sendOtp() {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ubawebsiteiitpkd@gmail.com',
            pass: 'UBAwebsite'
        }
    });


    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    var mailOptions = {
        from: 'ubawebsiteiitpkd@gmail.com',
        to: 'uba@iitpkd.ac.in',
        subject: "OTP for verification",
        html: `<p> Enter <b>${otp}</b> in the page to upload the files</p>`,
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    return [otp];
}
module.exports = { sendOtp }