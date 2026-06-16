import { PublicTokenInfo, PublicUser } from "../repositories/interface.js";

export interface AuthService {
  register(data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName?: string;
  }): Promise<{ user: PublicUser; refreshToken: string; accessToken: string }>;
  login(data: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; refreshToken: string; accessToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(data: { token: string; newPassword: string }): Promise<void>;
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    newRefreshToken: string;
  }>;
  logout(token: string): Promise<void>;
  getSessions(userId: string): Promise<PublicTokenInfo[]>;
  revokeSession(tokenId: string, userId: string): Promise<void>;
}
