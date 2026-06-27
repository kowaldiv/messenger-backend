import { PublicChat } from "../transformers/chat.transformer.js";

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
  getChatParticipantsIds(chatId: string): Promise<string[]>;
  getAllUserChats(userId: string): Promise<PublicChat[]>;
}
