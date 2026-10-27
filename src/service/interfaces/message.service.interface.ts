import { Attachment } from "../../repositories/interfaces/message.repository.interface.js";
import { PublicChat } from "../transformers/chat.transformer.js";
import { PublicMessage } from "../transformers/message.transformer.js";


export interface MessageService {
  create: (
    userId: string,
    chatId: string,
    text: string,
    replyToId?: string,
    attachments?: Attachment[],
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
  deleteMessage: (params: { messageId: string; userId: string }) => Promise<void>;
  updateMessage: (params: {
    userId: string;
    messageId: string;
    text? : string;
    deletedAttachmentsIds?: string[];
    addedAttachments?: Attachment[];
  }) => Promise<PublicMessage>;
}
