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
import {
  s3StorageRepository,
  StorageRepository,
} from "../repositories/implementations/storage.service.js";
import { unreadRepository } from "../repositories/unread.repository.js";

// типы
import { UnreadRepository } from "../repositories/interfaces/unread.repository.interface.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { AuthRepository } from "../repositories/interfaces/auth.repository.interface.js";
import { TokenRepository } from "../repositories/interfaces/token.repository.interface.js";
import { AvatarRepository } from "../repositories/interfaces/avatar.repository.interface.js";
import { UserQueryRepository } from "../repositories/interfaces/userQuery.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: {
      user: UserRepository;
      userQuery: UserQueryRepository;
      avatar: AvatarRepository;
      token: TokenRepository;
      auth: AuthRepository;
      chat: ChatRepository;
      message: MessageRepository;
      inviteLink: InviteLinkRepository;
      storage: StorageRepository;
      unread: UnreadRepository;
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
    const unreadRepo = unreadRepository(fastify);

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
      unread: unreadRepo,
    });

    fastify.log.info("Repositories registered");
  },
  {
    name: "repositories",
    dependencies: ["prisma", "jwt"],
  },
);
