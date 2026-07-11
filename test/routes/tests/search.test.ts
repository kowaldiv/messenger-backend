import { test } from "node:test";
import * as assert from "node:assert";
import { registerTestUser } from "../../utils/test-helpers.js";

export async function searchTest(app: any) {
  test("search", async () => {
    const { accessToken } = await registerTestUser(app);

    const res = await app.inject({
      method: "POST",
      url: "/search",
      cookies: {
        access_token: accessToken,
      },
      payload: {
        pattern: "ko"
      },
    });

    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.payload);
    assert.ok(data);
  });
}
