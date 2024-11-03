import nodemailer from 'nodemailer';
import config from '../config/env.config.js';

export const sendEmail = async (to, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: config.NODE_ENV === 'production' ? 465 : 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: 'raihan@gmail.com',
    to,
    subject: 'Reset your password within 10 minutes!',
    text: '',
    html,
  });
};
