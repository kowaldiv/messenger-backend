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
    chat?: PublicChat;
  }>;
  sendInviteToChat: (
    userId: string,
    destinationChatId: string,
    chatIds: string[],
  ) => Promise<
    {
      message: PublicMessage;
      chatId: string;
      isNewChat: boolean;
      invitedUserId?: string | null | undefined;
    }[]
  >;
}
