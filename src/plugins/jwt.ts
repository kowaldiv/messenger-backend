import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { config } from "../config/index.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/index.js";
import fastifyCookie from "@fastify/cookie";

declare module "fastify" {
  export interface FastifyRequest {
    currentUser: {
      userId: string;
      globalRole: "user" | "moderator";
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export default fp(async (instance) => {
  if (!config.JWT_SECRET) {
    throw new Error("JWT secret is not definad in config");
  }

  await instance.register(fastifyCookie);

  await instance.register(fastifyJwt, {
    secret: config.JWT_SECRET,
  });

  instance.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // ✅ Логируем ВСЕ куки
      console.log('=== AUTHENTICATE DEBUG ===');
      console.log('All cookies:', request.cookies);
      console.log('Token cookie:', request.cookies?.token);
      console.log('Refresh token cookie:', request.cookies?.refresh_token);
      
      const accessToken = request.cookies?.access_token;
      
      if (!accessToken) {
        console.log('❌ No token cookie found');
        throw new UnauthorizedError("NO_TOKEN_PROVIDED");
      }

      console.log('✅ Token found, length:', accessToken.length);
      console.log('Token preview:', accessToken.substring(0, 30) + '...');

      // ✅ Проверяем JWT_SECRET
      console.log('JWT_SECRET used:', config.JWT_SECRET ? 'Set' : 'Not set');

      const decoded = await instance.jwt.verify(accessToken);
      console.log('✅ Token verified successfully:', decoded);
      
      request.currentUser = decoded as {
        userId: string;
        globalRole: "user" | "moderator";
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      // Логируем детали ошибки
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      }
      throw new UnauthorizedError("INVALID_OR_EXPIRED_TOKEN");
    }
  },
);
});
