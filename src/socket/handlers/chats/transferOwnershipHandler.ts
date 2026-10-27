import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

const transferOwnershipSchema = z.object({
  chatId: z
    .string()
    .min(1, "ChatId is required")
    .trim(),
  newOwnerId: z
    .string()
    .min(1, "NewOwnerId is required")
    .trim(),
});

export const transferOwnershipHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("transferOwnership", async (data) => {
    try {
      const currentOwnerId = socket.data.currentUser.userId;
      const validatedData = transferOwnershipSchema.parse(data);
      const { chatId, newOwnerId } = validatedData;

      await chatService.transferOwnership(chatId, currentOwnerId, newOwnerId);

      // Уведомляем всех участников чата о смене владельца
      io.to(`chat:${chatId}`).emit("chat:ownershipTransferred", {
        chatId,
        previousOwnerId: currentOwnerId,
        newOwnerId,
      });

      socket.emit("chat:transferOwnershipSuccess", { chatId, newOwnerId });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
