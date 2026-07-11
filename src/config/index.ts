import "dotenv/config";

export const config = {
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_DAYS: 30,
  ACCESS_TOKEN_EXPIRES_MIN: 30,
  RESET_TOKEN_EXPIRES_HOURS: 1,

  INVITE_LINK_LIVE_HOURS: 12,

  CLIENT_URL: process.env.CLIENT_URL,

  ENVIRONMENT: process.env.ENVIRONMENT,

  // yandex
  YANDEX_ACCESS_KEY: process.env.YANDEX_ACCESS_KEY,
  YANDEX_SECRET_KEY: process.env.YANDEX_SECRET_KEY,
  YANDEX_BUCKET_NAME: process.env.YANDEX_BUCKET_NAME,
  YANDEX_STORAGE_REGION: process.env.YANDEX_STORAGE_REGION ?? "ru-central1",
  YANDEX_STORAGE_ENDPOINT:
    process.env.YANDEX_STORAGE_ENDPOINT ?? "https://storage.yandexcloud.net",
} as const;
