import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import {
  joinUserToChat,
  sendNewChatToUser,
  sendUserMessage,
} from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";
import z from "zod";

const inviteLinkSchema = z
  .object({
    inviteLinkToken: z
      .string()
      .min(1, "inviteLinkToken не может быть пустым")
      .max(255, "inviteLinkToken слишком длинный")
      .optional(),
    chatId: z
      .string()
      .min(1, "chatId не может быть пустым")
      .max(100, "chatId слишком длинный")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.inviteLinkToken && !data.chatId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Нужно передать хотя бы одно из полей: inviteLinkToken или chatId",
        path: ["inviteLinkToken"], // или [] — чтобы ошибка была на объекте
      });
    }
  });

export const joinChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("joinChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;
      const { inviteLinkToken, chatId } = inviteLinkSchema.parse(data);

      const { chat, newParticipant, newMessage } = await chatService.joinChat(
        userId,
        {
          inviteLinkToken,
          chatId,
        },
      );
      if (chat.type === "group") {
        if (newMessage) await sendUserMessage(io, chat.id, newMessage);
        io.to(`chat:${chat.id}`).emit("chat:userJoined", {
          chatParticipant: newParticipant,
        });
      }
      await joinUserToChat(io, userId, chat.id);
      await sendNewChatToUser(io, userId, chat);
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
