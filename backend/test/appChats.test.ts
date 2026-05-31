import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { resetForTests } from "../src/db.js";

describe("chat API", () => {
  const app = createApp();

  beforeEach(() => {
    resetForTests();
  });

  it("supports create/list/get/delete chat", async () => {
    const created = await request(app).post("/api/chats").send({ title: "A" }).expect(201);
    const id = created.body.id as string;

    const list = await request(app).get("/api/chats").expect(200);
    expect(list.body).toHaveLength(1);

    await request(app).get(`/api/chats/${id}`).expect(200);
    await request(app).delete(`/api/chats/${id}`).expect(204);
    await request(app).get(`/api/chats/${id}`).expect(404);
  });
});
