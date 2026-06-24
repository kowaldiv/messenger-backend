import { test } from "node:test";
import * as assert from "node:assert";
import { io as ioc } from "socket.io-client";
import { registerTestUser } from "../utils/test-helpers.js";

export async function messageTest(app: any) {
  test("Socket.IO - sendMessage to user", async () => {
    // Создаем двух пользователей
    const { accessToken: token1, user: user1 } = await registerTestUser(app);
    const { accessToken: token2, user: user2 } = await registerTestUser(app);

    // Подключаем первого пользователя
    const client1 = ioc("http://localhost:3000", {
      transports: ["websocket"],
      forceNew: true,
      extraHeaders: {
        Cookie: `access_token=${token1}`,
      },
    });

    // Подключаем второго пользователя
    const client2 = ioc("http://localhost:3000", {
      transports: ["websocket"],
      forceNew: true,
      extraHeaders: {
        Cookie: `access_token=${token2}`,
      },
    });

    // Ждем подключения обоих
    await Promise.all([
      new Promise((resolve) => client1.on("connect", () => resolve(true))),
      new Promise((resolve) => client2.on("connect", () => resolve(true))),
    ]);

    // Отправляем сообщение от первого пользователя второму
    const messageText = "Hello from test!";
    client1.emit(
      "sendMessage",
      JSON.stringify({
        chatIdOrUserId: user2.id, // ID второго пользователя
        text: messageText,
      }),
    );

    // Проверяем что второй пользователь получил сообщение
    const received = await new Promise((resolve) => {
      client2.on("newMessage", (data) => {
        resolve(data);
      });
      setTimeout(() => resolve(null), 3000);
    });

    assert.ok(received, "Should receive message");
    assert.equal((received as any).message.text, messageText);
    assert.equal((received as any).message.senderId, user1.id);

    // Чистим
    client1.close();
    client2.close();
    await app.close();
  });
}
