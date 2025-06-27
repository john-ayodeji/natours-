const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `John Ayodeji <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {

            //Implement production transport (e.g., SendGrid)
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_API_KEY
                }
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    //send the actual email
    async send(template, subject) {
        //1) render HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        };

        //3)create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token'
        )
    }
}