import { PublicMessage } from "../../repositories/interfaces/message.repository.interface.js";

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
  ) => Promise<{ message: PublicMessage; chatId: string; isNewChat: boolean }>;
}
