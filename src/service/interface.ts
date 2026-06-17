import { Avatar } from "../repositories/interfaces/avatar.repository.interface.js";
import { PublicTokenInfo } from "../repositories/interfaces/token.repository.interface.js";
import { PublicUser } from "../repositories/interfaces/user.repository.interface.js";

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

export interface uploadAvatarInput {
  file: {
    buffer: Buffer;
    minetype: string;
    size: number;
    filename: string;
  };
}

export interface AvatarService {
  uploadAvatar(
    entityType: "user" | "chat",
    entityId: string,
    input: uploadAvatarInput,
  ): Promise<Avatar>;
  setPrimaryAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ): Promise<void>;
  deleteAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ): Promise<void>;
  getAvatars(entityType: "user" | "chat", entityId: string): Promise<Avatar[]>;
}
