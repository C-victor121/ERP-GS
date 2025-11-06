import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-global-solar',
  jwtSecret: process.env.JWT_SECRET || 'erp-global-solar-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  environment: process.env.NODE_ENV || 'development',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'no-reply@localhost'
  }
};