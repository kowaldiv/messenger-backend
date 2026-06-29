import { type FastifyPluginAsync } from "fastify";

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
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
            firstName: { type: "string", minLength: 2 },
            lastName: { type: "string" },
          },
          required: ["email", "password", "username", "firstName"],
        },
      },
    },
    fastify.controllers.auth.register,
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
    fastify.controllers.auth.login,
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
    fastify.controllers.auth.forgotPassword,
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
    fastify.controllers.auth.resetPassword,
  );

  fastify.get("/refresh-token", fastify.controllers.auth.refreshToken);

  fastify.get("/logout", fastify.controllers.auth.logout);

  fastify.get(
    "/sessions",
    { preHandler: fastify.authenticate },
    fastify.controllers.auth.getSession,
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
    fastify.controllers.auth.revokeSession,
  );
};

export default auth;
