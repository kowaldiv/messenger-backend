import "dotenv/config";

export const config = {
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_DAYS: 30,
  ACCESS_TOKEN_EXPIRES_MIN: 30,
  RESET_TOKEN_EXPIRES_HOURS: 1,

  CLIENT_URL: process.env.CLIENT_URL,
};
