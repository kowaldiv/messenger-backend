import fp from "fastify-plugin";
import { userRepository } from "../repositories/user.repository.js";
import { userQueryRepository } from "../repositories/userQuery.repository.js";
import { avatarRepository } from "../repositories/avatar.repository.js";
import { tokenRepository } from "../repositories/token.repository.js";
import { authRepository } from "../repositories/auth.repository.js";
import { chatRepository } from "../repositories/chat.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { inviteLinkRepository } from "../repositories/invite-link.repository.js";
// репозиторий для хранения картинок
import { s3StorageRepository } from "../repositories/implementations/storage.service.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: {
      user: ReturnType<typeof userRepository>;
      userQuery: ReturnType<typeof userQueryRepository>;
      avatar: ReturnType<typeof avatarRepository>;
      token: ReturnType<typeof tokenRepository>;
      auth: ReturnType<typeof authRepository>;
      chat: ReturnType<typeof chatRepository>;
      message: ReturnType<typeof messageRepository>;
      inviteLink: ReturnType<typeof inviteLinkRepository>;
      storage: ReturnType<typeof s3StorageRepository>;
    };
  }
}

export default fp(
  async (fastify) => {
    // Создаем репозитории
    const userRepo = userRepository(fastify);
    const userQueryRepo = userQueryRepository(fastify);
    const avatarRepo = avatarRepository(fastify);
    const tokenRepo = tokenRepository(fastify);
    const authRepo = authRepository(fastify);
    const chatRepo = chatRepository(fastify);
    const messageRepo = messageRepository(fastify);
    const inviteLinkRepo = inviteLinkRepository(fastify);
    const storageRepo = s3StorageRepository();

    // Декорируем fastify
    fastify.decorate("repositories", {
      user: userRepo,
      userQuery: userQueryRepo,
      avatar: avatarRepo,
      token: tokenRepo,
      auth: authRepo,
      chat: chatRepo,
      message: messageRepo,
      inviteLink: inviteLinkRepo,
      storage: storageRepo,
    });

    fastify.log.info("Repositories registered");
  },
  {
    name: "repositories",
    dependencies: ["prisma", "jwt"],
  },
);
