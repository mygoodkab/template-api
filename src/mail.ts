import { Util } from './util';
import { config } from './index';
const nodemailer = require('nodemailer');
// import * as mailgun from 'mailgun-js'({apiKey: api_key, domain: domain})
// const api_key = process.env.API_KEY_MAILGUN || config.mail.API_KEY; // ;
// const domain = config.mail.DOMAIN;
// const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
// const sgMail = require('@sendgrid/mail');
const mail = (option: Info) => {
    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'mail.adoma-jewel-manufact.com',
                port: 25,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'adoma@adoma-jewel-manufact.com', // generated ethereal user
                    pass: process.env.SMTP_PASS || config.smtp.pass// generated ethereal password
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });

            // setup email data with unicode symbols
            const mailOptions = {
                from: `no-reply<adoma@adoma-jewel-manufact.com>`, // sender address
                to: option.receiver, // adoma@adoma-jewel-manufact.com

                subject: `Adoma`, // Subject line
                html: `<b>Company Name : </b> ${option.companyName} <br>
                   <b>Person Name : </b> ${option.personName} <br>
                   <b>Email Address : </b> ${option.email} <br>
                   <b>Address : </b> ${option.address} <br>
                   <b>Inquiry : </b> ${option.inquiry} <br>
                    ` // html body
            };


            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error)
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                resolve(info)
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });


    });
    // // setup email data with unicode symbols
    // const mailOptions = {
    //     from: `no-reply<no-reply@mg.codth.com>`, // sender address
    //     to: option.receiver, // adoma@adoma-jewel-manufact.com

    //     subject: `Adoma`, // Subject line
    //     html: `<b>Company Name : </b> ${option.companyName} <br>
    //                <b>Person Name : </b> ${option.personName} <br>
    //                <b>Email Address : </b> ${option.email} <br>
    //                <b>Address : </b> ${option.address} <br>
    //                <b>Inquiry : </b> ${option.inquiry} <br>
    //                 ` // html body
    // };
    // return new Promise((resolve, reject) => {
    //     // send mail with defined transport object
    //     mailgun.messages().send(mailOptions, (error, body) => {
    //         if (error) {
    //             reject(error);
    //         }
    //         resolve(body);
    //     });
    // });
};

interface Info {
    companyName: string;
    personName: string;
    email: string;
    address: string;
    inquiry: string;
    receiver: string;
}

export { mail };
