import fp from "fastify-plugin";
import { authService } from "../service/auth.service.js";
import { avatarService } from "../service/avatar.service.js";
import { chatService } from "../service/chat.service.js";
import { messageService } from "../service/message.service.js";

declare module "fastify" {
  interface FastifyInstance {
    services: {
      auth: ReturnType<typeof authService>;
      avatar: ReturnType<typeof avatarService>;
      chat: ReturnType<typeof chatService>;
      message: ReturnType<typeof messageService>;
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

    const chatSvc = chatService(repositories.chat, repositories.user);

    const messageSvc = messageService(
      repositories.message,
      repositories.chat,
      repositories.user,
    );

    // Декорируем fastify
    fastify.decorate("services", {
      auth: authSvc,
      avatar: avatarSvc,
      chat: chatSvc,
      message: messageSvc,
    });

    fastify.log.info("Services registered");
  },
  {
    name: "services",
    dependencies: ["repositories"],
  },
);
