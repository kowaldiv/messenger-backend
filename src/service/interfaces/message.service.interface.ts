import { PublicChat } from "../transformers/chat.transformer.js";
import { PublicMessage } from "../transformers/message.transformer.js";

export interface MessageService {
  create: (
    userId: string,
    chatId: string,
    text: string,
    replyToId?: string,
    attachments?: {
      fileUrl: string;
      fileType: string;
      fileName: string;
    }[],
  ) => Promise<{
    message: PublicMessage;
    chatId: string;
    isNewChat: boolean;
    fullChatForSender?: PublicChat;
    fullChatForReceiver?: PublicChat;
  }>;
  sendInviteToChat: (
    userId: string,
    destinationChatId: string,
    chatIds: string[],
  ) => Promise<
    {
      message: PublicMessage;
      chatId: string;
    }[]
  >;
  getMessages: (params: {
    chatId: string;
    beforeId?: string;
    limit?: number;
  }) => Promise<{ messages: PublicMessage[]; hasMore: boolean }>;
}
