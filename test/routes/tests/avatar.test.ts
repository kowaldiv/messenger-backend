import { test } from "node:test";
import * as assert from "node:assert";
import FormData from "form-data";
import {
  bufferToStream,
  createTestImageBuffer,
  createTestUser,
} from "../../utils/test-helpers.js";

export async function avatarTest(app: any) {
  await test("Avatar", async (t) => {
    await test("POST /api/avatar/uploadUserAvatar - success", async () => {
      // Регистрируем и логиним пользователя
      const testUser = createTestUser();
      const regRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: testUser,
      });

      const cookies = regRes.cookies;
      const accessTokenCookie = cookies.find(
        (c: any) => c.name === "access_token",
      );
      const accessToken = accessTokenCookie?.value;
      assert.ok(accessToken);

      // Создаем FormData
      const form = new FormData();
      const imageBuffer = createTestImageBuffer();
      const stream = bufferToStream(imageBuffer);

      form.append("file", stream, {
        filename: "test-avatar.png",
        contentType: "image/png",
      });

      const res = await app.inject({
        method: "POST",
        url: "/avatar/uploadUserAvatar",
        cookies: {
          access_token: accessToken,
        },
        headers: {
          ...form.getHeaders(),
        },
        payload: form,
      });

      assert.equal(res.statusCode, 201);
      const data = JSON.parse(res.payload);
      assert.ok(data);
      assert.ok(data.id);
    });

    await test("GET /api/avatar/setPrimaryUserAvatar/:avatarId - success", async () => {
      // Регистрируем и логиним пользователя
      const testUser = createTestUser();
      const regRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: testUser,
      });

      const cookies = regRes.cookies;
      const accessTokenCookie = cookies.find(
        (c: any) => c.name === "access_token",
      );
      const accessToken = accessTokenCookie?.value;
      assert.ok(accessToken);

      const form = new FormData();
      const imageBuffer = createTestImageBuffer();
      const stream = bufferToStream(imageBuffer);

      form.append("file", stream, {
        filename: "test-avatar.png",
        contentType: "image/png",
      });

      // Сначала загружаем аватар
      const uploadRes = await app.inject({
        method: "POST",
        url: "/avatar/uploadUserAvatar",
        cookies: {
          access_token: accessToken,
        },
        headers: {
          ...form.getHeaders(),
        },
        payload: form,
      });

      assert.equal(uploadRes.statusCode, 201);
      const uploadData = JSON.parse(uploadRes.payload);
      const avatarId = uploadData.id;

      // Устанавливаем как основной
      const res = await app.inject({
        method: "GET",
        url: `/avatar/setPrimaryUserAvatar/${avatarId}`,
        cookies: {
          access_token: accessToken,
        },
      });

      assert.equal(res.statusCode, 200);
    });

    await test("GET /api/avatar/deleteUserAvatar/:avatarId - success", async () => {
      // Регистрируем и логиним пользователя
      const testUser = createTestUser();
      const regRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: testUser,
      });

      const cookies = regRes.cookies;
      const accessTokenCookie = cookies.find(
        (c: any) => c.name === "access_token",
      );
      const accessToken = accessTokenCookie?.value;
      assert.ok(accessToken);

      const form = new FormData();
      const imageBuffer = createTestImageBuffer();
      const stream = bufferToStream(imageBuffer);

      form.append("file", stream, {
        filename: "test-avatar.png",
        contentType: "image/png",
      });

      const uploadRes = await app.inject({
        method: "POST",
        url: "/avatar/uploadUserAvatar",
        cookies: {
          access_token: accessToken,
        },
        headers: {
          ...form.getHeaders(),
        },
        payload: form,
      });

      assert.equal(uploadRes.statusCode, 201);
      const uploadData = JSON.parse(uploadRes.payload);
      const avatarId = uploadData.id;

      // Удаляем аватар
      const res = await app.inject({
        method: "GET",
        url: `/avatar/deleteUserAvatar/${avatarId}`,
        cookies: {
          access_token: accessToken,
        },
      });

      assert.equal(res.statusCode, 200);
    });
  });
}

// test("POST /api/avatar/uploadChatAvatar/:chatId - success", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Создаем чат
//   const chatId = await createTestChat(app, accessToken);

//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   const res = await app.inject({
//     method: "POST",
//     url: `/avatar/uploadChatAvatar/${chatId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   assert.equal(res.statusCode, 201);
//   const data = JSON.parse(res.payload);
//   assert.ok(data);
//   assert.ok(data.id);
// });

// test("GET /api/avatar/setPrimaryChatAvatar/:chatId/:avatarId - success", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Создаем чат
//   const chatId = await createTestChat(app, accessToken);

//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   // Загружаем аватар для чата
//   const uploadRes = await app.inject({
//     method: "POST",
//     url: `/avatar/uploadChatAvatar/${chatId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   assert.equal(uploadRes.statusCode, 201);
//   const uploadData = JSON.parse(uploadRes.payload);
//   const avatarId = uploadData.id;

//   // Устанавливаем как основной
//   const res = await app.inject({
//     method: "GET",
//     url: `/avatar/setPrimaryChatAvatar/${chatId}/${avatarId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//   });

//   assert.equal(res.statusCode, 200);
// });

// test("GET /api/avatar/deleteChatAvatar/:chatId/:avatarId - success", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Создаем чат
//   const chatId = await createTestChat(app, accessToken);

//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   // Загружаем аватар для чата
//   const uploadRes = await app.inject({
//     method: "POST",
//     url: `/avatar/uploadChatAvatar/${chatId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   assert.equal(uploadRes.statusCode, 201);
//   const uploadData = JSON.parse(uploadRes.payload);
//   const avatarId = uploadData.id;

//   // Удаляем аватар
//   const res = await app.inject({
//     method: "GET",
//     url: `/avatar/deleteChatAvatar/${chatId}/${avatarId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//   });

//   assert.equal(res.statusCode, 200);
// });

// test("GET /api/avatar/:entityType/:entityId/avatars - success", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   const registerRes = await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const registerData = JSON.parse(registerRes.payload);
//   const userId = registerData.user.id;

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Загружаем аватар для пользователя
//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   await app.inject({
//     method: "POST",
//     url: "/avatar/uploadUserAvatar",
//     cookies: {
//       access_token: accessToken,
//     },
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   // Получаем все аватары пользователя
//   const res = await app.inject({
//     method: "GET",
//     url: `/avatar/user/${userId}/avatars`,
//     cookies: {
//       access_token: accessToken,
//     },
//   });

//   assert.equal(res.statusCode, 200);
//   const data = JSON.parse(res.payload);
//   assert.ok(Array.isArray(data), "Should return an array");
//   assert.ok(data.length > 0, "Should have at least one avatar");

//   // Проверяем структуру аватара
//   const avatar = data[0];
//   assert.ok(avatar.id, "Avatar should have id");
//   assert.ok(avatar.avatarUrl, "Avatar should have avatarUrl");
// });

// test("GET /api/avatar/:entityType/:entityId/avatars - for chat", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Создаем чат
//   const chatId = await createTestChat(app, accessToken);

//   // Загружаем аватар для чата
//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   await app.inject({
//     method: "POST",
//     url: `/avatar/uploadChatAvatar/${chatId}`,
//     cookies: {
//       access_token: accessToken,
//     },
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   // Получаем все аватары чата
//   const res = await app.inject({
//     method: "GET",
//     url: `/avatar/chat/${chatId}/avatars`,
//     cookies: {
//       access_token: accessToken,
//     },
//   });

//   assert.equal(res.statusCode, 200);
//   const data = JSON.parse(res.payload);
//   assert.ok(Array.isArray(data), "Should return an array");
//   assert.ok(data.length > 0, "Should have at least one avatar");
// });

// // Тест на ошибку 401
// test("POST /api/avatar/uploadUserAvatar - unauthorized", async (t) => {
//   const app = await build(t);

//   const form = new FormData();
//   const imageBuffer = createTestImageBuffer();
//   const stream = bufferToStream(imageBuffer);
//   form.append("file", stream, {
//     filename: "test-avatar.png",
//     contentType: "image/png",
//   });

//   const res = await app.inject({
//     method: "POST",
//     url: "/avatar/uploadUserAvatar",
//     headers: {
//       ...form.getHeaders(),
//     },
//     payload: form,
//   });

//   assert.equal(res.statusCode, 401);
// });

// // Тест на ошибку 404 - аватар не найден
// test("GET /api/avatar/deleteUserAvatar/:avatarId - not found", async (t) => {
//   const app = await build(t);

//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: testUser.password,
//     },
//   });

//   const accessToken = getAccessTokenFromResponse(loginRes);
//   assert.ok(accessToken);

//   // Пытаемся удалить несуществующий аватар
//   const res = await app.inject({
//     method: "GET",
//     url: `/avatar/deleteUserAvatar/00000000-0000-0000-0000-000000000000`,
//     cookies: {
//       access_token: accessToken,
//     },
//   });

//   assert.equal(res.statusCode, 404);
// });
