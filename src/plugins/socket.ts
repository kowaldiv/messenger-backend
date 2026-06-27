import fp from "fastify-plugin";
import { Server as SocketIOServer } from "socket.io";
import { config } from "../config/index.js";
import { UnauthorizedError } from "../errors/index.js";
import cookie from "cookie";
import { messageHandler } from "../socket/handlers/message.handler.js";
import { chatHandler } from "../socket/handlers/chat.handler.js";

declare module "fastify" {
  interface FastifyInstance {
    io: SocketIOServer;
  }
}

export default fp(
  async (instance) => {
    const io = new SocketIOServer(instance.server, {
      cors: {
        origin: config.CLIENT_URL || "*",
        credentials: true,
        methods: ["GET", "POST"],
      },
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    instance.decorate("io", io);

    io.use(async (socket, next) => {
      try {
        const cookies = socket.handshake.headers.cookie;

        if (!cookies) {
          return next(new UnauthorizedError("NO_TOKEN_PROVIDED"));
        }

        const parsedCookies = cookie.parse(cookies);
        const accessToken = parsedCookies.access_token;

        if (!accessToken) {
          return next(new UnauthorizedError("NO_TOKEN_PROVIDED"));
        }

        const decoded = await instance.jwt.verify(accessToken);

        socket.data.currentUser = decoded as {
          userId: string;
          globalRole: "user" | "moderator";
        };

        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new UnauthorizedError("INVALID_OR_EXPIRED_TOKEN"));
      }
    });

    io.on("connection", (socket) => {
      const user = socket.data.currentUser;
      instance.log.info(`User ${user.userId} connected: ${socket.id}`);

      messageHandler(
        socket,
        io,
        instance.services.message,
      );

      chatHandler(
        socket,
        io,
        instance.services.chat,
      )

      socket.on("disconnect", () => {
        instance.log.info(`User ${user.chatId} disconnected: ${socket.id}`);
      });
    });

    instance.addHook("onClose", (instance, done) => {
      io.close(() => done());
    });
  },
  {
    name: "socket",
    dependencies: ["jwt"],
  },
);
