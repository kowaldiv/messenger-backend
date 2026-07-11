import { Prisma } from "../../../generated/prisma/browser.js";

export const publicTokenInfoSelect = {
  id: true,
  userId: true,
  fingerprint: true,
  createdAt: true,
} satisfies Prisma.SessionSelect;
