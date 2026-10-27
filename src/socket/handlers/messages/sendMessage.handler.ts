import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

const sendMessageSchema = z.object({
  chatIdOrUserId: z.string().min(1, "ChatIdOrUserId is required").trim(),
  text: z
    .string()
    .min(1, "Text is required")
    .max(4000, "Text must be less than 4000 characters")
    .trim(),
});

export const sendMessageHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("sendMessage", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const validatedData = sendMessageSchema.parse(data);
      const { chatIdOrUserId, text } = validatedData;

      const {
        message,
        chatId,
        isNewChat,
        fullChatForSender,
        fullChatForReceiver,
      } = await messageService.create(userId, chatIdOrUserId, text);

      if (isNewChat && fullChatForSender && fullChatForReceiver) {
        await sendNewChatToUser(io, userId, fullChatForSender);
        await sendNewChatToUser(io, chatIdOrUserId, fullChatForReceiver);
        await joinUserToChat(io, userId, chatId);
        await joinUserToChat(io, chatIdOrUserId, chatId);
      }

      io.to(`chat:${chatId}`).emit("newMessage", {
        success: true,
        message,
      });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
