import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../service/interfaces/chat.service.interface.js";
import { joinUserToChat } from "./helpers.js";

export const chatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  (socket.on("joinAllChats", async () => {
    try {
      const userId = socket.data.currentUser.userId;

      const userChats = await chatService.getAllUserChats(userId);

      for (const chat of userChats) {
        await joinUserToChat(io, userId, chat.id);
      }

      socket.emit("joinedAllChats", {
        success: true,
        chats: userChats.map((chat) => chat.id),
        count: userChats.length,
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", {
        message: "Failed to join all chats",
      });
    }
  }),
    socket.on("createChat", async (data) => {
      try {
        const userId = socket.data.currentUser.userId;
        const { type, title, description, isPrivate } = JSON.parse(data);

        if (type === "channel") {
          const chat = await chatService.create({
            type: "channel",
            title: title,
            isPrivate: isPrivate,
            description: description,
            creatorId: userId,
          });
          await joinUserToChat(io, userId, chat.id);
          socket.emit("createdChat", {
            success: true,
            chat: chat,
          });
        } else {
          const chat = await chatService.create({
            type: "group",
            title: title,
            creatorId: userId,
          });
          await joinUserToChat(io, userId, chat.id);
          socket.emit("createdChat", {
            success: true,
            chat: chat,
          });
        }
      } catch (error) {
        console.error(error);
        socket.emit("error", {
          message: "Failed to create chat",
        });
      }
    }),
    socket.on("joinChat", async (data) => {
      try {
        const userId = socket.data.currentUser.userId;
        const { inviteLinkToken, chatId } = JSON.parse(data);

        const chat = await chatService.joinChat(userId, {
          inviteLinkToken,
          chatId,
        });
        await joinUserToChat(io, userId, chat.id);
        socket.emit("newChat", {
          success: true,
          chat,
        });
      } catch (error) {
        console.error(error);
        socket.emit("error", {
          message: "Failed to create chat",
        });
      }
    }));
};
