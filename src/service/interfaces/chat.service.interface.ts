import { PublicChat } from "../transformers/chat.transformer.js";
import { PublicMessage } from "../transformers/message.transformer.js";
import { PublicChatParticipant } from "../transformers/participant.transformer.js";
// import { ChatParticipantWithUnread } from "../transformers/participant.transformer.js";

export type CreateChatDto =
  | { type: "channel"; title: string; description?: string; isPrivate: boolean }
  | { type: "group"; title: string };

export type CreateChatWithCreator = CreateChatDto & {
  creatorId: string;
};

export interface ChatService {
  create: (data: CreateChatWithCreator) => Promise<PublicChat>;
  joinChat: (
    userId: string,
    options: {
      inviteLinkToken?: string | undefined;
      chatId?: string | undefined;
    },
  ) => Promise<{
    chat: PublicChat;
    newParticipant: PublicChatParticipant;
    newMessage?: PublicMessage;
  }>;
  getAllUserChats(userId: string): Promise<PublicChat[]>;
  updateLastReadMessageTime(userId: string, chatId: string): Promise<void>;
  leaveFromChat(userId: string, chatId: string): Promise<void>;
  deleteChat(userId: string, chatId: string): Promise<void>;
  transferOwnership(
    chatId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ): Promise<void>;
  kickUserFromChat(
    chatId: string,
    adminId: string,
    targetUserId: string,
  ): Promise<void>;
}
