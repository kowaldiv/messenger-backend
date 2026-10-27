import { FastifyInstance } from "fastify";
import {
  MessageRepository,
  Message,
  Attachment,
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

  const getMessages = async ({
    chatId,
    beforeId,
    limit = 30,
  }: {
    chatId: string;
    beforeId?: string;
    limit?: number;
  }) => {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        ...(beforeId && {
          id: {
            lt: beforeId, // UUID v7 сравнивается как строка корректно
          },
        }),
      },
      orderBy: {
        id: "desc", // UUID v7 сортируется по времени
      },
      take: limit,
      select: messageSelect,
    });

    return messages.reverse() as Message[];
  };

  const getMessage = async (id: string) => {
    const message = await prisma.message.findUnique({
      where: { id },
      select: messageSelect,
    });
    return message as Message | null;
  };

  const deleteMessage = async (id: string) => {
    await prisma.message.deleteMany({
      where: { id },
    });
  };

  const update = async (
    id: string,
    text?: string,
    deletedAttachmentsIds?: string[],
    addedAttachments?: Attachment[],
  ) => {
    return prisma.$transaction(async (tx) => {
      // Удаляем вложения
      if (deletedAttachmentsIds && deletedAttachmentsIds.length > 0) {
        await tx.attachmenst.deleteMany({
          where: {
            id: { in: deletedAttachmentsIds },
            messageId: id,
          },
        });
      }

      // Добавляем новые вложения
      if (addedAttachments && addedAttachments.length > 0) {
        await tx.attachmenst.createMany({
          data: addedAttachments.map((att) => ({
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileName: att.fileName,
            messageId: id,
          })),
        });
      }

      // Обновляем текст
      const message = await tx.message.update({
        where: { id },
        data: {
          ...(text !== undefined && { text }),
        },
        select: messageSelect,
      });

      return message as Message | null;
    });
  };

  return {
    create,
    getMessages,
    getMessage,
    deleteMessage,
    update,
  };
}
