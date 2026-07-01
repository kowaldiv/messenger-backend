import { describe, test } from "node:test";
import * as assert from "node:assert";
import { registerTestUser } from "../../utils/test-helpers.js";

export async function userTest(app: any) {
  describe("User", async () => {
    await test("GET /user/getInfo", async () => {
      const { accessToken } = await registerTestUser(app);

      const res = await app.inject({
        method: "GET",
        url: "/user/getInfo",
        cookies: {
          access_token: accessToken,
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.ok(data);
      assert.ok(data.id);
    });

    await test("POST /user/updateProfile", async () => {
      const { accessToken, user } = await registerTestUser(app);
      const timestamp = Date.now();
      const res = await app.inject({
        method: "POST",
        url: "/user/updateProfile",
        cookies: {
          access_token: accessToken,
        },
        payload: {
          username: `updatedUsername-${timestamp}`,
          firstName: "updatedFirstName",
          lastName: "updatedLastName",
          bio: "updatedBio",
        },
      });

      assert.equal(res.statusCode, 200);

      const res2 = await app.inject({
        method: "GET",
        url: "/user/getInfo",
        cookies: {
          access_token: accessToken,
        },
      });
      const data2 = JSON.parse(res2.payload);
      assert.equal(user.username === data2.username, false);
    });

    await test("POST /user/updateLastSeen", async () => {
      const { accessToken, user } = await registerTestUser(app);

      const res = await app.inject({
        method: "POST",
        url: "/user/updateLastSeen",
        cookies: {
          access_token: accessToken,
        },
      });
      assert.equal(res.statusCode, 200);

      const res2 = await app.inject({
        method: "GET",
        url: "/user/getInfo",
        cookies: {
          access_token: accessToken,
        },
      });
      const data2 = JSON.parse(res2.payload);
      assert.equal(user.lastSeen === data2.lastSeen, false);
    });
  });
}
