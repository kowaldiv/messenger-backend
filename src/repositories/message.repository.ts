import { FastifyInstance } from "fastify";
import {
  MessageRepository,
  Message,
} from "./interfaces/message.repository.interface.js";
import { messageSelect } from "./prisma/selects/message.selects.js";

export function messageRepository(
  instance: FastifyInstance,
): MessageRepository {
  const prisma = instance.prisma;

  const create = async ({
    chatId,
    userId,
    type,
    text,
    metadata,
    replyToId,
    attachments,
  }: {
    chatId: string;
    userId?: string;
    type: "text" | "invite" | "joined";
    text?: string;
    metadata?: any;
    replyToId?: string;
    attachments?: { fileUrl: string; fileType: string; fileName: string }[];
  }) => {
    const message = await prisma.message.create({
      data: {
        userId,
        chatId,
        type,
        text,
        metadata,
        replyToId,
        attachments: {
          createMany: {
            data:
              attachments?.map((att) => ({
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileName: att.fileName,
              })) || [],
          },
        },
      },
      select: messageSelect,
    });
    return message as Message;
  };

  return {
    create,
  };
}
