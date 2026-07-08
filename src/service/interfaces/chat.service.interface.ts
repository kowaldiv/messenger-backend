import { PublicChat } from "../transformers/chat.transformer.js";
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
  ) => Promise<PublicChat>;
  // getChatParticipants(
  //   chatId: string,
  //   userId: string,
  // ): Promise<ChatParticipantWithUnread[]>;
  getAllUserChats(userId: string): Promise<PublicChat[]>;
  updateLastReadMessageTime(userId: string, chatId: string): Promise<void>;
}
