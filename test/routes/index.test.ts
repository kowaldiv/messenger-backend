import { test } from "node:test";
import { chatTest } from "./chat.test.js";
import { build } from "../helper.js";
import { authTest } from "./auth.test.js";
import { avatarTest } from "./avatar.test.js";
// import { messageTest } from "./message.test.js";

await test("App", async (t) => {
  const app = await build(t);
  await authTest(app);
  await chatTest(app);
  await avatarTest(app);
  // await messageTest(app);
});
