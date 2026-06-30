import fp from "fastify-plugin";
import { authController } from "../controllers/auth.controller.js";
import { avatarController } from "../controllers/avatar.controller.js";
import { chatController } from "../controllers/chat.controller.js";
import { searchController } from "../controllers/search.controller.js";

declare module "fastify" {
  interface FastifyInstance {
    controllers: {
      auth: ReturnType<typeof authController>;
      avatar: ReturnType<typeof avatarController>;
      chat: ReturnType<typeof chatController>;
      search: ReturnType<typeof searchController>;
    };
  }
}

export default fp(
  async (fastify) => {
    const { services } = fastify;

    // Создаем контроллеры
    const authCtrl = authController(services.auth);
    const avatarCtrl = avatarController(services.avatar);
    const chatCtrl = chatController(services.chat);
    const searchCtrl = searchController(services.search);

    // Декорируем fastify
    fastify.decorate("controllers", {
      auth: authCtrl,
      avatar: avatarCtrl,
      chat: chatCtrl,
      search: searchCtrl,
    });

    fastify.log.info("Controllers registered");
  },
  {
    name: "controllers",
    dependencies: ["services"],
  },
);
