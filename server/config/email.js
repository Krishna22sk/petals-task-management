import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendEmailNotification = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER) {
      logger.info(`[Email Simulated] To: ${to} | Subject: ${subject} | Message: ${text || html}`);
      return { success: true, simulated: true };
    }
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Petals Automation" <no-reply@petalsautomation.com>',
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: %s`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};
