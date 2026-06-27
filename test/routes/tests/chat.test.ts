import { describe, test } from "node:test";
import * as assert from "node:assert";
import { createTestChat, createTestUser } from "../../utils/test-helpers.js";
import { createAndConnectUser } from "../../utils/test-helpers-socket.io.js";

export async function chatTest(app: any) {
  describe("Chats", async () => {
    // await test("POST /chat/create - success", async () => {
    //   const testUser = createTestUser();

    //   const registerRes = await app.inject({
    //     method: "POST",
    //     url: "/auth/register",
    //     payload: testUser,
    //   });

    //   assert.equal(registerRes.statusCode, 201);
    //   const registerData = JSON.parse(registerRes.payload);
    //   assert.ok(registerData);
    //   const cookies = registerRes.cookies;
    //   const accessTokenCookie = cookies.find(
    //     (c: any) => c.name === "access_token",
    //   );
    //   const accessToken = accessTokenCookie?.value;
    //   assert.ok(accessToken);
    //   const refreshTokenCookie = cookies.find(
    //     (c: any) => c.name === "refresh_token",
    //   );
    //   const refreshToken = refreshTokenCookie?.value;
    //   assert.ok(refreshToken);

    //   const res = await app.inject({
    //     method: "POST",
    //     url: "/chat/create",
    //     cookies: {
    //       access_token: accessToken,
    //     },
    //     payload: {
    //       type: "group",
    //       title: "test",
    //     },
    //   });

    //   assert.equal(res.statusCode, 201);
    //   const data = JSON.parse(res.payload);
    //   assert.ok(data);
    // });

    // await test("sokcet io JoinAllChats", async () => {
    //   const { accessToken, client } = await createAndConnectUser(app);

    //   // создаем тестовые чаты пользователю
    //   await createTestChat(app, accessToken);
    //   await createTestChat(app, accessToken);
    //   await createTestChat(app, accessToken);
    //   await createTestChat(app, accessToken);

    //   const joinedAllChats = new Promise((resolve) => {
    //     client.once("joinedAllChats", resolve);
    //   });

    //   client.emit("joinAllChats");

    //   // Ждем ответа от сервера
    //   const data = (await joinedAllChats) as any;
    //   assert.strictEqual(data.success, true, "Success should be true");
    //   client.close();
    // });

    // await test("socket io 'CreateChat' - success", async () => {
    //   const { client } = await createAndConnectUser(app);

    //   const createdChat = new Promise((resolve) => {
    //     client.once("createdChat", resolve);
    //   });

    //   client.emit(
    //     "createChat",
    //     JSON.stringify({
    //       type: "channel",
    //       title: "My Test Channel",
    //       description: "Test description",
    //       isPrivate: false,
    //     }),
    //   );

    //   // Ждем ответа от сервера
    //   const data = (await createdChat) as any;
    //   assert.strictEqual(data.success, true, "Success should be true");
    //   client.close();
    // });
  });
}
