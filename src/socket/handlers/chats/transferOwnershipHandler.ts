import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { AppError } from "../../../errors/index.js";

export const transferOwnershipHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("transferOwnership", async (data) => {
    try {
      const currentOwnerId = socket.data.currentUser.userId;
      const { chatId, newOwnerId } = data;

      await chatService.transferOwnership(chatId, currentOwnerId, newOwnerId);

      // Уведомляем всех участников чата о смене владельца
      io.to(`chat:${chatId}`).emit("chat:ownershipTransferred", {
        chatId,
        previousOwnerId: currentOwnerId,
        newOwnerId,
      });

      socket.emit("chat:transferOwnershipSuccess", { chatId, newOwnerId });
    } catch (error) {
      console.error("Transfer ownership error:", error);
      if (error instanceof AppError) {
        socket.emit("error", {
          message: error.message,
          code: error.code || "TRANSFER_OWNERSHIP_FAILED",
          statusCode: error.statusCode || 500,
        });
      } else {
        socket.emit("error", {
          message: "Failed to transfer ownership",
        });
      }
    }
  });
};