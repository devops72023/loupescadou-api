import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service : process.env.MAIL_DRIVER,
    auth : {
        user : process.env.MAIL_USERNAME,
        pass : process.env.MAIL_PASSWORD
    }
});

export default transporter;