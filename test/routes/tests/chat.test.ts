import { describe, test } from "node:test";
import * as assert from "node:assert";
import {
  createAndConnectUser,
  createTestChat,
} from "../../utils/test-helpers-socket.io.js";

export async function chatTest(app: any) {
  describe("Chats", async () => {
    await test("sokcet io JoinAllChats", async () => {
      const { client } = await createAndConnectUser(app);

      // создаем тестовые чаты пользователю
      await createTestChat(client);
      await createTestChat(client);
      await createTestChat(client);
      await createTestChat(client);

      const joinedAllChats = new Promise((resolve) => {
        client.once("joinedAllChats", resolve);
      });

      client.emit("joinAllChats");

      // Ждем ответа от сервера
      const data = (await joinedAllChats) as any;
      assert.strictEqual(data.success, true, "Success should be true");
      client.close();
    });

    await test("socket io 'CreateChat' - success", async () => {
      const { client } = await createAndConnectUser(app);

      const createdChat = new Promise((resolve) => {
        client.once("createdChat", resolve);
      });

      client.emit(
        "createChat",
        JSON.stringify({
          type: "channel",
          title: "My Test Channel",
          description: "Test description",
          isPrivate: false,
        }),
      );

      // Ждем ответа от сервера
      const data = (await createdChat) as any;
      assert.strictEqual(data.success, true, "Success should be true");
      client.close();
    });
  });
}
