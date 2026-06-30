import fp from "fastify-plugin";
import { authService } from "../service/auth.service.js";
import { avatarService } from "../service/avatar.service.js";
import { chatService } from "../service/chat.service.js";
import { messageService } from "../service/message.service.js";
import { MessageService } from "../service/interfaces/message.service.interface.js";
import { ChatService } from "../service/interfaces/chat.service.interface.js";
import { AvatarService } from "../service/interfaces/avatar.service.interface.js";
import { AuthService } from "../service/interfaces/auth.service.interface.js";
import { searchService } from "../service/search.service.js";
import { SearchService } from "../service/interfaces/channel.setvice.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    services: {
      auth: AuthService;
      avatar: AvatarService;
      chat: ChatService;
      message: MessageService;
      search: SearchService;
    };
  }
}

export default fp(
  async (fastify) => {
    const { repositories } = fastify;

    // Создаем сервисы
    const authSvc = authService(
      repositories.user,
      repositories.userQuery,
      repositories.token,
      repositories.auth,
      fastify,
    );

    const avatarSvc = avatarService(
      repositories.avatar,
      repositories.chat,
      repositories.storage,
    );

    const chatSvc = chatService(
      repositories.chat,
      repositories.user,
      repositories.inviteLink,
      repositories.message,
    );

    const messageSvc = messageService(
      repositories.message,
      repositories.chat,
      repositories.user,
      repositories.inviteLink,
    );

    const searchSvc = searchService(repositories.user, repositories.chat);

    // Декорируем fastify
    fastify.decorate("services", {
      auth: authSvc,
      avatar: avatarSvc,
      chat: chatSvc,
      message: messageSvc,
      search: searchSvc,
    });

    fastify.log.info("Services registered");
  },
  {
    name: "services",
    dependencies: ["repositories"],
  },
);
