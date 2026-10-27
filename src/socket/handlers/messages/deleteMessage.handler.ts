import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

const deleteMessageSchema = z.object({
  messageId: z.string().min(1, "MessageId is required").trim(),
  chatId: z.string().min(1, "ChatId is required").trim(),
});

export const deleteMessageHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("deleteMessage", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const validatedData = deleteMessageSchema.parse(data);
      const { messageId, chatId } = validatedData;

      await messageService.deleteMessage({ messageId, userId });

      io.to(`chat:${chatId}`).emit("messageDeleted", {
        success: true,
        messageId,
      });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
