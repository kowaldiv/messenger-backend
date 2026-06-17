import { type FastifyPluginAsync } from "fastify";
import { userRepository } from "../../repositories/user.repository.js";
import { authController } from "../../controllers/auth.controller.js";
import { authService } from "../../service/auth.service.js";
import { tokenRepository } from "../../repositories/token.repository.js";
import { authRepository } from "../../repositories/auth.repositofy.js";
import { userQueryRepository } from "../../repositories/userQuery.repository.js";

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log("✅ User routes being registered!"); // ← Добавьте лог

  const userRepo = userRepository(fastify);
  const userQueryRepo = userQueryRepository(fastify);
  const tokenRepo = tokenRepository(fastify);
  const authRepo = authRepository(fastify);
  const service = authService(
    userRepo,
    userQueryRepo,
    tokenRepo,
    authRepo,
    fastify,
  );
  const controller = authController(service);

  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            username: { type: "string", minLength: 3 },
            firstName: { type: "string", minLength: 5 },
            lastName: { type: "string" },
          },
          required: ["email", "password", "username", "firstName"],
        },
      },
    },
    controller.register,
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
          required: ["email", "password"],
        },
      },
    },
    controller.login,
  );

  fastify.post(
    "/forgot-password",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
          },
          required: ["email"],
        },
      },
    },
    controller.forgotPassword,
  );

  fastify.post(
    "/reset-password",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            token: { type: "string" },
            newPassword: { type: "string", minLength: 6 },
          },
          required: ["token", "newPassword"],
        },
      },
    },
    controller.resetPassword,
  );

  fastify.get("/refresh-token", controller.refreshToken);

  fastify.get("/logout", controller.logout);

  fastify.get(
    "/sessions",
    { preHandler: fastify.authenticate },
    controller.getSession,
  );

  fastify.post(
    "/revoke-session",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            tokenId: { type: "string" },
          },
          required: ["tokenId"],
        },
      },
      preHandler: [fastify.authenticate],
    },
    controller.revokeSession,
  );
};

export default auth;
