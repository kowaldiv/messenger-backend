import { Avatar } from "../../repositories/interfaces/avatar.repository.interface.js";

export interface uploadAvatarInput {
  file: {
    buffer: Buffer;
    minetype: string;
    size: number;
    filename: string;
  };
}

export interface AvatarService {
  uploadUserAvatar(entityId: string, input: uploadAvatarInput): Promise<Avatar>;
  setPrimaryUserAvatar(entityId: string, avatarId: string): Promise<void>;
  deleteUserAvatar(entityId: string, avatarId: string): Promise<void>;
  uploadChatAvatar(
    userId: string,
    chatId: string,
    input: uploadAvatarInput,
  ): Promise<Avatar>;
  setPrimaryChatAvatar(
    userId: string,
    chatId: string,
    avatarId: string,
  ): Promise<void>;
  deleteChatAvatar(
    userId: string,
    chatId: string,
    avatarId: string,
  ): Promise<void>;
  getAvatars(entityType: "user" | "chat", entityId: string): Promise<Avatar[]>;
}
