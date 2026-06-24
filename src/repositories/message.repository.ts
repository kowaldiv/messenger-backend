import { FastifyInstance } from "fastify";
import { MessageRepository } from "./interfaces/message.repository.interface.js";

export const defaultSelectMessage = {
  id: true,
  chatId: true,
  userId: true,
  text: true,
  replyToId: true,
  createdAt: true,
  editedAt: true,
  messageReactions: {
    select: {
      id: true,
      messageId: true,
      userId: true,
      emoji: true,
    },
  },
  attachments: {
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileUrl: true,
      messageId: true,
      createdAt: true,
    },
  },
  replyTo: {
    select: {
      id: true,
      chatId: true,
      userId: true,
      text: true,
      createdAt: true,
      editedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
};

export function messageRepository(
  instance: FastifyInstance,
): MessageRepository {
  const prisma = instance.prisma;

  const create = async (
    userId: string,
    chatId: string,
    text: string,
    replyToId?: string,
    attachments?: { fileUrl: string; fileType: string; fileName: string }[],
  ) => {
    const message = await prisma.messages.create({
      data: {
        userId,
        chatId,
        text,
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
      select: defaultSelectMessage,
    });
    return message;
  };

  return {
    create,
  };
}
