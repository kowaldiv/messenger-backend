import { describe, test } from "node:test";
import * as assert from "node:assert";
import {
  createAndConnectUser,
  createTestChat,
  sendMessageHelper,
} from "../../utils/test-helpers-socket.io.js";

export async function messageTest(app: any) {
  describe("Message", async () => {
    await test("Socket.IO - sendMessage to user", async () => {
      // Создаем двух пользователей
      const { client: client1, user: user1 } = await createAndConnectUser(app);
      const { client: client2, user: user2 } = await createAndConnectUser(app);

      // регистрируем слушателей
      const receivedPromise1 = new Promise((resolve) => {
        client1.on("newMessage", (data: any) => {
          resolve(data);
        });
      });
      const receivedPromise2 = new Promise((resolve) => {
        client2.on("newMessage", (data: any) => {
          resolve(data);
        });
      });

      // Отправляем сообщение от первого пользователя второму
      const messageText = "Hello from test!";
      client1.emit("sendMessage", {
        chatIdOrUserId: user2.id,
        text: messageText,
      });

      // Ждем результаты
      const received1 = await receivedPromise1;
      const received2 = await receivedPromise2;

      assert.ok(received1, "Should receive message");
      assert.equal((received1 as any).message.text, messageText);
      assert.equal((received1 as any).message.userId, user1.id);
      assert.ok(received2, "Should receive message");
      assert.equal((received2 as any).message.text, messageText);
      assert.equal((received2 as any).message.userId, user1.id);

      client1.close();
      client2.close();
    });

    test("create group, invite, join and send message", async () => {
      // Создаем трех пользователей
      const { client: client1 } = await createAndConnectUser(app);
      const { client: client2, user: user2 } = await createAndConnectUser(app);
      const { client: client3, user: user3 } = await createAndConnectUser(app);

      const chat = await createTestChat(client1);
      assert.ok(chat);

      const newPrivateChat1 = new Promise((resolve) => {
        client2.once("chat:new", resolve);
      });
      const newPrivateChat2 = new Promise((resolve) => {
        client3.once("chat:new", resolve);
      });

      await sendMessageHelper(client1, user2.id);
      await sendMessageHelper(client1, user3.id);

      const privateChat1 = await newPrivateChat1 as any;
      const privateChat2 = await newPrivateChat2 as any;

      assert.ok(privateChat1.chat.id);
      assert.ok(privateChat2.chat.id);

      // client1 ждет 2 сообщения
      const messagesForClient1: any[] = [];
      const newMessage1 = new Promise((resolve) => {
        client1.on("newMessage", (data) => {
          messagesForClient1.push(data);
          if (messagesForClient1.length === 2) resolve(messagesForClient1);
        });
      });

      const newMessage2 = new Promise((resolve) => {
        client2.once("newMessage", resolve);
      });
      const newMessage3 = new Promise((resolve) => {
        client3.once("newMessage", resolve);
      });

      client1.emit(
        "invite",
        {
          destinationChatId: chat.chat.id,
          chatIds: [privateChat1.chat.id, privateChat2.chat.id],
        },
      );

      const [messages1, message2, message3] = (await Promise.all([
        newMessage1,
        newMessage2,
        newMessage3,
      ])) as [any[], any, any];
      // Проверки
      assert.strictEqual(
        messages1.length,
        2,
        "Client1 should receive 2 messages",
      );
      // Дополнительно: проверяем, что оба сообщения относятся к нужному чату
      assert.strictEqual(messages1[0].message.metadata.chat.id, chat.chat.id);
      assert.strictEqual(messages1[1].message.metadata.chat.id, chat.chat.id);

      // Проверяем, что client2 и client3 получили по одному сообщению
      assert.ok(message2, "Client2 should receive a message");
      assert.ok(message3, "Client3 should receive a message");
      // При желании можно проверить chatId и у них
      const inviteTokenClient2 = message2.message.metadata.token;
      const inviteTokenClient3 = message3.message.metadata.token;
      // console.log(inviteTokenClient2, inviteTokenClient3);

      const newChat1 = new Promise((resolve) => {
        client2.once("chat:new", resolve);
      });
      const newChat2 = new Promise((resolve) => {
        client3.once("chat:new", resolve);
      });

      client2.emit(
        "joinChat",
        {
          inviteLinkToken: inviteTokenClient2,
        },
      );
      client3.emit(
        "joinChat",
        {
          inviteLinkToken: inviteTokenClient3,
        },
      );

      const [chat1, chat2] = (await Promise.all([newChat1, newChat2])) as [
        any,
        any,
      ];
      // console.log(chat1);

      assert.strictEqual(chat1.chat.id, chat.chat.id);
      assert.strictEqual(chat2.chat.id, chat.chat.id);

      const newMessageInGroup1 = new Promise((resolve) => {
        client1.once("newMessage", resolve);
      });
      const newMessageInGroup2 = new Promise((resolve) => {
        client2.once("newMessage", resolve);
      });
      const newMessageInGroup3 = new Promise((resolve) => {
        client3.once("newMessage", resolve);
      });

      const messageText = "I joined to group!";
      client3.emit(
        "sendMessage",
        {
          chatIdOrUserId: chat2.chat.id,
          text: messageText,
        },
      );

      const [messageInGroup1, messageInGroup2, messageInGroup3] =
        (await Promise.all([
          newMessageInGroup1,
          newMessageInGroup2,
          newMessageInGroup3,
        ])) as [any, any, any];

      assert.strictEqual(messageInGroup1.message.text, messageText);
      assert.strictEqual(messageInGroup2.message.text, messageText);
      assert.strictEqual(messageInGroup3.message.text, messageText);

      client1.close();
      client2.close();
      client3.close();
    });
  });
}
