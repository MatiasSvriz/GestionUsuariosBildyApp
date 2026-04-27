export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    dbUri: process.env.DB_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
  };
  
  export const validateConfig = () => {
    const requiredEnvVars = ['DB_URI', 'JWT_SECRET'];
  
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
    if (missing.length > 0) {
      throw new Error(
        `Faltan variables de entorno obligatorias: ${missing.join(', ')}`
      );
    }
  };