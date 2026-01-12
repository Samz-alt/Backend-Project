import Mailgen from "mailgen"
import nodemailer from "nodemailer"
import { APIError } from "./APIError"

const sendEmail = async (options) => {

    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'New Product',
            link: 'https://product.com/'

        }
    })

    // CREATION OF THE EMAIL
    const emailHTML = mailGenerator.generate(options.mailGenContent)
    const emailPlainText = mailGenerator.generatePlaintext(options.mailGenContent)


    // this is the transporter object which will cofigure the SMTP Server
    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    // sending the email using async/await 
    const mail = {
        from: "newproduct@example.com",
        to: options.email,  //recievers email address 
        subject: options.subject,  //subject will be provided by the user
        text: emailPlainText,
        html: emailHTML
    }

    try {
        await transport.sendMail(mail)
    } catch (error) {
        throw new APIError(500, "Email Services Failed. Make sure the credentials are provided correctly", error)
    }

}




const mailVerificationMailgenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App. We are excited to have you onboard in our app",
            action: {
                instruction: "To verify your email please click on the button",
                button: {
                    color: "#22BC66",
                    text: "Confirm your account",
                    link: verficationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email. We would love to help"
        }
    }
}

export { mailVerificationMailgenContent, sendEmail }