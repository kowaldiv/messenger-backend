import test from "node:test";
import { createAndConnectUser } from "../../../utils/test-helpers-socket.io.js";
import * as assert from "node:assert";

export async function deleteMessage(app: any) {
  await test("Socket.IO - deleteMessage notifies chat members", async () => {
    // Создаем двух пользователей
    const { client: client1 } = await createAndConnectUser(app);
    const { client: client2, user: user2 } = await createAndConnectUser(app);

    // Создаем приватный чат между ними через отправку сообщения
    const newChat1 = new Promise((resolve) => {
      client1.once("chat:new", resolve);
    });
    const newChat2 = new Promise((resolve) => {
      client2.once("chat:new", resolve);
    });

    const messageText = "This message will be deleted";
    client1.emit("sendMessage", {
      chatIdOrUserId: user2.id,
      text: messageText,
    });

    const [chat1] = (await Promise.all([newChat1, newChat2])) as [any, any];
    const chatId = chat1.chat.id;

    // Ждем, пока client2 получит сообщение, чтобы убедиться, что оно создано
    const receivedMessage = await new Promise((resolve) => {
      client2.once("newMessage", resolve);
    });
    const messageId = (receivedMessage as any).message.id;
    assert.ok(messageId, "Message should have an id");

    // Оба клиента ждут событие messageDeleted
    const deletedForClient1 = new Promise((resolve) => {
      client1.once("messageDeleted", resolve);
    });
    const deletedForClient2 = new Promise((resolve) => {
      client2.once("messageDeleted", resolve);
    });

    // client1 удаляет сообщение
    client1.emit("deleteMessage", {
      messageId,
      chatId,
    });

    const [deleted1, deleted2] = (await Promise.all([
      deletedForClient1,
      deletedForClient2,
    ])) as [any, any];

    // Проверки: оба получили событие с success и правильным messageId
    assert.strictEqual(deleted1.success, true);
    assert.strictEqual(deleted1.messageId, messageId);
    assert.strictEqual(deleted2.success, true);
    assert.strictEqual(deleted2.messageId, messageId);

    client1.close();
    client2.close();
  });
}
