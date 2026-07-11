import { test } from "node:test";
import * as assert from "node:assert";
import {
  createAndConnectUser,
  sendMessageHelper,
} from "../../../utils/test-helpers-socket.io.js";

export async function getMessagesTest(app: any) {
  test("GET /user/:userId/chats/:chatId/messages - should return messages", async () => {
    // 1. Регистрируем пользователей
    const { client: client1, accessToken: accessToken1 } =
      await createAndConnectUser(app);
    const { user: user2 } = await createAndConnectUser(app);

    let chatId: string = "";

    for (let i = 0; i < 5; i++) {
      const data = await sendMessageHelper(client1, user2.id);
      chatId = data.message.chatId;
    }

    // 4. Получаем сообщения через API
    // console.log("chatId: ", chatId);
    const res = await app.inject({
      method: "GET",
      url: `/message/${chatId}`,
      cookies: {
        access_token: accessToken1,
      },
    });

    // 5. Проверяем ответ
    assert.equal(res.statusCode, 200);

    const data = JSON.parse(res.payload);
    assert.ok(data.messages);
    assert.equal(data.messages.length, 5);
    // assert.equal(data.hasMore, false); // меньше лимита (30)

    // Проверяем что сообщения в правильном порядке (от старых к новым)
    // assert.equal(data.messages[0].text, "Message 1");
    // assert.equal(data.messages[4].text, "Message 5");
  });
}
