// import { type FastifyPluginAsync } from "fastify";

// const avatar: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
//   console.log("✅ User routes being registered!"); // ← Добавьте лог

//   const userRepo = userRepository(fastify);
//   const userQueryRepo = userQueryRepository(fastify);
//   const tokenRepo = tokenRepository(fastify);
//   const authRepo = authRepository(fastify);
//   const service = authService(
//     userRepo,
//     userQueryRepo,
//     tokenRepo,
//     authRepo,
//     fastify,
//   );
//   const controller = avatar(service);

//   fastify.post(
//     "/register",
//     {
//       schema: {
//         body: {
//           type: "object",
//           properties: {
//             email: { type: "string", format: "email" },
//             password: { type: "string", minLength: 6 },
//             username: { type: "string", minLength: 3 },
//             firstName: { type: "string", minLength: 5 },
//             lastName: { type: "string" },
//           },
//           required: ["email", "password", "username", "firstName"],
//         },
//       },
//     },
//     controller.register,
//   );
// };

// export default avatar;
