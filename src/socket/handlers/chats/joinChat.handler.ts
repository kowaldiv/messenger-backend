import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

export const joinChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("joinChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;
      const { inviteLinkToken, chatId } = data;

      const { chat, newParticipant, newMessage } = await chatService.joinChat(
        userId,
        {
          inviteLinkToken,
          chatId,
        },
      );
      console.log('aaaaaaaaaaaaaaaaaaa')
      if (chat.type === "group") {
        console.log('bbbbbbbbbbbbbbbb')
        io.to(`chat:${chat.id}`).emit("newMessage", {
          success: true,
          message: newMessage,
        });
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
